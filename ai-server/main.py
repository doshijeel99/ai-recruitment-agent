from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Body, Form, Path
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List, Optional
import pdfplumber
import logging
import uvicorn
import motor.motor_asyncio
import os
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from dotenv import load_dotenv
from fastapi.responses import StreamingResponse
import io
import csv
import json
import re
import asyncio

# At the top of your file
LLM_REQUEST_LOCK = asyncio.Lock()
LLM_REQUEST_DELAY = 5.5  # seconds

async def safe_agent_decide(prompt):
    async with LLM_REQUEST_LOCK:
        result = await agent_decide(prompt)
        await asyncio.sleep(LLM_REQUEST_DELAY)
        return result
os.environ["USE_TF"] = "0"
os.environ["TRANSFORMERS_NO_TF"] = "1"

# --- LangChain imports ---
from chains.persona_chain import detect_persona_with_langchain
from chains.performance_chain import generate_performance_review_with_langchain
from chains.interview_chain import generate_interview_tasks_with_langchain
from chains.scoring_chain import score_resume_with_sbert
from ai_agents.hr_agent import agent_decide

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama3-8b-8192"
MONGODB_URI = os.getenv("MONGODB_URI")
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
client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
db = client.smart_recruitment
jobs_collection = db.jobs
candidates_collection = db.candidates

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

def extract_agent_output(result, expected_type):
    # If result is a dict with 'input', extract it
    if isinstance(result, dict) and 'input' in result:
        result = result['input']
    # Try to cast to expected type
    if expected_type == float:
        try:
            return float(result)
        except Exception:
            return 0.0
    if expected_type == list:
        if isinstance(result, str):
            # Try to split numbered or bulleted list
            return [line.strip(" .-") for line in result.splitlines() if line.strip()]
        return list(result)
    return str(result)

# Helper Functions
async def extract_resume_text_from_pdf(file: UploadFile) -> str:
    try:
        with pdfplumber.open(file.file) as pdf:
            return "\n".join([page.extract_text() or "" for page in pdf.pages])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract text from PDF: {str(e)}")

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

    # Run all agent calls in parallel for speed
    score_task = agent_decide(
        f"Score the following resume for the job requirements.\n\nResume: {resume_text}\nRequirements: {', '.join(job['requirements'])}"
    )
    persona_task = agent_decide(
        f"""Detect persona for this candidate.
Resume: {resume_text}
Job Title: {job['title']}
Job Description: {job['description']}
Requirements: {', '.join(job['requirements'])}"""
    )
    interview_tasks_task = agent_decide(
        f"""Generate interview tasks for this candidate.
Resume: {resume_text}
Job Title: {job['title']}
Job Description: {job['description']}
Requirements: {', '.join(job['requirements'])}"""
    )
    performance_review_task = agent_decide(
        f"""Generate a performance review and metrics for this candidate.
Resume: {resume_text}
Job Title: {job['title']}
Job Description: {job['description']}
Requirements: {', '.join(job['requirements'])}"""
    )

    score_result, persona_result, interview_tasks_result, performance_review_obj = await asyncio.gather(
        score_task, persona_task, interview_tasks_task, performance_review_task
    )

    score = extract_agent_output(score_result, float)
    persona = extract_agent_output(persona_result, str)
    interview_tasks = extract_agent_output(interview_tasks_result, list)
    if isinstance(performance_review_obj, dict) and "input" in performance_review_obj:
        performance_review_obj = performance_review_obj["input"]
    if isinstance(performance_review_obj, str):
        try:
            performance_review_obj = json.loads(performance_review_obj)
        except Exception:
            performance_review_obj = {"review": performance_review_obj, "metrics": {}}
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

    # Use the exact format expected by your interview_tasks_tool
    prompt = (
        f"Resume: {resume_text}\n"
        f"Job Title: {job['title']}\n"
        f"Job Description: {job['description']}\n"
        f"Requirements: {', '.join(job['requirements'])}"
    )

    # If you have a safe_agent_decide wrapper, use it; otherwise, use agent_decide directly
    tasks_result = await agent_decide(prompt)
    tasks = extract_agent_output(tasks_result, list)

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
    # Only include the top 5 candidates by score
    candidates = sorted(candidates, key=lambda x: x.get("score", 0), reverse=True)[:5]
    prompt = f"""
    Given the following job description and candidate data, generate a concise, professional insight summary (4-6 sentences) for a hiring manager. Highlight strengths, weaknesses, and trends in the candidate pool, and suggest actionable recommendations.

    Job Title: {job.get('title')}
    Job Requirements: {', '.join(job.get('requirements', []))}

    Candidates:
    {json.dumps(candidates, indent=2)}
    """
    from openai import RateLimitError

    try:
        insight = await safe_agent_decide(prompt)
    except RateLimitError:
        raise HTTPException(status_code=429, detail="AI rate limit reached. Please try again in a few seconds.")

    # FIX: Return the insight!
    return {"insight": insight}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)