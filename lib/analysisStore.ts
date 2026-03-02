import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";

interface StoredAnalysis {
    id: string;
    userId: string;
    fileName: string;
    candidateName: string;
    atsScore: number;
    scoreExplanation: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    createdAt: string;
}

const ANALYSES_FILE = path.join(process.cwd(), "data", "analyses.json");

function ensureDataDir() {
    const dir = path.dirname(ANALYSES_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function readAnalyses(): StoredAnalysis[] {
    ensureDataDir();
    if (!fs.existsSync(ANALYSES_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(ANALYSES_FILE, "utf-8");
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function writeAnalyses(analyses: StoredAnalysis[]) {
    ensureDataDir();
    fs.writeFileSync(ANALYSES_FILE, JSON.stringify(analyses, null, 2), "utf-8");
}

export function saveAnalysis(data: {
    userId: string;
    fileName: string;
    candidateName: string;
    atsScore: number;
    scoreExplanation: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
}): string {
    const analysis: StoredAnalysis = {
        id: randomBytes(12).toString("hex"),
        ...data,
        createdAt: new Date().toISOString(),
    };

    const analyses = readAnalyses();
    analyses.unshift(analysis); // newest first
    writeAnalyses(analyses);

    return analysis.id;
}

export function getAnalysesByUser(userId: string): StoredAnalysis[] {
    const analyses = readAnalyses();
    return analyses
        .filter((a) => a.userId === userId.toLowerCase())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
