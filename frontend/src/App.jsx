import { useState } from "react";
import axios from "axios";

function App() {
  const [teacherFile, setTeacherFile] = useState(null);
  const [studentFile, setStudentFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!teacherFile || !studentFile) {
      alert("Upload both PDFs");
      return;
    }

    const formData = new FormData();
    formData.append("teacher", teacherFile);
    formData.append("student", studentFile);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8000/grade",
        formData
      );

      setResult(res.data);

    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>AutoGrade AI</h1>
        <p style={styles.subtitle}>Smart evaluation of answer sheets</p>

        <div style={styles.card}>
          <div style={styles.uploadBox}>
            <label>Teacher PDF</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setTeacherFile(e.target.files[0])}
            />
            {teacherFile && <span style={styles.file}>{teacherFile.name}</span>}
          </div>

          <div style={styles.uploadBox}>
            <label>Student PDF</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setStudentFile(e.target.files[0])}
            />
            {studentFile && <span style={styles.file}>{studentFile.name}</span>}
          </div>

          <button onClick={handleSubmit} style={styles.button}>
            {loading ? "Grading..." : "Grade Now"}
          </button>
        </div>

        {loading && <div style={styles.loader}></div>}

        {result && (
          <div style={styles.result}>
            <h2 style={styles.score}>
              Score: {result.total} / {result.max}
            </h2>

            {result.results.map((r, i) => (
              <div key={i} style={styles.question}>
                <p><strong>Q{i + 1}:</strong> {r.question}</p>
                <p><strong>Answer:</strong> {r.student_answer}</p>
                <p style={styles.marks}><strong>Marks:</strong> {r.marks} / 10</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f4f6f9",
    minHeight: "100vh",
    padding: "40px 0"
  },
  container: {
    maxWidth: "700px",
    margin: "auto",
    fontFamily: "Inter, sans-serif"
  },
  title: {
    textAlign: "center",
    fontSize: "32px",
    marginBottom: "5px"
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "25px"
  },
  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "14px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
  },
  uploadBox: {
    marginBottom: "18px",
    display: "flex",
    flexDirection: "column"
  },
  file: {
    fontSize: "12px",
    color: "#888",
    marginTop: "5px"
  },
  button: {
    marginTop: "10px",
    padding: "12px",
    width: "100%",
    background: "#9e3232",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s"
  },
  loader: {
    marginTop: "20px",
    width: "40px",
    height: "40px",
    border: "5px solid #eee",
    borderTop: "5px solid #f1d763",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginLeft: "auto",
    marginRight: "auto"
  },
  result: {
    marginTop: "30px"
  },
  score: {
    marginBottom: "15px"
  },
  question: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "12px",
    border: "1px solid #eee"
  },
  marks: {
    color: "#16a34a",
    fontWeight: "bold"
  }
};

export default App;