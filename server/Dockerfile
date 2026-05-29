# Upgrade to Bookworm (Debian 12) for much better package stability
FROM node:18-bookworm

# Update apt and install only the core required system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    nikto \
    curl \
    perl \
    chromium \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your backend code
COPY . .

# Expose the port 
EXPOSE 5000

# Start the application
CMD ["npm", "start"]