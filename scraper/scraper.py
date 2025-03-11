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
from selenium.common.exceptions import WebDriverException

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fetch_html(browser="chrome", retries=2):
    """Fetch the dynamically loaded HTML content using Selenium with the specified browser."""
    start_time = time.time()
    url = "https://www.ivena-niedersachsen.de/leitstellenansicht.php"

    # Safari user-agent to simulate Safari rendering if needed
    safari_user_agent = (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 "
        "(KHTML, like Gecko) Version/17.5 Safari/605.1.15"
    )

    # Optimized options for Chrome to reduce memory usage
    chrome_options = [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-images",
        "--blink-settings=imagesEnabled=false",
        "--disable-extensions",
        "--window-size=800,600",
        "--disable-background-networking",
        "--disable-background-timer-throttling",
        "--disable-client-side-phishing-detection",
        "--disable-default-apps",
        "--disable-hang-monitor",
        "--disable-prompt-on-repost",
        "--disable-sync",
        "--disable-translate",
        "--metrics-recording-only",
        "--no-first-run",
        "--safebrowsing-disable-auto-update",
        "--disable-javascript-harmony-shipping",
        "--disable-renderer-backgrounding",
        "--single-process",
        "--disable-dev-tools",
        "--disable-logging",
        "--disable-notifications",
        "--mute-audio",
        "--disable-software-rasterizer",
        "--disable-features=TranslateUI",
        "--no-zygote",
        "--enable-logging",  # Enable Chrome logging for debugging
        "--v=1",  # Verbose logging
        "--log-path=/tmp/chrome.log"  # Save logs to a file
    ]

    options = None
    service = None
    driver_class = None
    use_safari_user_agent = False

    try:
        # Check if we're on macOS and Safari is requested
        is_macos = platform.system().lower() == "darwin"
        if browser.lower() == "safari":
            if is_macos:
                options = SafariOptions()
                driver_class = webdriver.Safari
                logger.info("Initializing Safari driver on macOS...")
            else:
                logger.warning("Safari is not supported on non-macOS systems. Falling back to Chrome with Safari user-agent.")
                options = ChromeOptions()
                chromedriver_path = ChromeDriverManager().install()
                subprocess.run(["chmod", "+x", chromedriver_path], check=True)
                service = ChromeService(chromedriver_path)
                driver_class = webdriver.Chrome
                use_safari_user_agent = True
                logger.info("Initializing Chrome driver with Safari user-agent...")
        else:
            options = ChromeOptions()
            chromedriver_path = ChromeDriverManager().install()
            subprocess.run(["chmod", "+x", chromedriver_path], check=True)
            service = ChromeService(chromedriver_path)
            driver_class = webdriver.Chrome
            logger.info("Initializing Chrome driver...")

        # Apply Chrome options if using Chrome
        if isinstance(options, ChromeOptions):
            for arg in chrome_options:
                options.add_argument(arg)
            if use_safari_user_agent:
                options.add_argument(f"--user-agent={safari_user_agent}")

        # Initialize the driver
        driver = driver_class(service=service, options=options) if service else driver_class(options=options)
        logger.info(f"Driver initialized in {time.time() - start_time:.2f} seconds")

    except Exception as e:
        logger.error(f"Error initializing driver for {browser}: {e}")
        if "disconnected" in str(e).lower() or "session deleted" in str(e).lower():
            logger.error("Chrome likely crashed during initialization. Consider increasing memory or optimizing options.")
        return "<h1>Error: Could not initialize browser driver. Please try again later.</h1>"

    try:
        # Retry loading the URL in case of transient failures
        for attempt in range(retries):
            try:
                logger.info(f"Loading URL (attempt {attempt + 1}/{retries})...")
                driver.get(url)
                logger.info(f"URL loaded in {time.time() - start_time:.2f} seconds")
                break  # Success, exit the retry loop
            except WebDriverException as e:
                logger.warning(f"Failed to load URL on attempt {attempt + 1}: {e}")
                if attempt == retries - 1:  # Last attempt
                    raise e
                time.sleep(1)  # Wait before retrying

        # Use WebDriverWait for dynamic content
        wait = WebDriverWait(driver, 10)
        region_select = wait.until(EC.presence_of_element_located((By.ID, "anonymous_oe")))
        Select(region_select).select_by_visible_text("Region Hannover")
        logger.info(f"Region selected in {time.time() - start_time:.2f} seconds")

        subject_area_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Innere Medizin")))
        subject_area_link.click()
        logger.info(f"Subject area clicked in {time.time() - start_time:.2f} seconds")

        department_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Allgemeine Innere Medizin")))
        department_link.click()
        logger.info(f"Department clicked in {time.time() - start_time:.2f} seconds")

        html_content = driver.execute_script("return document.documentElement.outerHTML")
        logger.info(f"HTML retrieved in {time.time() - start_time:.2f} seconds")

        # Debugging output
        logger.info("===== ORIGINAL HTML SNIPPET (AFTER JS) =====")
        soup = BeautifulSoup(html_content, 'html.parser')
        logger.info([tag['src'] for tag in soup.find_all(src=True)][:10])
        logger.info("=================================")

        # Modify HTML using BeautifulSoup
        soup = BeautifulSoup(html_content, 'html.parser')
        for tag in soup.find_all(src=True):
            if tag['src'].startswith('/bilder/'):
                tag['src'] = tag['src'].replace('/bilder/', '/static/images/')
            elif tag['src'].startswith('/layout/js/'):
                tag['src'] = tag['src'].replace('/layout/js/', '/static/js/')
        for tag in soup.find_all(href=True):
            if tag['href'].startswith('/layout/themes/standard/'):
                tag['href'] = tag['href'].replace('/layout/themes/standard/', '/static/css/')

        modified_html = str(soup)

        # Debugging output after modification
        logger.info("===== MODIFIED HTML SNIPPET =====")
        logger.info([tag['src'] for tag in BeautifulSoup(modified_html, 'html.parser').find_all(src=True)][:10])
        logger.info("=================================")

    except Exception as e:
        logger.error(f"Error during scraping: {e}")
        # Check for Chrome logs if they exist
        if os.path.exists("/tmp/chrome.log"):
            with open("/tmp/chrome.log", "r") as log_file:
                chrome_logs = log_file.read()
                logger.error(f"Chrome logs:\n{chrome_logs}")
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