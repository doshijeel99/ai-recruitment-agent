from sentence_transformers import SentenceTransformer, util
from fastapi import HTTPException

# You may want to load this model only once and share it
sbert_model = SentenceTransformer('all-MiniLM-L6-v2')

async def score_resume_with_sbert(resume_text: str, job_requirements: list) -> float:
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