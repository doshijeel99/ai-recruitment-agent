import os
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

persona_prompt = ChatPromptTemplate.from_template("""
Analyze the following candidate's resume and the job context. Summarize the candidate's professional persona in one concise sentence, focusing on their strengths, work style, and fit for the role.

Job Title: {title}
Job Description: {description}
Requirements: {requirements}

Candidate Resume:
{resume}
""")

persona_chain = persona_prompt | llm



async def detect_persona_with_langchain(resume_text: str, job: dict) -> str:
    result = await persona_chain.ainvoke({
        "title": job.get('title', ''),
        "description": job.get('description', ''),
        "requirements": ', '.join(job.get('requirements', [])),
        "resume": resume_text
    })
    return result.content.strip() if hasattr(result, "content") else str(result).strip()

