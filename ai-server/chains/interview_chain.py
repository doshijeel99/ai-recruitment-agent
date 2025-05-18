import os
import re
from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL =  "llama3-8b-8192"

llm = ChatOpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
    model=GROQ_MODEL
)

interview_prompt = ChatPromptTemplate.from_template("""
Given the following job description and candidate resume, generate a numbered list of 3 concise, technical interview tasks that directly assess the candidate's fit for this role. Each task should be clear and actionable.

Job Title: {title}
Job Description: {description}
Requirements: {requirements}

Candidate Resume:
{resume}
""")

interview_chain = interview_prompt | llm

async def generate_interview_tasks_with_langchain(resume_text: str, job: dict) -> list:
    result = await interview_chain.ainvoke({
        "title": job.get('title', ''),
        "description": job.get('description', ''),
        "requirements": ', '.join(job.get('requirements', [])),
        "resume": resume_text
    })
    content = result.content if hasattr(result, "content") else str(result)
    tasks = re.findall(r"\d+\.\s*(.+)", content)
    if not tasks:
        tasks = [line.strip("-* ") for line in content.split("\n") if line.strip()]
    return tasks