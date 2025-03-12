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
from selenium.common.exceptions import WebDriverException

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_chromedriver_path():
    """Find the correct ChromeDriver binary inside the webdriver-manager cache."""
    # Get the base directory from WebDriver Manager
    base_dir = ChromeDriverManager().install()
    logger.info(f"Initial ChromeDriver base directory: {base_dir}")

    # Ensure we are working with the correct directory (parent of any file)
    if os.path.isfile(base_dir):
        base_dir = os.path.dirname(base_dir)
    logger.info(f"Adjusted ChromeDriver base directory: {base_dir}")

    # Look for the chromedriver binary explicitly
    possible_binaries = glob.glob(os.path.join(base_dir, "**", "chromedriver"), recursive=True)
    logger.info(f"Possible binaries found: {possible_binaries}")

    # Filter to find the actual executable
    actual_binaries = [
        path for path in possible_binaries
        if os.path.isfile(path) and os.access(path, os.X_OK)  # Check if executable
    ]

    if not actual_binaries:
        raise FileNotFoundError(f"ChromeDriver binary not found in {base_dir}")

    chromedriver_path = actual_binaries[0]  # Use the first valid executable found
    os.chmod(chromedriver_path, 0o755)  # Ensure it's executable
    logger.info(f"Using ChromeDriver from: {chromedriver_path}")
    return chromedriver_path

def fetch_html(browser="chrome", retries=2):
    """Fetch the dynamically loaded HTML content using Selenium with the specified browser."""
    start_time = time.time()
    url = "https://www.ivena-niedersachsen.de/leitstellenansicht.php"

    os.environ['WDM_LOG_LEVEL'] = '0'  # Disable WebDriver Manager logs
    chrome_options = [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--window-size=800,600"
    ]

    try:
        options = ChromeOptions()
        options.binary_location = "/usr/bin/google-chrome"  # Point to Chrome binary
        chromedriver_path = get_chromedriver_path()
        logger.info(f"ChromeDriver path passed to service: {chromedriver_path}")  # Debug the exact path
        service = ChromeService(executable_path=chromedriver_path)  # Explicitly pass the executable path
        driver = webdriver.Chrome(service=service, options=options)

        for arg in chrome_options:
            options.add_argument(arg)

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
        driver.quit()
        logger.info(f"Total scraping time: {time.time() - start_time:.2f} seconds")

    return modified_html

if __name__ == "__main__":
    browser = os.getenv("BROWSER", "chrome")
    logger.info(f"Using browser: {browser}")
    html_content = fetch_html(browser)
    with open("output.html", "w", encoding="utf-8") as f:
        f.write(html_content)