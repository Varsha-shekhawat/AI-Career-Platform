import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const jobDescription = formData.get("jobDescription") as string | null;

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No PDF resume provided." },
                { status: 400 }
            );
        }

        if (!jobDescription || jobDescription.trim().length < 20) {
            return NextResponse.json(
                { success: false, error: "Please provide a detailed job description (at least 20 characters)." },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString("base64");

        const prompt = `
      You are an expert AI recruiter and job matching specialist.
      I will provide you with a candidate's resume (as a PDF) and a job description.
      
      Analyze how well the resume matches the job description and return ONLY a perfectly formatted JSON object.
      
      The JSON must use this exact structure:
      {
        "candidate_name": "Extracted name from the resume (string)",
        "match_score": Integer between 0 and 100 representing how well the resume matches the job description,
        "match_summary": "A 2-3 sentence summary of the overall match (string)",
        "matching_skills": ["Array of 3-6 skills/qualifications from the resume that match the job requirements (strings)"],
        "missing_skills": ["Array of 2-5 skills/qualifications required by the job that are missing from the resume (strings)"],
        "experience_match": "A 1-2 sentence assessment of how the candidate's experience level matches the job requirements (string)",
        "suggestions": ["Array of 3-5 specific, actionable suggestions for the candidate to improve their match for this role (strings)"],
        "overall_verdict": "One of: 'Strong Match', 'Good Match', 'Partial Match', or 'Weak Match' (string)"
      }

      JOB DESCRIPTION:
      ${jobDescription}
    `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                prompt,
                { inlineData: { data: base64Data, mimeType: "application/pdf" } },
            ],
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
        console.error("Job Match Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to analyze job match.",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
