from flask import Flask, jsonify, request
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

# Fast, deterministic moderation (hackathon-stable)
HATE = {"nazi", "hate"}
THREATS = {"kill", "bomb", "terror"}
SEXUAL_VIOLENCE = {"rape"}
DRUGS = {"drugs"}
FRAUD = {"fraud", "scam", "fake", "cheat", "steal", "spam"}
MILD_PROFANITY = {"damn", "hell"}

def classify(text: str):
    tokens = set(re.findall(r"[a-z']+", text.lower()))

    hits = {
        "hate": sorted(list(tokens & HATE)),
        "threat": sorted(list(tokens & THREATS)),
        "sexual_violence": sorted(list(tokens & SEXUAL_VIOLENCE)),
        "drugs": sorted(list(tokens & DRUGS)),
        "fraud": sorted(list(tokens & FRAUD)),
        "profanity": sorted(list(tokens & MILD_PROFANITY)),
    }

    if hits["sexual_violence"]:
        return 99, "sexual_violence", "Sexual violence content is not allowed.", hits
    if hits["threat"]:
        return 95, "threat", "Threat/violence content is not allowed.", hits
    if hits["hate"]:
        return 92, "hate", "Hate speech is not allowed.", hits
    if hits["fraud"]:
        return 80, "fraud", "Scam/fraud content is not allowed.", hits
    if hits["drugs"]:
        return 75, "drugs", "Drug-related content is restricted.", hits
    if hits["profanity"]:
        return 55, "profanity", "Please keep language respectful.", hits

    return 5, "clean", "OK", hits

@app.get("/")
def root():
    return jsonify(ok=True, service="YakSafe API")

@app.get("/health")
def health():
    return jsonify(ok=True)

@app.post("/moderate")
def moderate():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify(safe=False, reason="Empty post", category="empty", toxicity_score=0), 400

    toxicity_score, category, reason, hits = classify(text)
    THRESHOLD_BLOCK = 70
    safe = toxicity_score < THRESHOLD_BLOCK

    return jsonify(
        safe=safe,
        reason=None if safe else reason,
        category=category,
        toxicity_score=toxicity_score,
        provider="heuristic",
        hits=hits,  # optional; you can remove for final demo
    )

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
