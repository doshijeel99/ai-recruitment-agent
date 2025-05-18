import os
import json
import re
from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama3-8b-8192"

llm = ChatOpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
    model=GROQ_MODEL
)

performance_prompt = ChatPromptTemplate.from_template("""
You are an expert HR reviewer. Given the job description and the candidate's resume, generate a JSON object with:
- "review": a unique, detailed, and professional performance review (string, 5-8 sentences).
- "metrics": an object with numeric scores (0-100) for "technical_skills", "communication", "problem_solving", and "team_collaboration".
Only return valid JSON.

Job Title: {title}
Job Description: {description}
Requirements: {requirements}

Candidate Resume:
{resume}
""")

performance_chain = performance_prompt | llm

async def generate_performance_review_with_langchain(resume_text: str, job: dict) -> dict:
    result = await performance_chain.ainvoke({
        "title": job.get('title', ''),
        "description": job.get('description', ''),
        "requirements": ', '.join(job.get('requirements', [])),
        "resume": resume_text
    })
    content = result.content if hasattr(result, "content") else str(result)
    try:
        return json.loads(content)
    except Exception:
        match = re.search(r"```(?:json)?\s*({[\s\S]+?})\s*```", content)
        if not match:
            match = re.search(r"({[\s\S]+})", content)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass
        return {"review": content, "metrics": {}}