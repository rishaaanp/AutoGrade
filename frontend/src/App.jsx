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
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
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
    <div style={styles.container}>
      <h1 style={styles.title}>📄 AutoGrade AI</h1>

      <div style={styles.card}>
        <div style={styles.uploadBox}>
          <label>Teacher PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setTeacherFile(e.target.files[0])}
          />
          {teacherFile && <p>{teacherFile.name}</p>}
        </div>

        <div style={styles.uploadBox}>
          <label>Student PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setStudentFile(e.target.files[0])}
          />
          {studentFile && <p>{studentFile.name}</p>}
        </div>

        <button onClick={handleSubmit} disabled={loading} style={styles.button}>
          {loading ? "Grading..." : "Grade Now"}
        </button>
      </div>

      {result && (
        <div style={styles.result}>
          <h2>🎯 Score: {result.total} / {result.max}</h2>

          {result.results.map((r, i) => (
            <div key={i} style={styles.question}>
              <p><b>Q{i + 1}:</b> {r.question}</p>
              <p><b>Answer:</b> {r.student_answer}</p>
              <p style={styles.marks}><b>Marks:</b> {r.marks} / 10</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "auto",
    padding: "30px",
    fontFamily: "Arial"
  },
  title: {
    textAlign: "center",
    marginBottom: "20px"
  },
  card: {
    background: "#f5f5f5",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  uploadBox: {
    marginBottom: "15px"
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  result: {
    marginTop: "30px"
  },
  question: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "10px",
    border: "1px solid #ddd"
  },
  marks: {
    color: "green",
    fontWeight: "bold"
  }
};

export default App;