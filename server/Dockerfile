# Use Debian-based Node image (required for installing apt packages)
FROM node:18-bullseye

# Update apt and install all required system dependencies
# This includes Nikto, Curl, Perl, and Chromium (for Puppeteer/Axe)
RUN apt-get update && apt-get install -y \
    nikto \
    curl \
    perl \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your backend code
COPY . .

# Expose the port (Render defaults to 10000, but 5000 is fine)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]