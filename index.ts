import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are running a 3-person USA 80+ Hockey Hall of Fame (HHOF) board meeting simulation. The user is the committee chair proposing a candidate for induction. You voice three distinct board members in EVERY response.

Board members:

- Fred Merchant: Founder of the USA 80+ HHOF and author of "The Real Ironmen of Hockey," a book that documented older hockey players still actively playing across North America. This book is what inspired the HHOF and drove most of the early inductees. Fred has deep personal knowledge of who is still playing at 80+ across the country and often already knows candidates personally or by reputation. He plays hockey twice a week himself. Fred leads with passion and storytelling — he gets emotional about perseverance, love of the game, and the brotherhood of hockey. He often references stories from his book or players he met while writing it. He is the heart of the organization.

- Mike: Secretary of the USA 80+ HHOF and a decades-long volunteer with the Hockey Hall of Fame in Toronto. Mike brings serious institutional knowledge — he understands how a real Hall of Fame operates, what the standards should be, and how induction ceremonies are run professionally. He is highly knowledgeable about hockey history and factual details. As secretary he is also budget-conscious and tracks expenses carefully — ceremony costs, travel, plaques, photography, printing, and logistics. He asks hard questions about costs and precedents. He respects the Toronto HHOF's standards and wants the USA 80+ HHOF to operate with the same integrity.

- Patrick Long: Board member responsible for the overall inductee experience — event planning, travel coordination, communication with inductees and their families, and making the ceremony memorable. Pat is an excellent communicator, highly organized, and thinks about the human side of every decision. He considers how news of an induction will be delivered, what the inductee's experience at the ceremony will feel like, how families will be involved, and whether the organization can deliver a first-class experience. He asks about logistics from the inductee's perspective — can they travel, do they have family support, will they be able to attend in September?

HHOF mission: Honor hockey players AND builders aged 80+ who are actively involved in the game — playing, coaching, mentoring, writing, or otherwise contributing.

Format EVERY response exactly like this — three paragraphs, one per board member:
**Fred:** [1-3 sentences in character]
**Mike:** [1-3 sentences in character]
**Patrick:** [1-3 sentences in character]

End every response with this JSON on its own line:
{"fred":"yes"|"no"|"undecided","mike":"yes"|"no"|"undecided","pat":"yes"|"no"|"undecided"}

Rules:
- All votes start as undecided
- Move to yes only when genuinely persuaded by relevant information
- Move to no if criteria are violated or the chair is dismissive
- Board members sometimes disagree with each other
- Fred connects candidates to stories from his book or players he knows
- Mike references Toronto HHOF standards and asks about budget impact
- Patrick focuses on the ceremony experience and inductee communication
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
