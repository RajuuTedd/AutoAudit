
```
AutoAudit
├─ .DS_Store
├─ client
│  ├─ bun.lockb
│  ├─ components.json
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ public
│  │  ├─ favicon.ico
│  │  ├─ placeholder.svg
│  │  └─ robots.txt
│  ├─ README.md
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.tsx
│  │  ├─ assets
│  │  │  └─ hero-mockup.jpg
│  │  ├─ components
│  │  │  ├─ AutoAuditApp.tsx
│  │  │  ├─ GradientText.css
│  │  │  ├─ GradientText.jsx
│  │  │  └─ ui
│  │  │     ├─ accordion.tsx
│  │  │     ├─ alert-dialog.tsx
│  │  │     ├─ alert.tsx
│  │  │     ├─ animated-grid-pattern.tsx
│  │  │     ├─ aspect-ratio.tsx
│  │  │     ├─ avatar.tsx
│  │  │     ├─ badge.tsx
│  │  │     ├─ breadcrumb.tsx
│  │  │     ├─ button.tsx
│  │  │     ├─ calendar.tsx
│  │  │     ├─ card.tsx
│  │  │     ├─ carousel.tsx
│  │  │     ├─ chart.tsx
│  │  │     ├─ checkbox.tsx
│  │  │     ├─ collapsible.tsx
│  │  │     ├─ command.tsx
│  │  │     ├─ context-menu.tsx
│  │  │     ├─ dialog.tsx
│  │  │     ├─ drawer.tsx
│  │  │     ├─ dropdown-menu.tsx
│  │  │     ├─ form.tsx
│  │  │     ├─ gradual-spacing.tsx
│  │  │     ├─ hover-card.tsx
│  │  │     ├─ input-otp.tsx
│  │  │     ├─ input.tsx
│  │  │     ├─ label.tsx
│  │  │     ├─ menubar.tsx
│  │  │     ├─ navigation-menu.tsx
│  │  │     ├─ pagination.tsx
│  │  │     ├─ popover.tsx
│  │  │     ├─ progress.tsx
│  │  │     ├─ radio-group.tsx
│  │  │     ├─ resizable.tsx
│  │  │     ├─ scroll-area.tsx
│  │  │     ├─ select.tsx
│  │  │     ├─ separator.tsx
│  │  │     ├─ sheet.tsx
│  │  │     ├─ sidebar.tsx
│  │  │     ├─ skeleton.tsx
│  │  │     ├─ slider.tsx
│  │  │     ├─ sonner.tsx
│  │  │     ├─ star-border.tsx
│  │  │     ├─ switch.tsx
│  │  │     ├─ table.tsx
│  │  │     ├─ tabs.tsx
│  │  │     ├─ textarea.tsx
│  │  │     ├─ toast.tsx
│  │  │     ├─ toaster.tsx
│  │  │     ├─ toggle-group.tsx
│  │  │     ├─ toggle.tsx
│  │  │     ├─ tooltip.tsx
│  │  │     └─ use-toast.ts
│  │  ├─ hooks
│  │  │  ├─ use-mobile.tsx
│  │  │  └─ use-toast.ts
│  │  ├─ index.css
│  │  ├─ lib
│  │  │  └─ utils.ts
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  ├─ Index.tsx
│  │  │  └─ NotFound.tsx
│  │  └─ vite-env.d.ts
│  ├─ tailwind.config.ts
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
├─ db
│  ├─ .DS_Store
│  ├─ seed.js
│  └─ seeds
│     ├─ regulations.json
│     ├─ requirements.json
│     ├─ rules.json
│     └─ tests.json
├─ logs
├─ package-lock.json
├─ package.json
├─ README.md
├─ reports
└─ server
   ├─ .DS_Store
   ├─ controllers
   │  └─ scanController.js
   ├─ cypher
   │  ├─ .DS_Store
   │  ├─ constraints.cypher
   │  └─ mapping
   │     ├─ req-aria-roles.cypher
   │     ├─ req-contrast.cypher
   │     ├─ req-csp.cypher
   │     ├─ req-default-credentials.cypher
   │     ├─ req-dir-listing.cypher
   │     ├─ req-encryption.cypher
   │     ├─ req-hsts.cypher
   │     ├─ req-https.cypher
   │     ├─ req-image-alt.cypher
   │     ├─ req-keyboard-focus.cypher
   │     ├─ req-outdated-software.cypher
   │     ├─ req-privacy-controller-identity.cypher
   │     ├─ req-privacy-data-sharing.cypher
   │     ├─ req-privacy-link-visible.cypher
   │     ├─ req-privacy-policy.cypher
   │     ├─ req-referrer.cypher
   │     ├─ req-secure-cookies.cypher
   │     ├─ req-server-version.cypher
   │     ├─ req-tls12.cypher
   │     ├─ req-vulnerability-scan.cypher
   │     ├─ req-xcto.cypher
   │     └─ req-xfo.cypher
   ├─ geminiTest.js
   ├─ graph
   │  ├─ ingest
   │  │  ├─ axe.js
   │  │  ├─ cookies.js
   │  │  ├─ headers.js
   │  │  ├─ nikto.js
   │  │  └─ ssl.js
   │  └─ neo4j
   │     └─ neo4j.js
   ├─ index.js
   ├─ models
   │  ├─ regulationModel.js
   │  ├─ requirementModel.js
   │  ├─ ruleModel.js
   │  └─ testModel.js
   ├─ package-lock.json
   ├─ package.json
   ├─ parsers
   │  ├─ axeParser.js
   │  ├─ curlHeaderParser.js
   │  ├─ niktoParser.js
   │  ├─ policyParser.js
   │  └─ sslLabsParser.js
   ├─ routes
   │  └─ scanRoutes.js
   ├─ scripts
   │  ├─ seedNeo4jFromJson.js
   │  └─ testConnection.js
   ├─ seeds
   │  ├─ regulations.json
   │  ├─ requirements.json
   │  ├─ rules.json
   │  └─ tests.json
   ├─ services
   │  ├─ axeService.js
   │  ├─ curlHeaderService.js
   │  ├─ niktoService.js
   │  ├─ policyParserService.js
   │  ├─ reportBuilderService.js
   │  ├─ reportKG.js
   │  ├─ scanPipeline.js
   │  ├─ sslLabsService.js
   │  └─ testRunnerService.js
   └─ utils
      └─ command.js

```