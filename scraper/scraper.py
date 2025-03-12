from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import requests
import os
import logging
import time
import tempfile

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fetch_html(use_selenium=True, retries=3):
    """Fetch the dynamically loaded HTML content using Selenium or requests."""
    start_time = time.time()
    url = "https://www.ivena-niedersachsen.de/leitstellenansicht.php"

    # Create a unique user data directory for this session
    user_data_dir = tempfile.mkdtemp()
    logger.info(f"Using user data directory: {user_data_dir}")

    html_content = "<h1>Error: Could not load content. Please try again later.</h1>"
    
    # Try with requests first (lighter memory footprint)
    for attempt in range(retries):
        try:
            logger.info(f"Loading URL with requests (attempt {attempt + 1}/{retries})...")
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            html_content = response.text
            logger.info(f"URL loaded with requests in {time.time() - start_time:.2f} seconds")
            break
        except Exception as e:
            logger.error(f"Error loading URL with requests on attempt {attempt + 1}: {e}")
            if attempt < retries - 1:
                time.sleep(2)
            else:
                logger.error(f"Failed to load URL with requests after all retries: {e}")
                break

    # Use Selenium if requests fails or if explicitly enabled
    if (use_selenium and html_content.startswith("<h1>Error")) or (use_selenium and not html_content):
        # Selenium with Firefox in headless mode
        firefox_options = Options()
        firefox_options.add_argument("--headless")
        firefox_options.add_argument("--no-sandbox")
        firefox_options.add_argument("--disable-dev-shm-usage")

        # Configure geckodriver service
        service = Service(log_output=os.devnull)  # Suppress logs

        for attempt in range(retries):
            driver = None
            try:
                driver = webdriver.Firefox(
                    options=firefox_options,
                    service=service
                )
                logger.info(f"Driver initialized in {time.time() - start_time:.2f} seconds")
                logger.info(f"Loading URL with Selenium (attempt {attempt + 1}/{retries})...")

                # Set page load timeout
                driver.set_page_load_timeout(60)  # 60-second timeout

                # Navigate to the URL
                driver.get(url)
                logger.info(f"URL loaded in {time.time() - start_time:.2f} seconds")

                # Temporarily disable clicks to isolate page load issue
                """
                # Wait for and click region
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.ID, "anonymous_oe"))
                )
                region_select = driver.find_element(By.ID, "anonymous_oe")
                region_select.click()
                logger.info(f"Region selected in {time.time() - start_time:.2f} seconds")

                # Wait for and click subject area
                WebDriverWait(driver, 10).until(
                    EC.visibility_of_element_located((By.LINK_TEXT, "Innere Medizin"))
                )
                subject_area_link = driver.find_element(By.LINK_TEXT, "Innere Medizin")
                subject_area_link.click()
                logger.info(f"Subject area clicked in {time.time() - start_time:.2f} seconds")

                # Wait for and click department
                WebDriverWait(driver, 10).until(
                    EC.visibility_of_element_located((By.LINK_TEXT, "Allgemeine Innere Medizin"))
                )
                department_link = driver.find_element(By.LINK_TEXT, "Allgemeine Innere Medizin")
                department_link.click()
                logger.info(f"Department clicked in {time.time() - start_time:.2f} seconds")
                """

                # Get the final HTML content
                html_content = driver.page_source
                logger.info(f"HTML retrieved in {time.time() - start_time:.2f} seconds")

                # Close the driver
                driver.quit()
                break

            except Exception as e:
                logger.error(f"Error loading URL with Selenium on attempt {attempt + 1}: {e}")
                if attempt < retries - 1:
                    time.sleep(2)
                else:
                    logger.error(f"Failed to load URL with Selenium after all retries: {e}")
                    if driver:
                        driver.quit()

    # Process HTML with BeautifulSoup
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

    # Clean up the user data directory
    if os.path.exists(user_data_dir):
        import shutil
        shutil.rmtree(user_data_dir, ignore_errors=True)
        logger.info(f"Cleaned up user data directory: {user_data_dir}")
    logger.info(f"Total scraping time: {time.time() - start_time:.2f} seconds")

    return modified_html

if __name__ == "__main__":
    use_selenium = os.getenv("USE_SELENIUM", "true").lower() == "true"
    logger.info(f"Using Selenium: {use_selenium}")
    html_content = fetch_html(use_selenium=use_selenium)
    with open("output.html", "w", encoding="utf-8") as f:
        f.write(html_content)