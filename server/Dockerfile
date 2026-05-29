# Use Bookworm (Debian 12) base
FROM node:18-bookworm

# 1. Install base tools + nikto from source (not apt, since nikto isn't reliably in Debian repos)
RUN apt-get update --fix-missing \
    && apt-get install -y --no-install-recommends \
        curl \
        perl \
        wget \
        gnupg \
        ca-certificates \
        git \
        libnet-ssleay-perl \
        libwhisker2-perl \
    && rm -rf /var/lib/apt/lists/*

# 2. Install nikto from GitHub (official source, always available)
RUN git clone --depth 1 https://github.com/sullo/nikto.git /opt/nikto \
    && ln -s /opt/nikto/program/nikto.pl /usr/local/bin/nikto \
    && chmod +x /opt/nikto/program/nikto.pl

# 3. Add Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub \
        | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] \
        http://dl.google.com/linux/chrome/deb/ stable main" \
        > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]