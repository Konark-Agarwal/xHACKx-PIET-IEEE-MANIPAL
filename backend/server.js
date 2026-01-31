require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

function isUnsafe(text) {
  const raw = text || "";
  const t = raw.toLowerCase();
  const bad = ["hate", "kill", "die", "stupid", "idiot", "moron"];
  if (bad.some(w => t.includes(w))) return { unsafe: true, reason: "Contains harmful language." };
  const letters = raw.replace(/[^a-zA-Z]/g, "");
  if (letters.length > 20 && letters === letters.toUpperCase()) return { unsafe: true, reason: "Aggressive ALL CAPS." };
  return { unsafe: false, reason: "Looks safe." };
}

app.post("/moderate", (req, res) => {
  const text = req.body?.text || "";
  const d = isUnsafe(text);
  res.json({ safe: !d.unsafe, reason: d.reason });
});

app.listen(5000, () => console.log("Backend on http://127.0.0.1:5000"));
