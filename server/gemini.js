import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

router.post("/suggest", async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    let code = req.body?.code || "";
    if (!code.trim()) return res.json({ suggestion: "" });

    if (code.length > 8000) {
      code = code.slice(-8000);
    }

    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    const prompt = `
You are a professional JavaScript code completion assistant.
Continue the code logically.
Return ONLY valid code.

CODE:
${code}
`;

    const result = await model.generateContent(prompt);
    const suggestion = result.response.text();

    res.json({ suggestion: suggestion.trim() });
  } catch (error) {
    console.error("Gemini SDK error:", error);
    res.status(500).json({ suggestion: "" });
  }
});

export default router;
