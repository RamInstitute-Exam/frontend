import React, { useState } from 'react';
import axios from 'axios';
    
const ExamUploadForm = () => {
  const [batchName, setBatchName] = useState('');
  const [examCode, setExamCode] = useState('');
  const [examName, setExamName] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [questionPDF, setQuestionPDF] = useState(null);
  const [answerPDF, setAnswerPDF] = useState(null);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!batchName || !examCode || !examName || !questionPDF || !answerPDF) {
      setStatus('Please fill all required fields and upload both PDFs.');
      return;
    }

    const formData = new FormData();
    formData.append('batchName', batchName);
    formData.append('examCode', examCode);
    formData.append('examName', examName);
    formData.append('examDescription', examDescription);
    formData.append('questionPDF', questionPDF);
    formData.append('answerPDF', answerPDF);

    try {
      setStatus('Uploading...');
      const res = await axios.post('https://institute-backend-wro4.onrender.com/upload-exam', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus(`Success! Uploaded exam with ${res.data.questionCount} questions.`);
    } catch (err) {
      setStatus('Upload failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded space-y-4">
      <h2 className="text-xl font-bold">Upload Exam PDFs</h2>

      <input
        type="text"
        placeholder="Batch Name"
        value={batchName}
        onChange={e => setBatchName(e.target.value)}
        required
        className="input-field"
      />

      <input
        type="text"
        placeholder="Exam Code"
        value={examCode}
        onChange={e => setExamCode(e.target.value)}
        required
        className="input-field"
      />

      <input
        type="text"
        placeholder="Exam Name"
        value={examName}
        onChange={e => setExamName(e.target.value)}
        required
        className="input-field"
      />

      <textarea
        placeholder="Exam Description"
        value={examDescription}
        onChange={e => setExamDescription(e.target.value)}
        className="input-field"
      />

      <div>
        <label className="block mb-1 font-semibold">Question PDF</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={e => setQuestionPDF(e.target.files[0])}
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Answer PDF</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={e => setAnswerPDF(e.target.files[0])}
          required
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        Upload Exam
      </button>

      {status && <p className="mt-2 text-center">{status}</p>}
    </form>
  );
};

export default ExamUploadForm;
