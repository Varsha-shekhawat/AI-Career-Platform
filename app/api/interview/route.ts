import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { role, experience, messages } = body;

        if (!role || !experience) {
            return NextResponse.json(
                { success: false, error: "Please provide the job role and experience level." },
                { status: 400 }
            );
        }

        // Build the conversation history for context
        const conversationHistory = (messages || [])
            .map((m: { role: string; content: string }) => `${m.role === "ai" ? "Interviewer" : "Candidate"}: ${m.content}`)
            .join("\n");

        const isFirstQuestion = !messages || messages.length === 0;

        const prompt = isFirstQuestion
            ? `You are an expert technical interviewer conducting a mock interview for a ${role} position.
The candidate has ${experience} of experience.

Start the interview by greeting the candidate briefly and asking your first interview question.
The question should be relevant to the ${role} role and appropriate for someone with ${experience} of experience.

Return ONLY a JSON object with this structure:
{
  "message": "Your greeting and first question (string)",
  "question_type": "Type of question: 'behavioral', 'technical', 'situational', or 'introduction' (string)",
  "tip": "A brief tip for the candidate on how to approach this type of question (string)"
}`
            : `You are an expert technical interviewer conducting a mock interview for a ${role} position.
The candidate has ${experience} of experience.

Here is the conversation so far:
${conversationHistory}

Based on the candidate's last response, do the following:
1. Give brief, constructive feedback on their answer (1-2 sentences)
2. Ask the next interview question

Make the interview feel natural and progressively more challenging. Mix behavioral and technical questions relevant to ${role}.

Return ONLY a JSON object with this structure:
{
  "feedback": "Brief feedback on their previous answer (string)",
  "message": "Your next interview question (string)",
  "question_type": "Type of question: 'behavioral', 'technical', 'situational', or 'follow-up' (string)",
  "tip": "A brief tip for the candidate on how to approach this type of question (string)",
  "answer_rating": Integer 1-10 rating of how good their previous answer was
}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [prompt],
            config: {
                responseMimeType: "application/json",
            },
        });

        const parsedResult = response.text ? JSON.parse(response.text) : null;

        if (!parsedResult) {
            return NextResponse.json(
                { success: false, error: "AI returned an empty response." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            result: parsedResult,
        });
    } catch (error) {
        console.error("Interview Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to get interview response.",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
