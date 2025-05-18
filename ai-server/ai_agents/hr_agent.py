import os
import re
import asyncio
from langchain.agents import initialize_agent, Tool
from langchain_openai import ChatOpenAI

from chains.persona_chain import detect_persona_with_langchain
from chains.performance_chain import generate_performance_review_with_langchain
from chains.interview_chain import generate_interview_tasks_with_langchain
from chains.scoring_chain import score_resume_with_sbert

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama3-8b-8192"

llm = ChatOpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
    model=GROQ_MODEL
)

# --- WRAPPER FOR AGENT TOOL ---
async def score_resume_tool(input_str: str) -> float:
    # Parse resume and requirements from the input string
    resume_match = re.search(r"Resume:\s*(.*?)\s*Requirements:", input_str, re.DOTALL)
    req_match = re.search(r"Requirements:\s*(.*)", input_str, re.DOTALL)
    resume_text = resume_match.group(1).strip() if resume_match else ""
    requirements = [r.strip() for r in req_match.group(1).split(",")] if req_match else []
    return await score_resume_with_sbert(resume_text, requirements)
async def performance_review_tool(input_str: str):
    import re
    resume_match = re.search(r"Resume:\s*(.*?)\n(?:Job Title:|Job Description:|Requirements:)", input_str, re.DOTALL)
    title_match = re.search(r"Job Title:\s*(.*?)\n", input_str)
    desc_match = re.search(r"Job Description:\s*(.*?)\n", input_str)
    req_match = re.search(r"Requirements:\s*(.*)", input_str)
    resume_text = resume_match.group(1).strip() if resume_match else ""
    job = {
        "title": title_match.group(1).strip() if title_match else "",
        "description": desc_match.group(1).strip() if desc_match else "",
        "requirements": [r.strip() for r in req_match.group(1).split(",")] if req_match else []
    }
    return await generate_performance_review_with_langchain(resume_text, job)

async def detect_persona_tool(input_str: str):
    # Parse resume and job fields from the input string
    resume_match = re.search(r"Resume:\s*(.*?)\n(?:Job Title:|Job Description:|Requirements:)", input_str, re.DOTALL)
    title_match = re.search(r"Job Title:\s*(.*?)\n", input_str)
    desc_match = re.search(r"Job Description:\s*(.*?)\n", input_str)
    req_match = re.search(r"Requirements:\s*(.*)", input_str)
    resume_text = resume_match.group(1).strip() if resume_match else ""
    job = {
        "title": title_match.group(1).strip() if title_match else "",
        "description": desc_match.group(1).strip() if desc_match else "",
        "requirements": [r.strip() for r in req_match.group(1).split(",")] if req_match else []
    }
    # Only return the LLM's persona string
    persona = await detect_persona_with_langchain(resume_text, job)
    return persona

async def interview_tasks_tool(input_str: str):
    resume_match = re.search(r"Resume:\s*(.*?)\n(?:Job Title:|Job Description:|Requirements:)", input_str, re.DOTALL)
    title_match = re.search(r"Job Title:\s*(.*?)\n", input_str)
    desc_match = re.search(r"Job Description:\s*(.*?)\n", input_str)
    req_match = re.search(r"Requirements:\s*(.*)", input_str)
    resume_text = resume_match.group(1).strip() if resume_match else ""
    job = {
        "title": title_match.group(1).strip() if title_match else "",
        "description": desc_match.group(1).strip() if desc_match else "",
        "requirements": [r.strip() for r in req_match.group(1).split(",")] if req_match else []
    }
    # Only return the LLM's interview tasks (list or string)
    tasks = await generate_interview_tasks_with_langchain(resume_text, job)
    return tasks

tools = [
    Tool(
        name="Score Resume",
        func=lambda x: None,
        coroutine=score_resume_tool,
        description=(
            "Scores a resume against job requirements. "
            "Input MUST be in this format:\n"
            "Resume: <full resume text>\n"
            "Requirements: <comma-separated requirements>\n"
            "Example:\n"
            "Resume: John Doe has 5 years of Python experience...\n"
            "Requirements: Python, FastAPI, MongoDB"
        )
    ),
    Tool(
        name="Detect Persona",
        func=lambda x: None,
        coroutine=detect_persona_tool,
        description=(
            "Detects candidate persona. "
            "Input MUST be in this format:\n"
            "Resume: <full resume text>\n"
            "Job Title: <job title>\n"
            "Job Description: <job description>\n"
            "Requirements: <comma-separated requirements>\n"
            "Example:\n"
            "Resume: John Doe has 5 years of Python experience...\n"
            "Job Title: Python Developer\n"
            "Job Description: Responsible for backend APIs...\n"
            "Requirements: Python, FastAPI, MongoDB"
        )
    ),
    Tool(
    name="Performance Review",
    func=lambda x: None,
    coroutine=performance_review_tool,
    description=(
        "Generates a performance review and metrics. "
        "Input MUST be in this format:\n"
        "Resume: <full resume text>\n"
        "Job Title: <job title>\n"
        "Job Description: <job description>\n"
        "Requirements: <comma-separated requirements>"
    )
),
    Tool(
    name="Interview Tasks",
    func=lambda x: None,
    coroutine=interview_tasks_tool,
    description=(
        "Generates interview tasks for a candidate. "
        "Input MUST be in this format:\n"
        "Resume: <full resume text>\n"
        "Job Title: <job title>\n"
        "Job Description: <job description>\n"
        "Requirements: <comma-separated requirements>\n"
        "Example:\n"
        "Resume: John Doe has 5 years of Python experience...\n"
        "Job Title: Python Developer\n"
        "Job Description: Responsible for backend APIs...\n"
        "Requirements: Python, FastAPI, MongoDB"
    )
),
    
]

agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent="zero-shot-react-description",
    handle_parsing_errors=True
)

async def agent_decide(task: str):
    # The agent will choose the right tool based on the task description
    return await agent.ainvoke(task)