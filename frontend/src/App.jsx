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
    <div style={styles.container}>
      <h1 style={styles.title}>🚀 AutoGrade AI</h1>
      <p style={styles.subtitle}>Upload PDFs and get instant grading</p>

      <div style={styles.card}>
        <div style={styles.uploadBox}>
          <label>Teacher PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setTeacherFile(e.target.files[0])}
          />
          {teacherFile && <p style={styles.file}>{teacherFile.name}</p>}
        </div>

        <div style={styles.uploadBox}>
          <label>Student PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setStudentFile(e.target.files[0])}
          />
          {studentFile && <p style={styles.file}>{studentFile.name}</p>}
        </div>

        <button onClick={handleSubmit} style={styles.button}>
          {loading ? "Grading..." : "Grade Now"}
        </button>
      </div>

      {loading && <div style={styles.loader}></div>}

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
    maxWidth: "700px",
    margin: "auto",
    padding: "40px",
    fontFamily: "sans-serif",
    textAlign: "center"
  },
  title: {
    fontSize: "32px",
    marginBottom: "5px"
  },
  subtitle: {
    color: "gray",
    marginBottom: "30px"
  },
  card: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)"
  },
  uploadBox: {
    marginBottom: "20px",
    textAlign: "left"
  },
  file: {
    fontSize: "12px",
    color: "gray"
  },
  button: {
    padding: "12px",
    width: "100%",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  loader: {
    marginTop: "20px",
    width: "40px",
    height: "40px",
    border: "5px solid #eee",
    borderTop: "5px solid #4CAF50",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginLeft: "auto",
    marginRight: "auto"
  },
  result: {
    marginTop: "30px"
  },
  question: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
    border: "1px solid #ddd",
    textAlign: "left"
  },
  marks: {
    color: "green",
    fontWeight: "bold"
  }
};

export default App;