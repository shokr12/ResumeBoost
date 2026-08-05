import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class ResumeService {
  private ai: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      return result.text || '';
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  async analyzeResume(resumeText: string, jobDescription: string) {
    const prompt = `
You are an expert technical recruiter and ATS (Applicant Tracking System) optimizer.
Analyze the following candidate's resume text against the provided job description.
Evaluate the experience, skills, structure, and keyword density.
Produce a constructive, highly structured analysis of the resume.

Job Description:
${jobDescription || 'Not provided. Analyze the resume generally for overall quality, readability, and career profile.'}

Resume Text:
${resumeText}
`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              score: {
                type: 'INTEGER',
                description:
                  'Overall Match Score from 0 to 100 based on skills, experience alignment, and keywords',
              },
              summary: {
                type: 'STRING',
                description: 'A 2-3 sentence overview of the resume alignment',
              },
              strengths: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'Key strengths matching the target profile',
              },
              weaknesses: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'Gaps, lacking details, or weaknesses found',
              },
              matchingKeywords: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description:
                  'Important technical/soft keywords from the job description that are present',
              },
              missingKeywords: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description:
                  'Keywords from the job description that are missing but should be included',
              },
              suggestions: {
                type: 'ARRAY',
                items: { type: 'STRING' },
                description: 'Actionable improvements to optimize the resume',
              },
            },
            required: [
              'score',
              'summary',
              'strengths',
              'weaknesses',
              'matchingKeywords',
              'missingKeywords',
              'suggestions',
            ],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from Gemini API');
      }
      return JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Gemini analysis failed: ${error.message}`);
    }
  }
}
