import { VercelRequest, VercelResponse, parseJsonBody } from './_lib/gemini.ts';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const { fileBase64, fileName, mimeType } = body;

    if (!fileBase64 || typeof fileBase64 !== 'string') {
      res.status(400).json({ error: 'No file data received' });
      return;
    }

    const lowerName = (typeof fileName === 'string' ? fileName : '').toLowerCase();
    const isPdf = mimeType === 'application/pdf' || lowerName.endsWith('.pdf');

    if (isPdf) {
      res.status(400).json({
        error:
          'PDF files are parsed directly in the browser. Please refresh and upload a text-based PDF or TXT file.',
      });
      return;
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    let extractedText = '';

    const isDocx =
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword' ||
      lowerName.endsWith('.docx') ||
      lowerName.endsWith('.doc');

    if (isDocx) {
      const mammothModule = await import('mammoth');
      const mammoth = mammothModule.default || mammothModule;
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || '';
    } else {
      extractedText = buffer.toString('utf-8');
    }

    extractedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!extractedText || extractedText.length < 30) {
      res.status(400).json({
        error:
          'Could not extract meaningful text from this file. Please upload a text-based document or paste the text directly.',
      });
      return;
    }

    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
    res.status(200).json({
      text: extractedText,
      fileName,
      wordCount,
      charCount: extractedText.length,
    });
  } catch (error: any) {
    console.error('Text extraction failed:', error);
    res.status(500).json({
      error: `Failed to extract resume text: ${error?.message || 'Unknown parsing error'}. Please paste the text manually.`,
    });
  }
}
