from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
from grading import *

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def home():
    return "Backend running 🚀"


@app.route("/grade", methods=["POST"])
def grade():
    try:
        teacher_file = request.files.get("teacher")
        student_file = request.files.get("student")

        if not teacher_file or not student_file:
            return jsonify({"error": "Upload both PDFs"}), 400

        t_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        s_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")

        teacher_file.save(t_file.name)
        student_file.save(s_file.name)

        teacher_text = extract_text(t_file.name)
        student_text = extract_text(s_file.name)

        qa_pairs = parse_teacher_pdf(teacher_text)
        questions = [q["question"] for q in qa_pairs]

        student_answers = parse_student_pdf(student_text, questions)

        results = []
        total = 0

        for i, qa in enumerate(qa_pairs):
            marks = grade_answer(
                qa["question"],
                qa["answer"],
                student_answers[i]
            )

            total += marks

            results.append({
                "question": qa["question"],
                "student_answer": student_answers[i],
                "marks": marks
            })

        return jsonify({
            "results": results,
            "total": round(total, 2),
            "max": len(results) * 10
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=8000, debug=True)