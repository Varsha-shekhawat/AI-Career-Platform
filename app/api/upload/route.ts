import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getPrisma } from "@/lib/prisma";
import { saveAnalysis } from "@/lib/analysisStore";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = (formData.get("userId") as string) || "unknown-user";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No PDF file provided." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    const prompt = `
      You are an advanced Applicant Tracking System (ATS) and expert career coach.
      Analyze the attached resume thoroughly and return ONLY a perfectly formatted JSON object.

      Evaluate the resume across these dimensions:
      1. ATS Compatibility — Can automated systems parse this resume correctly?
      2. Content Quality — Are achievements quantified? Is language impactful?
      3. Formatting — Clean layout, consistent fonts, proper section headers?
      4. Skills & Keywords — Are relevant industry keywords present?
      5. Experience — Is work history clear with measurable accomplishments?

      The JSON must use this exact structure:
      {
        "candidate_name": "Extracted full name (string)",
        "ats_score": Integer between 0 and 100 representing overall resume quality,
        "ats_certification": "One of: 'ATS Optimized' (80-100), 'ATS Compatible' (60-79), 'Partially ATS Compatible' (40-59), or 'Not ATS Friendly' (0-39) — based on the ats_score",
        "score_explanation": "A 2-3 sentence summary explaining the score and overall impression (string)",
        "section_scores": {
          "formatting": Integer 0-100 for layout, readability, consistent styling,
          "content": Integer 0-100 for quality of descriptions, quantified achievements, action verbs,
          "skills": Integer 0-100 for relevant skills coverage and keyword optimization,
          "experience": Integer 0-100 for work history clarity and impact,
          "keywords": Integer 0-100 for industry-relevant keyword density and placement
        },
        "strengths": ["Array of 4-6 specific things done well, be detailed and reference actual resume content (strings)"],
        "weaknesses": ["Array of 3-5 critical flaws or missing elements with specific explanations (strings)"],
        "recommendations": ["Array of 4-6 highly actionable, specific tips to improve the resume — mention exact sections to modify (strings)"],
        "keyword_analysis": {
          "found_keywords": ["Array of 5-10 strong industry keywords found in the resume (strings)"],
          "missing_keywords": ["Array of 3-6 important keywords that should be added for better ATS performance (strings)"]
        },
        "missing_sections": ["Array of any standard resume sections that are missing, e.g. 'Summary/Objective', 'Projects', 'Certifications', 'Education', etc. Empty array if all essential sections present (strings)"]
      }
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

    const parsedAnalysis = response.text ? JSON.parse(response.text) : null;

    if (!parsedAnalysis) {
      return NextResponse.json(
        { success: false, error: "AI returned an empty response." },
        { status: 500 }
      );
    }

    // Save the analysis — try DB first, fall back to file storage
    let analysisId = null;
    const analysisData = {
      userId,
      fileName: file.name,
      candidateName: parsedAnalysis.candidate_name || "Unknown",
      atsScore: parsedAnalysis.ats_score || 0,
      scoreExplanation: parsedAnalysis.score_explanation || "",
      strengths: parsedAnalysis.strengths || [],
      weaknesses: parsedAnalysis.weaknesses || [],
      recommendations: parsedAnalysis.recommendations || [],
    };

    const prisma = getPrisma();
    if (prisma) {
      try {
        const saved = await prisma.resumeAnalysis.create({ data: analysisData });
        analysisId = saved.id;
      } catch (dbError) {
        console.warn("DB save failed, using file storage:", dbError);
        analysisId = saveAnalysis(analysisData);
      }
    } else {
      // No DB available — use file storage
      analysisId = saveAnalysis(analysisData);
    }

    return NextResponse.json({
      success: true,
      analysisId,
      analysis: parsedAnalysis,
    });
  } catch (error) {
    console.error("Processing Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze the resume.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}