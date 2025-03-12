from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options as ChromeOptions
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import os
import logging
import time
import glob
import tempfile
from selenium.common.exceptions import WebDriverException, TimeoutException, InvalidSessionIdException

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_chromedriver_path(max_retries=3):
    """Find the correct ChromeDriver binary inside the webdriver-manager cache with retries."""
    for attempt in range(max_retries):
        try:
            # Get the base directory from WebDriver Manager
            base_dir = ChromeDriverManager().install()
            logger.info(f"Attempt {attempt + 1}/{max_retries}: Initial ChromeDriver base directory: {base_dir}")

            # Ensure we are working with the correct directory (parent of any file)
            if os.path.isfile(base_dir):
                base_dir = os.path.dirname(base_dir)
            logger.info(f"Attempt {attempt + 1}/{max_retries}: Adjusted ChromeDriver base directory: {base_dir}")

            # Look for the chromedriver binary explicitly
            possible_binaries = glob.glob(os.path.join(base_dir, "**", "chromedriver"), recursive=True)
            logger.info(f"Attempt {attempt + 1}/{max_retries}: Possible binaries found: {possible_binaries}")

            # Filter to find the actual executable
            actual_binaries = []
            for path in possible_binaries:
                if not os.path.isfile(path):
                    continue
                # Ensure the file has executable permissions before checking
                os.chmod(path, 0o755)  # Set executable permissions
                # Log the file's permissions for debugging
                file_stat = os.stat(path)
                logger.info(f"Attempt {attempt + 1}/{max_retries}: Permissions for {path}: {oct(file_stat.st_mode & 0o777)}")
                # Check if executable
                if os.access(path, os.X_OK):
                    actual_binaries.append(path)
                else:
                    logger.warning(f"Attempt {attempt + 1}/{max_retries}: {path} is not executable, attempting to use anyway")
                    actual_binaries.append(path)  # Fallback: use the file even if not marked as executable

            if actual_binaries:
                chromedriver_path = actual_binaries[0]  # Use the first valid executable found
                logger.info(f"Attempt {attempt + 1}/{max_retries}: Using ChromeDriver from: {chromedriver_path}")
                return chromedriver_path
            else:
                logger.warning(f"Attempt {attempt + 1}/{max_retries}: No executable found, retrying...")
                time.sleep(1)  # Wait before retrying
        except Exception as e:
            logger.error(f"Attempt {attempt + 1}/{max_retries}: Error finding ChromeDriver: {e}")
            if attempt < max_retries - 1:
                time.sleep(1)
            else:
                raise

    raise FileNotFoundError(f"ChromeDriver binary not found after {max_retries} attempts in {base_dir}")

def fetch_html(browser="chrome", retries=3):
    """Fetch the dynamically loaded HTML content using Selenium with the specified browser."""
    start_time = time.time()
    url = "https://www.ivena-niedersachsen.de/leitstellenansicht.php"

    os.environ['WDM_LOG_LEVEL'] = '0'  # Disable WebDriver Manager logs
    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=300,200")  # Further reduced window size
    chrome_options.add_argument("--no-first-run")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-default-apps")
    chrome_options.add_argument("--disable-background-networking")
    chrome_options.add_argument("--disable-sync")
    chrome_options.add_argument("--disable-translate")
    chrome_options.add_argument("--disable-background-timer-throttling")
    chrome_options.add_argument("--disable-client-side-phishing-detection")
    chrome_options.add_argument("--disable-hang-monitor")
    chrome_options.add_argument("--single-process")
    chrome_options.add_argument("--disable-dev-tools")
    chrome_options.add_argument("--disable-logging")
    chrome_options.add_argument("--mute-audio")  # Disable audio to save resources

    # Create a unique user data directory for this session
    user_data_dir = tempfile.mkdtemp()
    logger.info(f"Using user data directory: {user_data_dir}")
    chrome_options.add_argument(f"--user-data-dir={user_data_dir}")

    driver = None
    try:
        chromedriver_path = get_chromedriver_path()
        logger.info(f"ChromeDriver path passed to service: {chromedriver_path}")
        service = ChromeService(executable_path=chromedriver_path)
        driver = webdriver.Chrome(service=service, options=chrome_options)

        # Set a page load timeout
        driver.set_page_load_timeout(25)  # Reduced to 25 seconds

        logger.info(f"Driver initialized in {time.time() - start_time:.2f} seconds")

    except Exception as e:
        logger.error(f"Error initializing driver for {browser}: {e}")
        return "<h1>Error: Could not initialize browser driver. Please try again later.</h1>"

    try:
        for attempt in range(retries):
            try:
                logger.info(f"Loading URL (attempt {attempt + 1}/{retries})...")
                driver.get(url)
                logger.info(f"URL loaded in {time.time() - start_time:.2f} seconds")
                break
            except (TimeoutException, InvalidSessionIdException) as e:
                logger.warning(f"Error loading URL on attempt {attempt + 1}: {e}")
                if attempt < retries - 1:
                    # Reinitialize driver on session invalidation
                    if driver:
                        driver.quit()
                    user_data_dir = tempfile.mkdtemp()
                    chrome_options.add_argument(f"--user-data-dir={user_data_dir}")
                    driver = webdriver.Chrome(service=service, options=chrome_options)
                    driver.set_page_load_timeout(25)
                    time.sleep(1)  # Wait before retrying
                else:
                    raise WebDriverException("Failed to load URL after all retries")
            except WebDriverException as e:
                logger.warning(f"Failed to load URL on attempt {attempt + 1}: {e}")
                if attempt == retries - 1:
                    raise e
                time.sleep(1)

        wait = WebDriverWait(driver, 10)
        region_select = wait.until(EC.presence_of_element_located((By.ID, "anonymous_oe")))
        region_select.click()
        logger.info(f"Region selected in {time.time() - start_time:.2f} seconds")

        subject_area_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Innere Medizin")))
        subject_area_link.click()
        logger.info(f"Subject area clicked in {time.time() - start_time:.2f} seconds")

        department_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Allgemeine Innere Medizin")))
        department_link.click()
        logger.info(f"Department clicked in {time.time() - start_time:.2f} seconds")

        html_content = driver.execute_script("return document.documentElement.outerHTML")
        logger.info(f"HTML retrieved in {time.time() - start_time:.2f} seconds")

        soup = BeautifulSoup(html_content, 'html.parser')
        logger.info("===== ORIGINAL HTML SNIPPET (AFTER JS) =====")
        logger.info([tag['src'] for tag in soup.find_all(src=True)][:10])
        logger.info("=================================")

        # Adjust paths for static assets
        for tag in soup.find_all(src=True):
            if tag['src'].startswith('/bilder/'):
                tag['src'] = tag['src'].replace('/bilder/', '/static/images/')
            elif tag['src'].startswith('/layout/js/'):
                tag['src'] = tag['src'].replace('/layout/js/', '/static/js/')
        for tag in soup.find_all(href=True):
            if tag['href'].startswith('/layout/themes/standard/'):
                tag['href'] = tag['href'].replace('/layout/themes/standard/', '/static/css/')

        modified_html = str(soup)

    except Exception as e:
        logger.error(f"Error during scraping: {e}")
        modified_html = "<h1>Error: Could not load content. Please try again later.</h1>"

    finally:
        if driver:
            driver.quit()
        # Clean up the user data directory
        if os.path.exists(user_data_dir):
            import shutil
            shutil.rmtree(user_data_dir, ignore_errors=True)
            logger.info(f"Cleaned up user data directory: {user_data_dir}")
        logger.info(f"Total scraping time: {time.time() - start_time:.2f} seconds")

    return modified_html

if __name__ == "__main__":
    browser = os.getenv("BROWSER", "chrome")
    logger.info(f"Using browser: {browser}")
    html_content = fetch_html(browser)
    with open("output.html", "w", encoding="utf-8") as f:
        f.write(html_content)