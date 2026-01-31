from flask import Flask, jsonify, request
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

# Fast regex moderation (NO ML deps)
HATE = {"nazi", "hate", "kill", "bomb", "rape", "drugs", "scam", "fraud"}

def classify(text: str):
    tokens = set(re.findall(r"[a-z']+", text.lower()))
    hits = sorted(list(tokens & HATE))
    
    if any(word in tokens for word in ["rape", "kill", "bomb"]):
        return 95, "blocked", "Dangerous content detected"
    if hits:
        return 75, "warning", "Content flagged"
    return 5, "clean", "Safe"

@app.route('/')
def home():
    return jsonify({"message": "🛡️ YakSafe API LIVE! Hackathon Ready!"})

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "hackathon": "ready"})

@app.route('/moderate', methods=['POST'])
def moderate():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    
    if not text:
        return jsonify(safe=False, reason="Empty input"), 400
    
    score, category, reason = classify(text)
    return jsonify(
        safe=score < 80,
        category=category,
        score=score,
        reason=reason if score >= 80 else None
    )

if __name__ == "__main__":
    app.run()
