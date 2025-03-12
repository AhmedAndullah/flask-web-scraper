from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import os
import logging
import time
import tempfile

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fetch_html(browser="webkit", retries=3):
    """Fetch the dynamically loaded HTML content using Playwright."""
    start_time = time.time()
    url = "https://www.ivena-niedersachsen.de/leitstellenansicht.php"

    # Create a unique user data directory for this session (for logging or future use)
    user_data_dir = tempfile.mkdtemp()
    logger.info(f"Using user data directory: {user_data_dir}")

    html_content = "<h1>Error: Could not load content. Please try again later.</h1>"
    for attempt in range(retries):
        try:
            with sync_playwright() as p:
                # Map browser argument to Playwright browser types
                browser_type = p.webkit if browser == "webkit" else p.chromium if browser == "chromium" else p.firefox
                # Use WebKit-specific arguments (no --no-sandbox or --disable-dev-shm-usage)
                browser_args = [] if browser == "webkit" else ["--no-sandbox", "--disable-dev-shm-usage"]
                browser = browser_type.launch(
                    headless=True,
                    args=browser_args
                )
                page = browser.new_page()

                logger.info(f"Driver initialized in {time.time() - start_time:.2f} seconds")
                logger.info(f"Loading URL (attempt {attempt + 1}/{retries})...")

                # Navigate to the URL with increased timeout
                page.goto(url, wait_until="load", timeout=120000)  # 120-second timeout
                logger.info(f"URL loaded in {time.time() - start_time:.2f} seconds")

                # Take an early screenshot and content dump for debugging
                page.screenshot(path=f"debug_attempt_{attempt}.png")
                initial_content = page.content()
                logger.info(f"Initial content length: {len(initial_content)} bytes")

                # Reintroduce clicks to test functionality
                # Wait for and click region
                page.wait_for_selector("#anonymous_oe", state="attached", timeout=10000)
                region_select = page.locator("#anonymous_oe")
                region_select.click()
                logger.info(f"Region selected in {time.time() - start_time:.2f} seconds")

                # Wait for and click subject area
                page.wait_for_selector("text=Innere Medizin", state="visible", timeout=10000)
                subject_area_link = page.locator("text=Innere Medizin")
                subject_area_link.click()
                logger.info(f"Subject area clicked in {time.time() - start_time:.2f} seconds")

                # Wait for and click department
                page.wait_for_selector("text=Allgemeine Innere Medizin", state="visible", timeout=10000)
                department_link = page.locator("text=Allgemeine Innere Medizin")
                department_link.click()
                logger.info(f"Department clicked in {time.time() - start_time:.2f} seconds")

                # Get the final HTML content and take another screenshot
                html_content = page.content()
                page.screenshot(path=f"debug_final_{attempt}.png")
                logger.info(f"HTML retrieved in {time.time() - start_time:.2f} seconds")

                # Close the browser within the with block
                browser.close()

        except Exception as e:
            logger.error(f"Error loading URL on attempt {attempt + 1}: {e}")
            if attempt < retries - 1:
                time.sleep(2)
            else:
                logger.error(f"Failed to load URL after all retries: {e}")

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
    browser = os.getenv("BROWSER", "webkit")
    logger.info(f"Using browser: {browser}")
    html_content = fetch_html(browser)
    with open("output.html", "w", encoding="utf-8") as f:
        f.write(html_content)