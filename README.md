# RecruitAI: AI for Smart Recruitment and Workforce Lifecycle

A modular, AI-powered recruitment and HR lifecycle platform that leverages LLMs to automate and enhance hiring, onboarding, evaluation, and reporting for organizations.

---

## 🚀 Features

- **Job Posting:**  
  Create and manage job listings via a web interface.

- **Candidate Management:**  
  - Upload candidate profiles (PDF resume or form).
  - Automatic resume parsing and ranking using LLMs.
  - Candidate persona detection for deeper insights.
  - Assign AI-generated, role-specific interview tasks.
  - Track candidate status through the full recruitment lifecycle.

- **Performance & Readiness Scoring:**  
  - AI-powered performance review plug-ins.
  - Skill and readiness evaluation for each candidate.

- **Reporting:**  
  - Export all stages and data as comprehensive HR reports (CSV).
  - AI-generated insights for hiring managers.

- **Modular AI Plug-ins:**  
  Easily extend the platform with new AI modules (e.g., for performance review).

---

## 🛠️ Tech Stack

- **Backend:** FastAPI, Python, Motor (MongoDB async driver)
- **Frontend:** React.js (Vite)
- **AI/LLM:** Groq API (Llama3), LangChain
- **Database:** MongoDB Compass

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/doshijeel99/ai-recruitment-agent.git
cd ai-recruitment-agent
```

### 2. Backend Setup

- Create a `.env` file in `ai-server/` with:
  ```
  GROQ_API_KEY=your_groq_api_key
  MONGODB_URI=your_mongodb_uri
  ```
- Install dependencies:
  ```bash
  cd ai-server
  pip install -r requirements.txt
  ```
- Run the FastAPI server:
  ```bash
  uvicorn main:app --reload
  ```

### 3. Frontend Setup

- Install dependencies and start the dev server:
  ```bash
  cd ../project
  npm install
  npm run dev
  ```

---

## 🧩 API Endpoints (Backend)

- `POST /jobs` — Create a job
- `GET /jobs` — List jobs
- `POST /candidates` — Add candidate (form or PDF)
- `POST /upload_resume/` — Upload and process resume (PDF)
- `POST /candidates/{candidate_id}/regenerate_tasks` — Regenerate interview tasks
- `GET /reports` — Get HR report for a job
- `GET /export` — Export report as CSV
- `GET /ai_insights` — Get AI-generated insights for a job

---


## 📂 Project Structure

```
ai-recruitment-agent/
│
├── ai-server/         # FastAPI backend (LLM, DB, API)
├── project/          # React.js frontend
├── README.md
└── ...
```

---

## 👤 Author

**Jeel Doshi**  
[GitHub](https://github.com/doshijeel99)



