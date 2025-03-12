# Use the official Python 3.13 slim image as the base
FROM python:3.13-slim

# Install system dependencies for Selenium, Firefox, and proxy support
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    gnupg \
    ca-certificates \
    firefox-esr \
    && rm -rf /var/lib/apt/lists/*

# Install geckodriver 0.36.0 to match Firefox 128.*
RUN wget -q "https://github.com/mozilla/geckodriver/releases/download/v0.36.0/geckodriver-v0.36.0-linux64.tar.gz" -O /tmp/geckodriver.tar.gz \
    && tar -xzf /tmp/geckodriver.tar.gz -C /usr/local/bin \
    && rm /tmp/geckodriver.tar.gz \
    && chmod +x /usr/local/bin/geckodriver

# Set up the working directory
WORKDIR /app

# Copy the requirements file and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port (Railway expects 8080 by default)
EXPOSE 8080

# Run the app with Gunicorn (single worker, timeout at 600 seconds)
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8080", "--workers", "1", "--timeout", "600", "--log-level", "info", "--preload"]