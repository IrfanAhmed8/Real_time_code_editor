import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/suggest", async (req, res) => {
  try {
    let { code } = req.body;

    if (!code || code.trim().length === 0) {
      return res.json({ suggestion: "" });
    }

    // 🔐 Limit context size (VERY IMPORTANT)
    if (code.length > 8000) {
      code = code.slice(-8000);
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
    });

    const prompt = `
You are a professional JavaScript code completion assistant.
Continue the code logically.
Return ONLY valid code. No explanations.

CODE:
${code}
`;

    const result = await model.generateContent(prompt);
    const suggestion = result.response.text();

    res.json({ suggestion: suggestion.trim() });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ suggestion: "" });
  }
});

export default router;
