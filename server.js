// =============================
// NeonGen AI Backend (Node.js)
// =============================

import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ----------------------
// HEALTH CHECK ENDPOINT
// ----------------------
app.get("/health", (req, res) => {
  res.status(200).json({ status: "NeonGen Backend Running ✔" });
});

// ----------------------
// IMAGE GENERATION
// ----------------------
app.post("/generate", async (req, res) => {
  try {
    const { prompt, style, resolution, count } = req.body;

    if (!prompt || !resolution) {
      return res.status(400).json({
        success: false,
        message: "Prompt and resolution are required",
      });
    }

    // Stability API URL
    const API_URL = "https://api.stability.ai/v2beta/stable-image/generate/sd3";

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `${prompt}. Style: ${style || "Realistic"}`,
        output_format: "png",
        width: resolution.split("x")[0],
        height: resolution.split("x")[1],
        samples: count || 1,
      }),
    };

    const response = await fetch(API_URL, options);

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({
        success: false,
        message: "Stability API Error",
        error: errorText,
      });
    }

    const data = await response.json();

    // API returns base64 array
    res.status(200).json({
      success: true,
      images: data.images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`NeonGen Backend Running on Port ${PORT}`));
