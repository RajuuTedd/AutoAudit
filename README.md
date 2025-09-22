# AutoAudit - Web Compliance Made Simple

![AutoAudit Homepage](https://github.com/user-attachments/assets/5cb750c1-920e-4efa-ac97-67a6d6c82a86)

**AutoAudit** is a comprehensive web compliance audit tool that automatically scans websites for GDPR, accessibility, and security compliance. Get actionable insights in seconds, not hours.

## 🚀 Features

- **GDPR Compliance**: Automated privacy policy analysis and cookie compliance checks
- **WCAG Standards**: Accessibility auditing against Web Content Accessibility Guidelines
- **Security Analysis**: Comprehensive security vulnerability scanning
- **Privacy Policy Analysis**: Intelligent analysis of privacy policies and data handling practices
- **Real-time Scanning**: Fast, comprehensive website auditing
- **Detailed Reporting**: Actionable insights with specific recommendations
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **Puppeteer** for web scraping
- **Axe-core** for accessibility testing
- **Google Generative AI** for intelligent analysis

### Security & Compliance Tools
- **Axe CLI** for accessibility auditing
- **Nikto** for security scanning
- **SSL Labs API** for SSL/TLS analysis
- **Custom policy parsers** for GDPR compliance

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud instance)
- Chrome/Chromium browser (for Puppeteer)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/RajuuTedd/AutoAudit.git
   cd AutoAudit
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Setup Client**
   ```bash
   cd client
   npm install
   ```

4. **Setup Server**
   ```bash
   cd ../server
   npm install
   ```

5. **Environment Configuration**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/autoaudit
   GOOGLE_API_KEY=your_google_api_key_here
   ```

6. **Start the Application**
   
   Start the server:
   ```bash
   cd server
   npm start
   # or for development
   npm run dev
   ```
   
   In a new terminal, start the client:
   ```bash
   cd client
   npm run dev
   ```

7. **Access the Application**
   
   Open your browser and navigate to `http://localhost:8080`

## 🎯 Usage

1. **Enter Website URL**: Input the URL of the website you want to audit
2. **Start Scan**: Click "Scan Website" to begin the comprehensive audit
3. **Review Results**: Get detailed compliance reports with:
   - Summary of passed/failed tests
   - Specific violations and requirements
   - Actionable recommendations
   - Regulatory compliance status

## 📊 Architecture

```
AutoAudit/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   └── hooks/         # Custom React hooks
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend API
│   ├── controllers/       # Request handlers
│   ├── models/           # MongoDB schemas
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   ├── parsers/          # Tool result parsers
│   └── utils/            # Utility functions
├── db/                   # Database related files
├── logs/                 # Application logs
└── scripts/              # Utility scripts
```

## 🔧 API Endpoints

### Scan Endpoint
```
GET /api/scan?url=<website_url>
```

Returns a comprehensive compliance report including:
- Test results summary
- Detailed violations list
- Regulatory compliance status
- Suggested fixes

## 🧪 Testing

### Client Testing
```bash
cd client
npm run lint
npm run build
```

### Server Testing
```bash
cd server
npm test  # (when tests are implemented)
```

## 🚀 Deployment

### Production Build
```bash
# Build client for production
cd client
npm run build

# Start server in production mode
cd ../server
NODE_ENV=production npm start
```

### Docker Deployment
*(Docker configuration to be added)*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development

### Project Structure
- **Monorepo**: Contains both client and server applications
- **Database Models**: Structured schemas for tests, requirements, rules, and regulations
- **Service Layer**: Modular services for different audit tools
- **Parser System**: Extensible parsers for different tool outputs

### Key Services
- `axeService.js` - Accessibility testing with Axe
- `niktoService.js` - Security vulnerability scanning
- `sslLabsService.js` - SSL/TLS analysis
- `reportBuilderService.js` - Compliance report generation

## 📋 Roadmap

- [ ] Add Docker containerization
- [ ] Implement comprehensive test suite
- [ ] Add more compliance frameworks (SOC2, ISO27001)
- [ ] Implement user authentication and project management
- [ ] Add scheduled scanning capabilities
- [ ] Create CLI tool for CI/CD integration

## 📄 License

This project is licensed under the ISC License.

## 🙋‍♂️ Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Made with ❤️ for web compliance and accessibility**