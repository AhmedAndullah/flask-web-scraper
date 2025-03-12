from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.safari.options import Options as SafariOptions
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import os
import logging
import subprocess
import time
import platform
import shutil
import glob
from selenium.common.exceptions import WebDriverException

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_chromedriver_path():
    """Find the correct ChromeDriver binary inside the webdriver-manager cache."""
    chromedriver_dir = ChromeDriverManager().install()  # Download & get directory

    # Look for the actual `chromedriver` binary inside the extracted directory
    possible_binaries = glob.glob(os.path.join(chromedriver_dir, "**", "chromedriver"), recursive=True)

    if not possible_binaries:
        raise FileNotFoundError("ChromeDriver binary not found!")

    chromedriver_path = possible_binaries[0]  # Use the first valid binary found
    os.chmod(chromedriver_path, 0o755)  # Ensure it's executable
    return chromedriver_path

def fetch_html(browser="chrome", retries=2):
    """Fetch the dynamically loaded HTML content using Selenium with the specified browser."""
    start_time = time.time()
    url = "https://www.ivena-niedersachsen.de/leitstellenansicht.php"

    # Safari user-agent to simulate Safari rendering if needed
    safari_user_agent = (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 "
        "(KHTML, like Gecko) Version/17.5 Safari/605.1.15"
    )

    os.environ['WDM_LOG_LEVEL'] = '0'  # Disable WebDriver Manager logs
    chrome_options = [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--window-size=800,600"
    ]   

    options = None
    service = None
    driver_class = None
    use_safari_user_agent = False

    try:
        is_macos = platform.system().lower() == "darwin"
        if browser.lower() == "safari":
            if is_macos:
                options = SafariOptions()
                driver_class = webdriver.Safari
                logger.info("Initializing Safari driver on macOS...")
            else:
                logger.warning("Safari is not supported on non-macOS systems. Falling back to Chrome with Safari user-agent.")
                options = ChromeOptions()
                chromedriver_path = get_chromedriver_path()
                service = ChromeService(chromedriver_path)

                driver_class = webdriver.Chrome
                use_safari_user_agent = True
                logger.info("Initializing Chrome driver with Safari user-agent...")

        else:
            options = ChromeOptions()
            chromedriver_path = get_chromedriver_path()
            service = ChromeService(chromedriver_path)

            driver_class = webdriver.Chrome
            logger.info(f"Using ChromeDriver from: {chromedriver_path}")

        if isinstance(options, ChromeOptions):
            for arg in chrome_options:
                options.add_argument(arg)
            if use_safari_user_agent:
                options.add_argument(f"--user-agent={safari_user_agent}")

        driver = driver_class(service=service, options=options) if service else driver_class(options=options)
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

        for tag in soup.find_all(src=True):
            if tag['src'].startswith('/bilder/'):
                tag['src'] = tag['src'].replace('/bilder/', '/static/images/')
            elif tag['src'].startswith('/layout/js/'):
                tag['src'] = tag['src'].replace('/layout/js/', '/static/js/')
        for tag in soup.find_all(href=True):
            if tag['href'].startswith('/layout/themes/standard/'):
                tag['href'] = tag['href'].replace('/layout/themes/standard/', '/static/css/')

        modified_html = str(soup)

        logger.info("===== MODIFIED HTML SNIPPET =====")
        logger.info([tag['src'] for tag in BeautifulSoup(modified_html, 'html.parser').find_all(src=True)][:10])
        logger.info("=================================")

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
