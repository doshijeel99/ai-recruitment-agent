from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Body, Form, Path
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
from sentence_transformers import SentenceTransformer, util
import pdfplumber
import logging
import uvicorn
import motor.motor_asyncio
import os
import httpx
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from dotenv import load_dotenv
from fastapi.responses import StreamingResponse
import io
import csv
import re

load_dotenv()

# Configuration and environment setup
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama3-70b-8192"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
logging.basicConfig(level=logging.INFO)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
client = motor.motor_asyncio.AsyncIOMotorClient("mongodb+srv://doshijeel99:pass%40123@jobs.pivca9t.mongodb.net/")
db = client.smart_recruitment
jobs_collection = db.jobs
candidates_collection = db.candidates

# AI models
sbert_model = SentenceTransformer('all-MiniLM-L6-v2')

# Pydantic Models
class Job(BaseModel):
    job_id: Optional[str] = None
    title: str
    description: str
    requirements: List[str]

class Candidate(BaseModel):
    candidate_id: str
    name: str
    job_id: str
    resume_text: Optional[str] = None
    status: str = "applied"
    score: Optional[float] = None
    persona: Optional[str] = None
    interview_tasks: Optional[List[str]] = None
    performance_review: Optional[str] = None
    performance_metrics: Optional[dict] = None 

# Helper Functions
async def extract_resume_text_from_pdf(file: UploadFile) -> str:
    try:
        with pdfplumber.open(file.file) as pdf:
            return "\n".join([page.extract_text() or "" for page in pdf.pages])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract text from PDF: {str(e)}")

async def detect_persona_with_llama(resume_text: str, job: dict) -> str:
    prompt = f"""
    Analyze the following candidate's resume and the job context. Summarize the candidate's professional persona in one concise sentence, focusing on their strengths, work style, and fit for the role.

    Job Title: {job.get('title', '')}
    Job Description: {job.get('description', '')}
    Requirements: {', '.join(job.get('requirements', []))}

    Candidate Resume:
    {resume_text}
    """
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    json_data = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are an expert HR analyst."},
            {"role": "user", "content": prompt}
        ]
    }
    async with httpx.AsyncClient() as client:
        response = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=json_data)
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content'].strip()

async def generate_interview_tasks_with_llama(resume_text: str, job: dict) -> List[str]:
    prompt = f"""
    Given the following job description and candidate resume, generate a numbered list of 3 concise, technical interview tasks that directly assess the candidate's fit for this role. Each task should be clear and actionable.

    Job Title: {job.get('title', '')}
    Job Description: {job.get('description', '')}
    Requirements: {', '.join(job.get('requirements', []))}

    Candidate Resume:
    {resume_text}
    """
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    json_data = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are an expert HR recruiter."},
            {"role": "user", "content": prompt}
        ]
    }
    async with httpx.AsyncClient() as client:
        response = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=json_data)
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content'].strip()
        # Extract only the numbered tasks
        tasks = re.findall(r"\d+\.\s*(.+)", content)
        if not tasks:
            # fallback: split by lines and clean
            tasks = [line.strip("-* ") for line in content.split("\n") if line.strip()]
        return tasks

async def score_resume_with_sbert(resume_text: str, job_requirements: List[str]) -> float:
    try:
        resume_embedding = sbert_model.encode(resume_text, convert_to_tensor=True)
        scores = []
        for req in job_requirements:
            req_embedding = sbert_model.encode(req, convert_to_tensor=True)
            similarity = util.pytorch_cos_sim(resume_embedding, req_embedding).item()
            scores.append(similarity)
        semantic_score = sum(scores) / len(scores) * 100 if scores else 0.0

        # Keyword match boost
        resume_lower = resume_text.lower()
        keyword_matches = sum(1 for req in job_requirements if req.lower() in resume_lower)
        keyword_score = (keyword_matches / len(job_requirements)) * 100 if job_requirements else 0

        # Final blended score
        final_score = round(0.7 * semantic_score + 0.3 * keyword_score, 2)
        return final_score
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume scoring failed: {str(e)}")

import json
import re

async def generate_performance_review_with_llama(resume_text: str, job: dict) -> dict:
    prompt = f"""
    You are an expert HR reviewer. Given the job description and the candidate's resume, generate a JSON object with:
    - "review": a unique, detailed, and professional performance review (string, 5-8 sentences).
    - "metrics": an object with numeric scores (0-100) for "technical_skills", "communication", "problem_solving", and "team_collaboration".
    Only return valid JSON.

    Job Title: {job.get('title', '')}
    Job Description: {job.get('description', '')}
    Requirements: {', '.join(job.get('requirements', []))}

    Candidate Resume:
    {resume_text}
    """
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    json_data = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are an expert HR performance reviewer."},
            {"role": "user", "content": prompt}
        ]
    }
    async with httpx.AsyncClient() as client:
        response = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=json_data)
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content'].strip()
        # Try to parse as JSON directly
        try:
            return json.loads(content)
        except Exception:
            # Try to extract JSON from triple backticks or anywhere in the text
            match = re.search(r"```(?:json)?\s*({[\s\S]+?})\s*```", content)
            if not match:
                match = re.search(r"({[\s\S]+})", content)
            if match:
                try:
                    return json.loads(match.group(1))
                except Exception:
                    pass
            # fallback: return as plain review if parsing fails
            return {"review": content, "metrics": {}}
    
# --- API Endpoints ---

@app.get("/jobs")
async def get_jobs():
    jobs = []
    async for job in jobs_collection.find():
        job["_id"] = str(job["_id"])
        jobs.append(job)
    return jobs

@app.get("/candidates")
async def get_candidates():
    candidates = []
    async for candidate in candidates_collection.find():
        candidate["_id"] = str(candidate["_id"])
        candidates.append(candidate)
    return candidates

@app.post("/jobs")
async def create_job(job: Job):
    job_data = job.dict()
    if not job_data.get("job_id"):
        job_data["job_id"] = str(uuid4())
    result = await jobs_collection.insert_one(job_data)
    job_data["_id"] = str(result.inserted_id)
    return {"message": "Job created", "job": job_data}

@app.post("/candidates")
async def create_candidate(candidate: Candidate):
    candidate_data = candidate.dict()
    result = await candidates_collection.insert_one(candidate_data)
    candidate_data["_id"] = str(result.inserted_id)
    return {"message": "Candidate created", "candidate": candidate_data}

@app.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    result = await jobs_collection.delete_one({"job_id": job_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted"}

@app.post("/upload_resume/")
async def upload_resume(
    job_id: str = Form(...),
    candidate_id: str = Form(...),
    name: str = Form(...),
    file: UploadFile = File(...)
):
    job = await jobs_collection.find_one({"job_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    resume_text = await extract_resume_text_from_pdf(file)
    score = await score_resume_with_sbert(resume_text, job['requirements'])
    persona = await detect_persona_with_llama(resume_text, job)
    interview_tasks = await generate_interview_tasks_with_llama(resume_text, job)
    performance_review_obj = await generate_performance_review_with_llama(resume_text, job)
    candidate = Candidate(
        candidate_id=candidate_id,
        name=name,
        job_id=job_id,
        resume_text=resume_text,
        score=score,
        persona=persona,
        interview_tasks=interview_tasks,
        performance_review=performance_review_obj.get("review", ""),
        performance_metrics=performance_review_obj.get("metrics", {}),
        status="screened"
    )
    candidate_dict = candidate.dict()
    candidate_dict["performance_metrics"] = performance_review_obj.get("metrics", {})
    await candidates_collection.insert_one(candidate_dict)
    candidate_dict.pop("_id", None)
    return {"message": "Candidate processed", "candidate": candidate_dict}

@app.patch("/candidates/{candidate_id}/status")
async def update_candidate_status(candidate_id: str = Path(...), status: str = Body(..., embed=True)):
    result = await candidates_collection.update_one(
        {"candidate_id": candidate_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"message": "Candidate status updated"}

@app.post("/evaluate_task/")
async def evaluate_task(candidate_id: str = Form(...), job_id: str = Form(...), task_submission: str = Form(...)):
    # AI evaluation logic here (implement as needed)
    evaluation = "Task evaluation not implemented."
    await candidates_collection.update_one(
        {"candidate_id": candidate_id},
        {"$set": {"task_evaluation": evaluation}}
    )
    return {"message": "Task evaluated", "evaluation": evaluation}

@app.get("/reports")
async def get_report(job_id: str):
    job = await jobs_collection.find_one({"job_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    candidates = []
    async for c in candidates_collection.find({"job_id": job_id}):
        # Build a clean dict for each candidate, including metrics and review
        candidates.append({
            "candidate_id": c.get("candidate_id"),
            "name": c.get("name"),
            "score": c.get("score"),
            "status": c.get("status"),
            "persona": c.get("persona"),
            "performance_review": c.get("performance_review"),
            "performance_metrics": c.get("performance_metrics"),
        })
    stats = {
        "totalCandidates": len(candidates),
        "averageScore": round(sum([c.get("score", 0) or 0 for c in candidates]) / len(candidates), 2) if candidates else 0,
        "statusBreakdown": {status: sum(1 for c in candidates if c.get("status") == status) for status in set(c.get("status") for c in candidates)}
    }
    return {
        "job": {
            "job_id": job.get("job_id"),
            "title": job.get("title"),
            "requirements": job.get("requirements", [])
        },
        "candidates": candidates,
        "stats": stats
    }

@app.get("/export")
async def export_reports(job_id: str, format: str = "csv"):
    if format not in ["csv"]:
        raise HTTPException(status_code=400, detail="Only CSV export is supported currently.")
    candidates = []
    async for c in candidates_collection.find({"job_id": job_id}):
        candidates.append(c)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Candidate ID", "Name", "Score", "Status", "Persona"])
    for c in candidates:
        writer.writerow([
            c.get("candidate_id", ""),
            c.get("name", ""),
            c.get("score", ""),
            c.get("status", ""),
            c.get("persona", "")
        ])
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=report.csv"}
    )

@app.post("/candidates/{candidate_id}/regenerate_tasks")
async def regenerate_interview_tasks(candidate_id: str, job_id: str):
    candidate = await candidates_collection.find_one({"candidate_id": candidate_id})
    job = await jobs_collection.find_one({"job_id": job_id})
    if not candidate or not job:
        raise HTTPException(status_code=404, detail="Candidate or Job not found")
    resume_text = candidate.get("resume_text", "")
    tasks = await generate_interview_tasks_with_llama(resume_text, job)
    await candidates_collection.update_one(
        {"candidate_id": candidate_id},
        {"$set": {"interview_tasks": tasks}}
    )
    return {"message": "Interview tasks regenerated", "interview_tasks": tasks}

@app.get("/job/{job_id}")
async def get_job(job_id: str):
    job = await jobs_collection.find_one({"job_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job["_id"] = str(job["_id"])
    return job

@app.get("/ai_insights")
async def ai_insights(job_id: str):
    job = await jobs_collection.find_one({"job_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    candidates = []
    async for c in candidates_collection.find({"job_id": job_id}):
        candidates.append({
            "name": c.get("name"),
            "score": c.get("score"),
            "status": c.get("status"),
            "performance_metrics": c.get("performance_metrics"),
        })
    # Compose a prompt for the LLM
    prompt = f"""
    Given the following job description and candidate data, generate a concise, professional insight summary (4-6 sentences) for a hiring manager. Highlight strengths, weaknesses, and trends in the candidate pool, and suggest actionable recommendations.

    Job Title: {job.get('title')}
    Job Requirements: {', '.join(job.get('requirements', []))}

    Candidates:
    {json.dumps(candidates, indent=2)}
    """
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    json_data = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are an expert HR analyst."},
            {"role": "user", "content": prompt}
        ]
    }
    async with httpx.AsyncClient() as client:
        response = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=json_data)
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content'].strip()
        return {"insight": content} 