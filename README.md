# ResuBoost AI — AI-Powered Resume Analyzer

> Beat the ATS with Precision Logic.

ResuBoost is a full-stack web application that uses Google Gemini AI to analyze resumes against job descriptions. It extracts text from PDF resumes, runs a structured AI analysis, and returns an actionable report covering match score, keyword gaps, strengths, weaknesses, and improvement suggestions.

---

## ✨ Features

- 📄 **PDF Resume Parsing** — Upload your resume as a PDF; the backend extracts the raw text automatically.
- 🤖 **Gemini AI Analysis** — Powered by Google''s Gemini model for deep semantic understanding.
- 🎯 **ATS Match Score** — Get a 0–100 match score based on skills, experience alignment, and keyword density.
- 🔑 **Keyword Analysis** — Identifies matching and missing keywords from the job description.
- 💪 **Strengths & Weaknesses** — Clear breakdown of what''s working and what''s holding you back.
- 📋 **Action Plan** — Prioritized, actionable suggestions to improve your resume.
- 🎨 **Modern UI** — Dark-mode, glassmorphism design with smooth animations.

---

## 🏗️ Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | HTML, TailwindCSS (CDN), Vanilla JavaScript     |
| Backend  | NestJS (Node.js, TypeScript)                    |
| AI       | Google Gemini API (`@google/genai`)             |
| PDF      | `pdf-parse`                                     |
| Runtime  | Node.js 18+                                     |

---

## 📁 Project Structure

```
AI resume analyzer/
├── Frontend/
│   ├── index.html      # Single-page UI (TailwindCSS + Material Symbols)
│   ├── app.js          # All frontend logic (form, drag-drop, API calls, results rendering)
│   └── style.css       # Custom CSS (glassmorphism, gradients, animations)
│
└── Backend/
    ├── src/
    │   ├── main.ts                   # App entry point, CORS config
    │   ├── app.module.ts             # Root NestJS module
    │   ├── app.controller.ts         # Health check route
    │   ├── resume.controller.ts      # POST /api/resume/analyze
    │   └── resume.service.ts         # PDF extraction + Gemini API call
    ├── .env                          # Environment variables (see below)
    ├── nest-cli.json
    ├── package.json
    └── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- A Google Gemini API key (https://aistudio.google.com/app/apikey)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd "AI resume analyzer"
```

### 2. Configure the Backend

```bash
cd Backend
```

Create (or edit) the `.env` file:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

### 3. Install Backend Dependencies

```bash
npm install
```

### 4. Start the Backend

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`.

### 5. Open the Frontend

No build step is needed for the frontend. Simply open `Frontend/index.html` in your browser, or serve it with any static file server:

```bash
# Using npx serve
npx serve Frontend
```

> The frontend calls `http://localhost:3000/api/resume/analyze` by default. Make sure the backend is running before submitting a resume.

---

## 📡 API Reference

### `POST /api/resume/analyze`

Analyzes a resume PDF against an optional job description.

**Request** — `multipart/form-data`

| Field             | Type   | Required | Description                 |
|-------------------|--------|----------|-----------------------------|
| `resume`          | File   | ✅ Yes   | PDF resume file             |
| `jobDescription`  | String | ❌ No    | Target job description text |

**Response** — `application/json`

```json
{
  "score": 82,
  "summary": "Strong backend profile with solid Node.js experience...",
  "strengths": ["5+ years TypeScript experience", "Cloud infrastructure background"],
  "weaknesses": ["No mention of CI/CD pipelines", "Missing leadership examples"],
  "matchingKeywords": ["NestJS", "REST API", "PostgreSQL"],
  "missingKeywords": ["Docker", "Kubernetes", "GraphQL"],
  "suggestions": [
    "Add quantifiable metrics to all bullet points",
    "Include a CI/CD section referencing GitHub Actions or Jenkins"
  ]
}
```

---

## 🛠️ Available Scripts (Backend)

| Script               | Description                          |
|----------------------|--------------------------------------|
| `npm run start`      | Start the server                     |
| `npm run start:dev`  | Start in watch mode (hot-reload)     |
| `npm run build`      | Compile TypeScript to `dist/`        |
| `npm run start:prod` | Run the compiled production build    |
| `npm run test`       | Run unit tests (Jest)                |
| `npm run test:e2e`   | Run end-to-end tests                 |
| `npm run lint`       | Lint and auto-fix TypeScript files   |
| `npm run format`     | Format code with Prettier            |

---

## 🔒 Environment Variables

| Variable         | Description                     | Required             |
|------------------|---------------------------------|----------------------|
| `GEMINI_API_KEY` | Your Google Gemini API key      | ✅ Yes               |
| `PORT`           | Port the NestJS server runs on  | ❌ (default: `3000`) |

---

## 📸 How It Works

1. **User uploads** a PDF resume and (optionally) pastes a job description into the frontend.
2. The frontend sends a `multipart/form-data` POST request to the NestJS backend.
3. The backend **parses the PDF** using `pdf-parse` to extract raw text.
4. The extracted text and job description are sent to the **Gemini API** with a structured JSON schema prompt.
5. Gemini returns a structured JSON analysis.
6. The frontend **renders** the score, keywords, strengths, weaknesses, and action plan in a rich UI.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m ''Add amazing feature''`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and unlicensed. All rights reserved.

---

*Built with ❤️ using NestJS and Google Gemini AI.*
