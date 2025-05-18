# HireMind - AI-Powered Recruitment Management Platform

HireMind is a comprehensive recruitment management platform that leverages AI to streamline the hiring process and workforce lifecycle management.

## Features

- AI-powered resume parsing and matching
- Intelligent candidate ranking and scoring
- Automated interview task generation
- Candidate lifecycle tracking
- HR report generation
- Performance review management
- Personalized learning plans

## Tech Stack

- Frontend: React + Tailwind CSS
- Backend: Node.js + Express
- AI Integration: Groq API (LLaMA 3)
- Database: MongoDB
- Resume Parsing: pdfplumber, PyMuPDF

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Python 3.8+ (for resume parsing)
- Groq API key

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Set up environment variables:
   - Create `.env` files in both frontend and backend directories
   - Add necessary configuration (see .env.example files)

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

## Project Structure

```
hiremind/
├── frontend/           # React frontend application
├── backend/           # Node.js backend server
├── ai-services/       # Python-based AI services
└── docs/             # Documentation
```

## License

MIT License 