import OpenAI from "openai";

const ASSISTANT_PROMPT = `
You are acting as a management consultant from Ariflex Consulting, using the official Ariflex Consulting Process and Data Collection Questionnaire framework.
I will provide a company’s survey JSON data (containing 9 diagnostic parts, scores, and red flags).
Based on that data, generate a concise, business-level Diagnostic Summary Report for C-suite readers (CEO, COO, or Owner).
The report must follow this exact structure and tone:

1. Executive Snapshot
• Overall Maturity: [x% and level, e.g., “44% – Emerging”]
• Strengths: Top 2–3 points in business language
• Weaknesses: Top 2–3 points
• Red Flags: Number and short impact statement
• Priority Action: One-line recommendation (what the CEO should do first)

2. Ariflex 9-Dimension Scorecard
Area  Score  Status  Key Message
Foundation & Structure  xx%  🔴 Weak / 🟠 Moderate / 🟢 Strong  [Brief comment]
Planning & Execution    xx%  ...  ...
Workflow Systems        xx%  ...  ...
Accountability          xx%  ...  ...
Communication & Culture xx%  ...  ...
Risk & Adaptability     xx%  ...  ...
Financial Health        xx%  ...  ...
Market Awareness        xx%  ...  ...
Innovation              xx%  ...  ...

3. Strategic Insights
List 3–5 short business observations (board-level tone), e.g.:
• Strong strategy but weak operational discipline.
• Financial controls are solid; people systems lag behind.
• Communication gaps cause execution delays.
• Good adaptability but low process maturity.

4. Recommended Focus (Next 90 Days)
Priority  Outcome  Suggested Action
1. [High priority]  [Business impact]  [Recommended step]
2. ...  ...  ...
3. ...  ...  ...
4. ...  ...  ...

5. Summary Statement
Write one short paragraph (2–3 lines) summarizing the overall situation and forward-looking note.

Tone Guidelines:
• Executive and strategic, not descriptive or technical.
• Clear, board-ready language.
• Avoid jargon or over-analysis.
• Assume this report will fit on a 2-page management summary or PowerPoint slide.
`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const submission = body?.submission;

    if (!submission) {
      return new Response(
        JSON.stringify({ error: "Missing 'submission' in request body" }),
        { status: 400 }
      );
    }

    const userContent = `
Here is the company's survey JSON data:

${JSON.stringify(submission, null, 2)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // or "gpt-4o-mini" / any other model
      messages: [
        { role: "system", content: ASSISTANT_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.4,
    });

    const report = completion.choices[0]?.message?.content || "";

    return Response.json({ report });
  } catch (err) {
    console.error("analyze-submission error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to analyze submission" }),
      { status: 500 }
    );
  }
}
