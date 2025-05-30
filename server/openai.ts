import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function analyzeInterview(question: string, answer: string): Promise<{
  feedback: string;
  score: number;
  suggestions: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert interview coach. Analyze the candidate's answer and provide constructive feedback, a score from 1-10, and specific suggestions for improvement. Respond with JSON in this format: { 'feedback': string, 'score': number, 'suggestions': string[] }",
        },
        {
          role: "user",
          content: `Question: ${question}\n\nAnswer: ${answer}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      feedback: result.feedback || "No feedback available",
      score: Math.max(1, Math.min(10, Math.round(result.score || 5))),
      suggestions: result.suggestions || [],
    };
  } catch (error) {
    throw new Error("Failed to analyze interview: " + (error as Error).message);
  }
}

export async function analyzeCode(code: string, language: string, problemTitle: string): Promise<{
  suggestions: string;
  efficiencyScore: number;
  isCorrect: boolean;
  improvements: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a senior software engineer. Analyze the code for correctness, efficiency, and provide suggestions for improvement. Score efficiency from 1-10. Respond with JSON in this format: { 'suggestions': string, 'efficiencyScore': number, 'isCorrect': boolean, 'improvements': string[] }",
        },
        {
          role: "user",
          content: `Problem: ${problemTitle}\nLanguage: ${language}\n\nCode:\n${code}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      suggestions: result.suggestions || "No suggestions available",
      efficiencyScore: Math.max(1, Math.min(10, Math.round(result.efficiencyScore || 5))),
      isCorrect: result.isCorrect || false,
      improvements: result.improvements || [],
    };
  } catch (error) {
    throw new Error("Failed to analyze code: " + (error as Error).message);
  }
}

export async function analyzeResume(resumeContent: string): Promise<{
  overallScore: string;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional resume reviewer. Analyze the resume and provide an overall score (X.X/10), strengths, weaknesses, and improvement suggestions. Respond with JSON in this format: { 'overallScore': string, 'feedback': { 'strengths': string[], 'weaknesses': string[], 'suggestions': string[] } }",
        },
        {
          role: "user",
          content: `Please analyze this resume:\n\n${resumeContent}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      overallScore: result.overallScore || "5.0/10",
      feedback: {
        strengths: result.feedback?.strengths || [],
        weaknesses: result.feedback?.weaknesses || [],
        suggestions: result.feedback?.suggestions || [],
      },
    };
  } catch (error) {
    throw new Error("Failed to analyze resume: " + (error as Error).message);
  }
}

export async function generateInterviewQuestion(topic: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert interviewer. Generate a thoughtful, realistic interview question for the given topic that would be asked in a technical interview.",
        },
        {
          role: "user",
          content: `Generate an interview question about: ${topic}`,
        },
      ],
    });

    return response.choices[0].message.content || "Tell me about yourself.";
  } catch (error) {
    throw new Error("Failed to generate interview question: " + (error as Error).message);
  }
}

export async function summarizeNotes(content: string, topic: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert technical writer. Create a concise, well-structured summary of the provided notes while maintaining all key concepts and important details.",
        },
        {
          role: "user",
          content: `Topic: ${topic}\n\nNotes to summarize:\n${content}`,
        },
      ],
    });

    return response.choices[0].message.content || "Summary not available";
  } catch (error) {
    throw new Error("Failed to summarize notes: " + (error as Error).message);
  }
}
