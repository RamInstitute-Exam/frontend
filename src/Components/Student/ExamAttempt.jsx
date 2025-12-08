import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ExamAttempt({ examCode, studentId }) {
  const [examData, setExamData] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionNumber: selectedOption }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
       
  // Fetch exam questions on mount
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(`/api/exams/${examCode}`); // Your backend route to get exam by examCode
        setExamData(response.data);
        setStartTime(new Date().toISOString());
      } catch (err) {
        setError('Failed to load exam questions',err);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examCode]);

  const handleAnswerChange = (questionNumber, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionNumber]: option,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const endTime = new Date().toISOString();

      const res = await axios.post('/api/student-exams/submit', {
        examCode,
        studentId,
        answers,
        startTime,
        endTime,
        autoSubmitted: false,
      });

      setSubmitResult(res.data);
    } catch (err) {
      setError('Failed to submit exam',err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading exam...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (submitResult)
    return (
      <div>
        <h2>Exam Submitted Successfully!</h2>
        <p>Your Score: {submitResult.result}%</p>
        <p>Correct Answers: {submitResult.correctAnswers}</p>
        <p>Wrong Answers: {submitResult.wrongAnswers}</p>
        <p>Attempted Questions: {submitResult.attemptedQuestions}</p>
        <p>Unanswered Questions: {submitResult.unansweredQuestions}</p>
        <p>Time Taken: {submitResult.durationInMinutes} minutes</p>
      </div>
    );

  return (
    <div>
      <h1>{examData.examName}</h1>
      <p>{examData.examDescription}</p>

      {/* Iterate over all batches and their questions */}
      {examData.batches.map((batch, batchIndex) => (
        <div key={batchIndex}>
          <h3>Batch: {batch.batchName}</h3>
          {batch.questions.map(question => (
            <div
              key={question.questionNumber}
              style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}
            >
              <p>
                <strong>Q{question.questionNumber}:</strong> {question.questionTextEnglish}
              </p>
              {question.questionTextTamil && <p><em>{question.questionTextTamil}</em></p>}

              {['A', 'B', 'C', 'D'].map(optionKey => (
                <label key={optionKey} style={{ display: 'block', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={`question_${question.questionNumber}`}
                    value={optionKey}
                    checked={answers[question.questionNumber] === optionKey}
                    onChange={() => handleAnswerChange(question.questionNumber, optionKey)}
                  />
                  {' '}
                  {optionKey}. {question.options[optionKey]}
                </label>
              ))}
            </div>
          ))}
        </div>
      ))}

      <button onClick={handleSubmit} disabled={submitting} style={{ padding: '10px 20px', fontSize: '16px' }}>
        {submitting ? 'Submitting...' : 'Submit Exam'}
      </button>
    </div>
  );
}

export default ExamAttempt;
