from sentence_transformers import SentenceTransformer, CrossEncoder
from sklearn.metrics.pairwise import cosine_similarity
from PyPDF2 import PdfReader
import re

print("Loading models...")

embed_model = SentenceTransformer('all-MiniLM-L6-v2')
cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

print("Models ready!")


# -------- READ PDF --------
def extract_text(path):
    reader = PdfReader(path)
    text = ""
    for page in reader.pages:
        t = page.extract_text()
        if t:
            text += t + " "
    return text


# -------- PARSE TEACHER PDF --------
def parse_teacher_pdf(text):
    lines = text.split("\n")

    qa_pairs = []
    current_q = None
    current_a = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        if line.endswith("?"):
            if current_q:
                qa_pairs.append({
                    "question": current_q,
                    "answer": " ".join(current_a)
                })
            current_q = line
            current_a = []
        else:
            current_a.append(line)

    if current_q:
        qa_pairs.append({
            "question": current_q,
            "answer": " ".join(current_a)
        })

    return qa_pairs


# -------- BETTER STUDENT PARSER --------
def parse_student_pdf(text, questions):

    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 5]

    sentence_embeddings = embed_model.encode(sentences)

    answers = []

    for q in questions:
        q_emb = embed_model.encode([q])[0]

        sims = cosine_similarity([q_emb], sentence_embeddings)[0]

        # Select relevant sentences
        selected = [
            sentences[i]
            for i in range(len(sims))
            if sims[i] > 0.3
        ]

        # Fallback if nothing selected
        if not selected:
            top_indices = sims.argsort()[-3:]
            selected = [sentences[i] for i in top_indices]

        answers.append(" ".join(selected[:5]))

    return answers


# -------- EXTRACT CONCEPTS --------
def extract_concepts(answer):
    parts = re.split(r',|\.', answer)
    return [p.strip() for p in parts if len(p.strip()) > 3]


# -------- WEIGHTED CONCEPT SCORE --------
def concept_score(correct, student):

    concepts = extract_concepts(correct)

    if not concepts:
        return 0

    student_emb = embed_model.encode([student])[0]
    concept_embs = embed_model.encode(concepts)

    sims = cosine_similarity([student_emb], concept_embs)[0]

    score = 0
    max_score = 0

    for i, sim in enumerate(sims):
        weight = 1 + (len(concepts[i].split()) / 5)

        max_score += weight

        if sim > 0.5:
            score += sim * weight

    return float(score / max_score)


# -------- SEMANTIC SCORE --------
def semantic_score(correct, student):
    score = cross_encoder.predict([(correct, student)])[0]
    return float(max(0, min(1, score)))


# -------- KEYWORD SCORE --------
def keyword_score(correct, student):

    c_words = set(correct.lower().split())
    s_words = set(student.lower().split())

    if len(c_words) == 0:
        return 0

    return len(c_words & s_words) / len(c_words)


# -------- QUESTION RELEVANCE --------
def question_similarity(question, student):
    emb = embed_model.encode([question, student])
    return cosine_similarity([emb[0]], [emb[1]])[0][0]


# -------- IRRELEVANT PENALTY --------
def irrelevant_penalty(question, student):
    sim = question_similarity(question, student)

    if sim < 0.2:
        return 0.5   # heavy penalty
    elif sim < 0.4:
        return 0.8   # mild penalty
    return 1


# -------- FINAL GRADING --------
def grade_answer(question, correct, student):

    # Short answer penalty
    if len(student.split()) < 5:
        return 1

    c_score = concept_score(correct, student)
    s_score = semantic_score(correct, student)
    k_score = keyword_score(correct, student)

    penalty = irrelevant_penalty(question, student)

    final = (
        0.5 * c_score +
        0.3 * s_score +
        0.2 * k_score
    )

    # Length normalization
    length_factor = min(1, len(student.split()) / 20)
    final *= length_factor

    # Apply penalty
    final *= penalty

    marks = final * 10

    return float(round(min(10, marks), 2))