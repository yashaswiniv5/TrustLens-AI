# 🛡️ TrustLens AI – Digital Trust Analyzer

### 🔐 An AI-Powered Platform for Detecting Digital Threats

## 📌 Overview

TrustLens AI is an AI-powered digital security platform designed to help users identify suspicious messages, websites, URLs, and screenshots. It analyzes potential warning signs, categorizes risks, and provides actionable safety recommendations to promote safer online interactions.

The platform aims to make cybersecurity more accessible to non-technical users through an intuitive interface, trust scoring, and easy-to-understand analysis reports.

## ✨ Key Features

- 📩 **Suspicious Message Analysis** – Analyze potentially fraudulent messages, phishing attempts, and scam communications.
- 🌐 **Website & URL Analysis** – Identify suspicious URL patterns, misleading domains, and unusually long URLs.
- 🖼️ **Screenshot Analysis** – Support the analysis of screenshots containing potentially suspicious content.
- 📊 **Trust Score & Risk Classification** – Present risk scores and threat indicators to help users assess suspicious content.
- 📝 **Analysis Reports** – Display detected warning signs and recommended safety actions.
- 🕘 **Analysis History** – Review previous analyses where supported by the application.
- 🤖 **AI Security Assistant** – Provide security-related guidance and recommendations.
- 📱 **Responsive UI** – Access the platform through a responsive React-based interface.

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| ⚛️ React.js | Frontend user interface |
| ⚡ Vite | Frontend development and build tooling |
| 💛 JavaScript | Application logic |
| 🟢 Node.js | Backend runtime |
| 🚂 Express.js | REST API development |
| 🧠 AI/ML | Suspicious content analysis and risk assessment |
| 👁️ OpenCV | Image processing, where integrated |
| 🔗 REST APIs | Communication between frontend and backend |

## 📂 Project Structure

```text
TrustLens-AI/
├── 📁 backend/
│   ├── package.json
│   └── server.js
├── 📁 frontend/
│   ├── 📁 public/
│   ├── 📁 src/
│   │   ├── 📁 assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── 🔒 .env.example
├── 🚫 .gitignore
├── package.json
└── README.md
```

## ⚙️ Getting Started

### 📋 Prerequisites

Ensure you have the following installed:

- 🟢 [Node.js](https://nodejs.org/)
- 📦 npm
- 🐙 Git

### 1️⃣ Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd TrustLens-AI
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2️⃣ Install Dependencies

Install the root dependencies:

```bash
npm install
```

Install the backend dependencies:

```bash
cd backend
npm install
```

Install the frontend dependencies:

```bash
cd ../frontend
npm install
```

### 3️⃣ 🔑 Configure Environment Variables

Create a `.env` file in the appropriate directory according to your backend configuration. Use `.env.example` as a reference.

Add the required settings, such as the server port, database connection details, and API credentials if applicable.

⚠️ **Important:** Never upload your actual `.env` file, API keys, passwords, or database credentials to GitHub.

### 4️⃣ 🖥️ Start the Backend

Open a terminal in the `backend` directory and run:

```bash
npm start
```

The backend should start on the port configured in your environment variables.

### 5️⃣ 🌍 Start the Frontend

Open another terminal in the `frontend` directory and run:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

> 💡 Make sure the frontend API configuration matches the address and port of your running backend.

## 🔄 How It Works

1. 📥 **Input:** The user submits a suspicious message, URL, or supported screenshot.
2. 🔍 **Analysis:** The application examines the available content for suspicious patterns and warning signs.
3. 📊 **Risk Assessment:** The application generates the risk score, category, or indicators supported by its implemented detection logic.
4. 📄 **Results:** The interface displays findings and relevant safety recommendations.
5. 🛡️ **User Guidance:** Users can review the report and access available security assistance.

## 🎯 Project Objectives

- 🔐 Improve awareness of phishing, fraudulent messages, and suspicious websites.
- 🚨 Help users recognize potential online scams before interacting with them.
- 💡 Explain technical warning signs in simple, understandable language.
- 🌍 Encourage safer digital behavior through actionable recommendations.

## 🚀 Future Enhancements

- 🧠 Expand machine-learning-based detection and evaluation.
- 🔗 Integrate additional threat-intelligence sources.
- 🌏 Improve multilingual scam detection.
- 🖼️ Enhance screenshot text extraction and image-based analysis.
- 📈 Add advanced reporting and analysis-history features.

## 📌 Project Information

- 🏷️ **Project Name:** TrustLens AI – Digital Trust Analyzer
- 📅 **Duration:** June 2026 – July 2026
- 💻 **Category:** AI/ML, Web Development, Cybersecurity

## ⚠️ Disclaimer

TrustLens AI is designed to assist in identifying potentially suspicious digital content. Its results are indicative, not definitive. A low-risk result does not guarantee that a message or website is safe. Always independently verify sensitive requests before sharing personal information, passwords, OTPs, or financial details.

---

### 💙 Built to promote safer and more informed digital interactions!

