/**
 * Python API Service
 * Handles communication with Python FastAPI server for PDF extraction
 */

import axios from 'axios';

// Python API base URL (FastAPI server runs on port 5002)
const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:5002';

const pythonApiClient = axios.create({
  baseURL: PYTHON_API_URL,
  timeout: 300000, // 5 minutes for large PDFs
  headers: {
    'Accept': 'application/json',
  },
});

/**
 * Extract text from a single PDF file
 */
export const extractPDFText = async (pdfFile) => {
  const formData = new FormData();
  formData.append('file', pdfFile);
  formData.append('return_text', 'true');

  const response = await pythonApiClient.post('/extract', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Extract text from both question and answer PDFs
 * @param {File} questionPdf - Question PDF file
 * @param {File} answerPdf - Answer PDF file
 * @param {boolean} useOCR - Enable OCR for Tamil text extraction (default: true)
 */
export const extractBatchPDFs = async (questionPdf, answerPdf, useOCR = true) => {
  const formData = new FormData();
  formData.append('question_pdf', questionPdf);
  formData.append('answer_pdf', answerPdf);
  formData.append('use_ocr', useOCR); // Enable OCR for better Tamil extraction

  const response = await pythonApiClient.post('/extract-batch', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Check if Python API is available
 */
export const checkPythonAPIHealth = async () => {
  try {
    const response = await pythonApiClient.get('/health');
    return {
      available: true,
      ...response.data,
    };
  } catch (error) {
    return {
      available: false,
      error: error.message,
    };
  }
};

export default {
  extractPDFText,
  extractBatchPDFs,
  checkPythonAPIHealth,
};

