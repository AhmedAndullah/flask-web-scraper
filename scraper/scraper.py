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

def fetch_html(browser="edge"):
    """Fetch the dynamically loaded HTML content using Selenium with the specified browser."""
    url = "https://www.ivena-niedersachsen.de/leitstellenansicht.php"

    # Common options for all browsers
    common_options = [
        "--headless", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage",
        "--disable-images", "--blink-settings=imagesEnabled=false", "--disable-extensions"
    ]

    options = None  # Initialize options
    service = None
    driver_class = None

    try:
        if browser.lower() == "chrome":
            options = ChromeOptions()
            service = ChromeService(ChromeDriverManager().install())
            driver_class = webdriver.Chrome
            print("Initializing Chrome driver...")

        elif browser.lower() == "edge":
            options = EdgeOptions()
            service = EdgeService(EdgeChromiumDriverManager().install())
            driver_class = webdriver.Edge
            print("Initializing Edge driver...")

        elif browser.lower() == "firefox":
            options = FirefoxOptions()
            service = FirefoxService(GeckoDriverManager().install())
            driver_class = webdriver.Firefox
            print("Initializing Firefox driver...")

        elif browser.lower() == "opera":
            print("Opera not directly supported, using Chrome settings instead.")
            options = ChromeOptions()
            service = ChromeService(ChromeDriverManager().install())
            driver_class = webdriver.Chrome

        else:
            print(f"Unsupported browser '{browser}', defaulting to Edge.")
            options = EdgeOptions()
            service = EdgeService(EdgeChromiumDriverManager().install())
            driver_class = webdriver.Edge

        # Apply common options **after** initializing `options`
        for arg in common_options:
            options.add_argument(arg)

    except Exception as e:
        print(f"Error initializing driver for {browser}: {e}")
        print("Falling back to Edge as a default browser.")
        options = EdgeOptions()
        service = EdgeService(EdgeChromiumDriverManager().install())
        driver_class = webdriver.Edge
        for arg in common_options:
            options.add_argument(arg)

    # Initialize the driver
    driver = driver_class(service=service, options=options)

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
        print("===== ORIGINAL HTML SNIPPET (AFTER JS) =====")
        soup = BeautifulSoup(html_content, 'html.parser')
        print([tag['src'] for tag in soup.find_all(src=True)][:10])
        print("=================================")

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
        print("===== MODIFIED HTML SNIPPET =====")
        print([tag['src'] for tag in BeautifulSoup(modified_html, 'html.parser').find_all(src=True)][:10])
        print("=================================")

    except Exception as e:
        print(f"Error during scraping: {e}")
        raise
    finally:
        driver.quit()

    return modified_html

if __name__ == "__main__":
    browser = os.getenv("BROWSER", "edge")
    print(f"Using browser: {browser}")
    html_content = fetch_html(browser)
    with open("output.html", "w", encoding="utf-8") as f:
        f.write(html_content)
