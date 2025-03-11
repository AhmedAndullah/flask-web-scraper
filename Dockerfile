# Use the official Python image as the base
FROM python:3.13-slim

# Install system dependencies for Chrome and Chromedriver
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    gnupg \
    ca-certificates \
    libglib2.0-0 \
    libnss3 \
    libgconf-2-4 \
    libfontconfig1 \
    libxrender1 \
    libxtst6 \
    libxi6 \
    libgtk-3-0 \
    && rm -rf /var/lib/apt/lists/*

# Add Google's signing key in a modern, non-deprecated way
RUN wget -q -O /tmp/google-chrome-signing-key.pub https://dl.google.com/linux/linux_signing_key.pub \
    && gpg --dearmor < /tmp/google-chrome-signing-key.pub > /usr/share/keyrings/google-chrome-archive-keyring.gpg \
    && rm /tmp/google-chrome-signing-key.pub

# Add the Chrome repository
RUN echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome-archive-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# Install Google Chrome
RUN apt-get update && apt-get install -y google-chrome-stable && rm -rf /var/lib/apt/lists/*

# Set up the working directory
WORKDIR /app

# Copy the requirements file and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 8080

# Run the app with Gunicorn
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8080", "--workers", "2", "--timeout", "120"]