// server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// Make sure you set this in Render's Environment Variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY environment variable");
  process.exit(1);
}

// Simple health check route
app.get("/", (req, res) => {
  res.send("Pickleball Report API is running ✅");
});

app.post("/generate-report", async (req, res) => {
  try {
    const data = req.body || {};

    const playerProfile = `
Name: ${data.name || ""}
Days per week playing: ${data.daysPerWeek || ""}
Sore/tight areas: ${data.soreAreas || ""}
Warm-up habits: ${data.warmup || ""}
Recovery habits: ${data.recovery || ""}
Past injuries/surgeries: ${data.injuries || ""}
Energy level in long games: ${data.energy || ""}
When soreness shows up: ${data.sorenessTiming || ""}
Stability on lunges/reaches: ${data.stability || ""}
Feels slower than before: ${data.feelsSlower || ""}
Stiffness between games: ${data.stiffness || ""}
Extra notes: ${data.notes || ""}
    `.trim();

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 800,
        messages: [
          {
            role: "system",
            content: `
You are a Certified Pickleball Movement Specialist from Pickleball Movement Training — a performance-based fitness company that helps adults 40+ move better, play longer, and stay injury-free.

Your job is to create a short, motivational, and personalized "Pickleball Performance Report" based on the player's answers.

Tone: friendly, encouraging, professional. 7th-grade reading level. Use short paragraphs and emojis (🏓💪🔥) where helpful.

Always structure the report with these sections and emojis:
1️⃣ Intro Summary
2️⃣ Why You Feel Sore
3️⃣ Why You Feel Slow
4️⃣ What’s Holding You Back
5️⃣ Injury Risk Zone
6️⃣ Top 3 Fixes to Feel Better, Move Better, and Avoid Injury

Keep the report under 350 words and write as if you are a real human Pickleball Movement Specialist, not an AI.
            `.trim()
          },
          {
            role: "user",
            content: `
Below is the player's Pickleball Movement Check-Up:

${playerProfile}

Using this information, create their personalized Pickleball Performance Report.

Follow this structure:

🏓 INTRO SUMMARY — Briefly explain what's happening in their body that's causing soreness, stiffness, or slower movement.

💥 WHY YOU FEEL SORE — Discuss muscle fatigue, recovery habits, and joint stress.

⚡ WHY YOU FEEL SLOW — Discuss balance, coordination, strength, or stamina factors.

🧩 WHAT’S HOLDING YOU BACK — Describe any movement inefficiencies, imbalances, or lack of recovery.

🚨 INJURY RISK ZONE — List 2–3 injuries or problem areas they may be most prone to.

✅ TOP 3 FIXES — Give 3 practical action steps to improve mobility, recovery, and game performance.

End with this closing paragraph:

"Based on your results, your body’s asking for a smarter game plan — not more drills or harder play. That’s why we created the 30-Day Pickleball Kickstart Program — to help players like you move pain-free, feel stronger, and regain your speed and stamina."
            `.trim()
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    const report =
      response.data?.choices?.[0]?.message?.content ||
      "Error generating report.";

    res.json({ report });
  } catch (err) {
    console.error("Error in /generate-report:", err.response?.data || err.message);
    res.status(500).json({
      report:
        "Sorry, something went wrong generating your report. Please try again later."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Pickleball Report API running on port " + PORT);
});
