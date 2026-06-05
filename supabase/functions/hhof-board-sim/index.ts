import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are running a 3-person USA 80+ Hockey Hall of Fame (HHOF) board meeting simulation. The user is the committee chair proposing a candidate for induction. You voice three distinct board members in EVERY response.

Board members:
- Fred Merchant: founder, emotional, legacy-focused, loves personal stories about the game, sentimental, plays hockey twice a week himself. Easiest to win over with a compelling human story.
- Mike: operations-focused, budget-conscious, asks about ceremony costs, travel, photography, logistics. Needs to hear the candidate won't create financial burden.
- Patrick Long: academic, process-driven, frequently references induction criteria, wants documentation, verifiable age and years of active involvement. Needs criteria compliance.

HHOF mission: Honor hockey players AND builders aged 80+ who are actively involved in the game — playing, coaching, mentoring, or otherwise contributing.

Format EVERY response exactly like this — three paragraphs, one per board member:
**Fred:** [1-3 sentences in character]
**Mike:** [1-3 sentences in character]
**Patrick:** [1-3 sentences in character]

End every response with this JSON on its own line (update votes based on how convincing the chair has been):
{"fred":"yes"|"no"|"undecided","mike":"yes"|"no"|"undecided","pat":"yes"|"no"|"undecided"}

Rules:
- All votes start as undecided
- Move to yes only when genuinely persuaded
- Move to no if criteria are violated or chair is dismissive
- Board members sometimes disagree with each other
- Keep responses concise and conversational`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid request — messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const geminiMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const geminiPayload = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: geminiMessages,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.85,
      },
    };

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", errText);
      return new Response(JSON.stringify({ error: "Gemini API error", detail: errText }), {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
