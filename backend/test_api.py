import requests

url = "http://localhost:8000/grade"

files = {
    "teacher": open("teacher5.pdf", "rb"),
    "student": open("student5.pdf", "rb")
}

res = requests.post(url, files=files)

print("STATUS:", res.status_code)
print("\n✅ FINAL RESULT:")
print(res.json())