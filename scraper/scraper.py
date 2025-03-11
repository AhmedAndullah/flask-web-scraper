from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.support.ui import Select
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from bs4 import BeautifulSoup
import os
import logging
import subprocess

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fetch_html(browser="chrome"):  # Default to Chrome
    """Fetch the dynamically loaded HTML content using Selenium with the specified browser."""
    url = "https://www.ivena-niedersachsen.de/leitstellenansicht.php"

    # Common options for all browsers
    common_options = [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-images",
        "--blink-settings=imagesEnabled=false",
        "--disable-extensions",
        "--window-size=1920,1080"
    ]

    options = None
    service = None
    driver_class = None

    try:
        if browser.lower() == "chrome":
            options = ChromeOptions()
            chromedriver_path = ChromeDriverManager(version="latest").install()
            # Ensure chromedriver is executable
            subprocess.run(["chmod", "+x", chromedriver_path], check=True)
            service = ChromeService(chromedriver_path)
            driver_class = webdriver.Chrome
            logger.info("Initializing Chrome driver...")

        elif browser.lower() == "edge":
            options = EdgeOptions()
            chromedriver_path = EdgeChromiumDriverManager().install()
            subprocess.run(["chmod", "+x", chromedriver_path], check=True)
            service = EdgeService(chromedriver_path)
            driver_class = webdriver.Edge
            logger.info("Initializing Edge driver...")

        elif browser.lower() == "firefox":
            options = FirefoxOptions()
            geckodriver_path = GeckoDriverManager().install()
            subprocess.run(["chmod", "+x", geckodriver_path], check=True)
            service = FirefoxService(geckodriver_path)
            driver_class = webdriver.Firefox
            logger.info("Initializing Firefox driver...")

        elif browser.lower() == "opera":
            logger.warning("Opera not directly supported, using Chrome settings instead.")
            options = ChromeOptions()
            chromedriver_path = ChromeDriverManager(version="latest").install()
            subprocess.run(["chmod", "+x", chromedriver_path], check=True)
            service = ChromeService(chromedriver_path)
            driver_class = webdriver.Chrome

        else:
            logger.warning(f"Unsupported browser '{browser}', defaulting to Chrome.")
            options = ChromeOptions()
            chromedriver_path = ChromeDriverManager(version="latest").install()
            subprocess.run(["chmod", "+x", chromedriver_path], check=True)
            service = ChromeService(chromedriver_path)
            driver_class = webdriver.Chrome

        # Apply common options after initializing options
        for arg in common_options:
            options.add_argument(arg)

        # Initialize the driver
        driver = driver_class(service=service, options=options)

    except Exception as e:
        logger.error(f"Error initializing driver for {browser}: {e}")
        return "<h1>Error: Could not initialize browser driver. Please try again later.</h1>"

    try:
        driver.get(url)

        # Use WebDriverWait for dynamic content
        wait = WebDriverWait(driver, 10)
        region_select = wait.until(EC.presence_of_element_located((By.ID, "anonymous_oe")))
        Select(region_select).select_by_visible_text("Region Hannover")

        subject_area_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Innere Medizin")))
        subject_area_link.click()

        department_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Allgemeine Innere Medizin")))
        department_link.click()

        html_content = driver.execute_script("return document.documentElement.outerHTML")

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
        modified_html = "<h1>Error: Could not load content. Please try again later.</h1>"

    finally:
        driver.quit()

    return modified_html

if __name__ == "__main__":
    browser = os.getenv("BROWSER", "chrome")
    logger.info(f"Using browser: {browser}")
    html_content = fetch_html(browser)
    with open("output.html", "w", encoding="utf-8") as f:
        f.write(html_content)