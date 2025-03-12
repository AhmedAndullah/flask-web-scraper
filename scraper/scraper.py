from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.proxy import Proxy, ProxyType
from bs4 import BeautifulSoup
import requests
import os
import logging
import time
import tempfile
import random
import shutil

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# List of user agents for rotation
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
]

def fetch_html(use_selenium=True, retries=3):
    """Fetch the dynamically loaded HTML content using Selenium or requests with proxy support."""
    start_time = time.time()
    url = "https://www.ivena-niedersachsen.de/leitstellenansicht.php"

    # Create a unique user data directory for this session
    user_data_dir = tempfile.mkdtemp()
    logger.info(f"Using user data directory: {user_data_dir}")

    html_content = "<h1>Error: Could not load content. Please try again later.</h1>"
    
    # Hardcoded list of proxies (replace with working proxies or use a paid service)
    proxies = [
        "3.127.62.252:80",  # Update with working proxies
        "188.68.52.244:80",
        "23.88.116.40:80"
    ]
    logger.info(f"Available proxies: {proxies}")

    # Headers to mimic a real browser
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Referer": "https://www.google.com/",
        "Cache-Control": "no-cache"
    }

    # Try with requests first (lighter memory footprint) with proxy
    for attempt in range(retries):
        for proxy in proxies:
            try:
                logger.info(f"Loading URL with requests (attempt {attempt + 1}/{retries}, proxy: {proxy})...")
                proxies_dict = {"http": f"http://{proxy}", "https": f"http://{proxy}"}
                response = requests.get(url, timeout=60, proxies=proxies_dict, headers=headers, verify=False)
                response.raise_for_status()
                html_content = response.text
                logger.info(f"URL loaded with requests in {time.time() - start_time:.2f} seconds")
                # Check if content is valid (avoid error pages)
                if "REMOTE_ADDR" in html_content or "Error: Could not load content" in html_content:
                    logger.warning("Detected error page with requests, proceeding to Selenium...")
                else:
                    logger.info("Successfully loaded content with requests")
                    return html_content  # Exit early if successful
            except Exception as e:
                logger.error(f"Error loading URL with requests (proxy: {proxy}) on attempt {attempt + 1}: {e}")
                if attempt == retries - 1 and proxy == proxies[-1]:
                    logger.error(f"Failed to load URL with requests after all retries and proxies: {e}")
                time.sleep(random.uniform(2, 5))  # Add delay between retries
                continue

    # Use Selenium if enabled or if requests failed
    if use_selenium or "Error: Could not load content" in html_content:
        firefox_options = Options()
        firefox_options.add_argument("--headless")
        firefox_options.add_argument("--no-sandbox")
        firefox_options.add_argument("--disable-dev-shm-usage")
        firefox_options.add_argument("--disable-gpu")
        firefox_options.add_argument(f"user-agent={random.choice(USER_AGENTS)}")
        firefox_options.add_argument("--window-size=1920,1080")  # Simulate a real browser window
        firefox_options.add_argument("--disable-blink-features=AutomationControlled")  # Hide Selenium automation flag

        proxy = random.choice(proxies) if proxies else None
        if proxy:
            proxy_obj = Proxy()
            proxy_obj.proxy_type = ProxyType.MANUAL
            proxy_obj.http_proxy = proxy
            proxy_obj.ssl_proxy = proxy
            firefox_options.proxy = proxy_obj
            logger.info(f"Using Selenium with proxy: {proxy}")

        # Configure geckodriver service
        service = Service(executable_path="/usr/local/bin/geckodriver", log_output=os.devnull)

        for attempt in range(retries):
            driver = None
            try:
                driver = webdriver.Firefox(
                    options=firefox_options,
                    service=service
                )
                logger.info(f"Driver initialized in {time.time() - start_time:.2f} seconds")
                logger.info(f"Loading URL with Selenium (attempt {attempt + 1}/{retries}, proxy: {proxy})...")

                driver.set_page_load_timeout(120)
                driver.get(url)
                logger.info(f"URL loaded in {time.time() - start_time:.2f} seconds")

                # Check for Cloudflare CAPTCHA or error page
                try:
                    WebDriverWait(driver, 5).until(
                        EC.presence_of_element_located((By.TAG_NAME, "iframe"))
                    )
                    logger.warning("Cloudflare iframe detected; automation may fail without paid proxy")
                    html_content = driver.page_source
                    driver.quit()
                    break
                except Exception as e:
                    logger.info(f"No Cloudflare iframe or timed out: {e}")

                # Wait for body to ensure page loads
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )
                logger.info(f"Body element loaded in {time.time() - start_time:.2f} seconds")

                # Check for error page content
                body_text = driver.find_element(By.TAG_NAME, 'body').text
                if "REMOTE_ADDR" in body_text:
                    logger.warning("Detected error page with REMOTE_ADDR; likely blocked by anti-scraping measures")
                    html_content = driver.page_source
                    driver.quit()
                    break

                # Add random delays to mimic human behavior
                time.sleep(random.uniform(2, 5))

                # Reintroduce clicks with robust selectors and fallback
                region_selected = False
                try:
                    region_select = WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.XPATH, "//*[@id='anonymous_oe' or @name='anonymous_oe']"))
                    )
                    region_select.click()
                    logger.info(f"Region selected in {time.time() - start_time:.2f} seconds")
                    region_selected = True
                    time.sleep(random.uniform(2, 4))
                except Exception as e:
                    logger.error(f"Error finding region_select: {e}")
                    logger.info("Skipping region selection due to error")

                if region_selected:
                    try:
                        subject_area_link = WebDriverWait(driver, 10).until(
                            EC.element_to_be_clickable((By.XPATH, "//a[text()='Innere Medizin']"))
                        )
                        subject_area_link.click()
                        logger.info(f"Subject area clicked in {time.time() - start_time:.2f} seconds")
                        time.sleep(random.uniform(2, 4))
                    except Exception as e:
                        logger.error(f"Error finding subject_area_link: {e}")
                        logger.info("Skipping subject area click due to error")

                    try:
                        department_link = WebDriverWait(driver, 10).until(
                            EC.element_to_be_clickable((By.XPATH, "//a[text()='Allgemeine Innere Medizin']"))
                        )
                        department_link.click()
                        logger.info(f"Department clicked in {time.time() - start_time:.2f} seconds")
                        time.sleep(random.uniform(2, 4))
                    except Exception as e:
                        logger.error(f"Error finding department_link: {e}")
                        logger.info("Skipping department click due to error")

                html_content = driver.page_source
                logger.info(f"HTML retrieved in {time.time() - start_time:.2f} seconds")
                logger.info(f"Full HTML content: {html_content[:1000]}...")  # Log more content for debugging

                driver.quit()
                break

            except Exception as e:
                logger.error(f"Error loading URL with Selenium (proxy: {proxy}) on attempt {attempt + 1}: {e}")
                if attempt == retries - 1:
                    logger.error(f"Failed to load URL with Selenium (with proxy) after all retries: {e}")
                if driver:
                    driver.quit()
                time.sleep(random.uniform(2, 5))  # Add delay between retries

        # Try without proxy if Selenium with proxy fails or returns error page
        if "Error: Could not load content" in html_content or "REMOTE_ADDR" in html_content:
            logger.info("Selenium with proxy failed or returned error page, attempting without proxy...")
            firefox_options = Options()
            firefox_options.add_argument("--headless")
            firefox_options.add_argument("--no-sandbox")
            firefox_options.add_argument("--disable-dev-shm-usage")
            firefox_options.add_argument("--disable-gpu")
            firefox_options.add_argument(f"user-agent={random.choice(USER_AGENTS)}")
            firefox_options.add_argument("--window-size=1920,1080")
            firefox_options.add_argument("--disable-blink-features=AutomationControlled")

            for attempt in range(retries):
                driver = None
                try:
                    driver = webdriver.Firefox(
                        options=firefox_options,
                        service=service
                    )
                    logger.info(f"Driver initialized (no proxy) in {time.time() - start_time:.2f} seconds")
                    logger.info(f"Loading URL with Selenium (no proxy, attempt {attempt + 1}/{retries})...")

                    driver.set_page_load_timeout(120)
                    driver.get(url)
                    logger.info(f"URL loaded (no proxy) in {time.time() - start_time:.2f} seconds")

                    WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.TAG_NAME, "body"))
                    )
                    logger.info(f"Body element loaded (no proxy) in {time.time() - start_time:.2f} seconds")

                    body_text = driver.find_element(By.TAG_NAME, 'body').text
                    if "REMOTE_ADDR" in body_text:
                        logger.warning("Detected error page with REMOTE_ADDR (no proxy); likely blocked by anti-scraping measures")
                        html_content = driver.page_source
                        driver.quit()
                        break

                    time.sleep(random.uniform(2, 5))

                    region_selected = False
                    try:
                        region_select = WebDriverWait(driver, 10).until(
                            EC.presence_of_element_located((By.XPATH, "//*[@id='anonymous_oe' or @name='anonymous_oe']"))
                        )
                        region_select.click()
                        logger.info(f"Region selected (no proxy) in {time.time() - start_time:.2f} seconds")
                        region_selected = True
                        time.sleep(random.uniform(2, 4))
                    except Exception as e:
                        logger.error(f"Error finding region_select (no proxy): {e}")
                        logger.info("Skipping region selection due to error")

                    if region_selected:
                        try:
                            subject_area_link = WebDriverWait(driver, 10).until(
                                EC.element_to_be_clickable((By.XPATH, "//a[text()='Innere Medizin']"))
                            )
                            subject_area_link.click()
                            logger.info(f"Subject area clicked (no proxy) in {time.time() - start_time:.2f} seconds")
                            time.sleep(random.uniform(2, 4))
                        except Exception as e:
                            logger.error(f"Error finding subject_area_link (no proxy): {e}")
                            logger.info("Skipping subject area click due to error")

                        try:
                            department_link = WebDriverWait(driver, 10).until(
                                EC.element_to_be_clickable((By.XPATH, "//a[text()='Allgemeine Innere Medizin']"))
                            )
                            department_link.click()
                            logger.info(f"Department clicked (no proxy) in {time.time() - start_time:.2f} seconds")
                            time.sleep(random.uniform(2, 4))
                        except Exception as e:
                            logger.error(f"Error finding department_link (no proxy): {e}")
                            logger.info("Skipping department click due to error")

                    html_content = driver.page_source
                    logger.info(f"HTML retrieved (no proxy) in {time.time() - start_time:.2f} seconds")
                    logger.info(f"Full HTML content (no proxy): {html_content[:1000]}...")

                    driver.quit()
                    break

                except Exception as e:
                    logger.error(f"Error loading URL with Selenium (no proxy) on attempt {attempt + 1}: {e}")
                    if attempt == retries - 1:
                        logger.error(f"Failed to load URL with Selenium (no proxy) after all retries: {e}")
                    if driver:
                        driver.quit()
                    time.sleep(random.uniform(2, 5))

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