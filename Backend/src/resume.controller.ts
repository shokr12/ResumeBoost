import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';

@Controller('api/resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('resume'))
  async analyze(
    @UploadedFile() file: Express.Multer.File,
    @Body('jobDescription') jobDescription: string,
  ) {
    if (!file) {
      throw new BadRequestException('Resume file (PDF) is required.');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF resumes are supported.');
    }

    try {
      // 1. Extract text from PDF buffer
      const text = await this.resumeService.extractTextFromPdf(file.buffer);
      if (!text.trim()) {
        throw new BadRequestException('Could not extract text from the PDF file.');
      }

      // 2. Perform Gemini analysis
      const analysis = await this.resumeService.analyzeResume(text, jobDescription);
      return analysis;
    } catch (error) {
      throw new BadRequestException(error.message || 'An error occurred during analysis.');
    }
  }
}
