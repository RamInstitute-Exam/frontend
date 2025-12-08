'use client';

import React, { useState } from 'react';
import { Plus, Trash, ArrowLeft, ArrowRight, CheckCircle, BookOpen, FileText, Info, AlertCircle, HelpCircle, Clock, Calendar, Tag, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { batchAPI } from '../../services/apiService';

export default function CivilUpload() {
  const [step, setStep] = useState(0);
  const [batchName, setBatchName] = useState('');
  const [examCode, setExamCode] = useState('');
  const [examName, setExamName] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [duration, setDuration] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [allowMultipleAttempts, setAllowMultipleAttempts] = useState(false);


  const [questions, setQuestions] = useState([
    {
      questionText: '',
      questionTextTamil: '',
      questionTextOCRTamil: '',
      questionTextEnglish :'',
      questionNumber:1,
      options: { A: '', B: '', C: '', D: '' },
      correctOption: '',
      questionType: '',
      difficulty: '',
      explanation: '',
    },
  ]);

  const handleInputChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (index, key, value) => {
    const updated = [...questions];
    updated[index].options[key] = value;
    setQuestions(updated);
  };


  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        questionTextTamil: '',
        questionTextOCRTamil: '',
        questionTextEnglish:'',
        questionNumber: questions.length + 1,
        options: { A: '', B: '', C: '', D: '' },
       
        correctOption: '',
        questionType: '',
        difficulty: '',
        explanation: '',
      },
    ]);
    setStep(questions.length);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
    setStep((prev) => (prev > 0 ? prev - 1 : 0));
  };

const handleSubmit = async () => {
  const filledQuestions = questions.map((q, idx) => ({
    ...q,
    questionNumber: q.questionNumber || idx + 1,
  }));

  // ✅ Validate required fields
  if (!batchName || !examCode || !examName || !category || !year || !month || !duration) {
    toast.error('Please fill all required fields (Batch Name, Exam Code, Exam Name, Category, Year, Month, Duration)');
    return;
  }

  // ✅ Validate at least one question
  if (filledQuestions.length === 0) {
    toast.error('Please add at least one question');
    return;
  }

  // ✅ Validate all questions have required fields
  const invalidQuestions = filledQuestions.filter(q => 
    !q.questionTextEnglish || 
    !q.correctOption || 
    !q.options?.A || !q.options?.B || !q.options?.C || !q.options?.D
  );
  if (invalidQuestions.length > 0) {
    toast.error(`Please complete all fields for question ${invalidQuestions[0].questionNumber || '1'}`);
    return;
  }

  try {
    await batchAPI.manualUpload({
      batchName,
      examCode,
      examName,
      examDescription,
      category,
      year: year ? Number(year) : null,
      month: month ? Number(month) : null,
      duration: duration ? Number(duration) : null,
      maxAttempts,
      allowMultipleAttempts,
      civilQuestions: filledQuestions,
      publishImmediately: publishImmediately,
    });

    toast.success('Exam uploaded successfully');

    // Reset all fields
    setBatchName('');
    setExamCode('');
    setExamName('');
    setExamDescription('');
    setCategory('');
    setYear('');
    setMonth('');
    setDuration('');
    setPublishImmediately(false);
    setQuestions([
      {
        questionText: '',
        questionTextTamil: '',
        questionTextOCRTamil: '',
        questionTextEnglish: '',
        questionNumber: 1,
        options: { A: '', B: '', C: '', D: '' },
      
        correctOption: '',
        questionType: '',
        difficulty: '',
        explanation: '',
      },
    ]);
    setStep(0); // go back to form step
  } catch (err) {
    toast.error('Failed to upload exam upload',err);
  }
};




const renderQuestionForm = (q, i) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600" />
          Question {i + 1}
        </h2>
        <button
          onClick={() => removeQuestion(i)}
          className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 flex items-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Trash size={16} />
          Delete
        </button>
      </div>
    </div>
    <div className="p-8 space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Question Number</label>
          <input
            type="number"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400"
            value={q.questionNumber || i + 1}
            onChange={(e) => handleInputChange(i, "questionNumber", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Question (English) <span className="text-red-500">*</span></label>
        <textarea
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400"
          rows={3}
          value={q.questionTextEnglish || ""}
          onChange={(e) => handleInputChange(i, "questionTextEnglish", e.target.value)}
          placeholder="Enter question in English"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Question (Tamil)</label>
        <textarea
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400"
          rows={3}
          value={q.questionTextTamil || ""}
          onChange={(e) => handleInputChange(i, "questionTextTamil", e.target.value)}
          placeholder="Enter question in Tamil"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Question (OCR Tamil)</label>
        <textarea
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400"
          rows={3}
          value={q.questionTextOCRTamil || ""}
          onChange={(e) => handleInputChange(i, "questionTextOCRTamil", e.target.value)}
          placeholder="Enter OCR Tamil text"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {["A", "B", "C", "D"].map((opt) => (
          <div key={opt}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Option {opt} <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400"
              value={q.options?.[opt] || ""}
              onChange={(e) => handleOptionChange(i, opt, e.target.value)}
              placeholder={`Enter option ${opt}`}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Correct Option <span className="text-red-500">*</span></label>
          <select
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400 cursor-pointer"
            value={q.correctOption || ""}
            onChange={(e) => handleInputChange(i, "correctOption", e.target.value)}
          >
            <option value="">Select</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Question Type</label>
          <select
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400 cursor-pointer"
            value={q.questionType || ""}
            onChange={(e) => handleInputChange(i, "questionType", e.target.value)}
          >
            <option value="">Select</option>
            <option value="mcq">MCQ</option>
            <option value="assertion-reason">Assertion-Reason</option>
            <option value="match">Match</option>
            <option value="passage">Passage</option>
            <option value="statement">Statement</option>
            <option value="assertion">Assertion</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
          <select
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400 cursor-pointer"
            value={q.difficulty || ""}
            onChange={(e) => handleInputChange(i, "difficulty", e.target.value)}
          >
            <option value="">Select</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Explanation</label>
        <textarea
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400"
          rows={3}
          value={q.explanation || ""}
          onChange={(e) => handleInputChange(i, "explanation", e.target.value)}
          placeholder="Enter explanation for the answer"
        />
      </div>
    </div>
  </div>
);


  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg border border-blue-500/20 p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Civil Exam Question Upload</h1>
            <p className="text-blue-100 mt-2 text-base">Create and upload Civil exam questions manually</p>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Progress</h3>
        </div>
        <div className="p-6">
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setStep(0)} 
              className={`px-6 py-3 rounded-xl whitespace-nowrap transition-all duration-200 font-semibold ${
                step === 0 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
            >
              Exam Info
            </button>
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setStep(index + 1)}
                className={`px-6 py-3 rounded-xl whitespace-nowrap transition-all duration-200 font-semibold ${
                  step === index + 1 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                Q{index + 1}
              </button>
            ))}
            <button 
              onClick={() => setStep(questions.length + 1)} 
              className={`px-6 py-3 rounded-xl whitespace-nowrap transition-all duration-200 font-semibold ${
                step === questions.length + 1 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
            >
              Review & Submit
            </button>
          </div>
        </div>
      </div>

      {step === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-5 border-b border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Exam Information</h2>
                <p className="text-sm text-gray-600 mt-1">Fill in the required information to create your exam</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            {/* Basic Information Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    Batch Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400" 
                    value={batchName} 
                    onChange={(e) => setBatchName(e.target.value)} 
                    placeholder="e.g., Batch A, TNPSC 2025"
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    Group this exam with other exams
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Exam Code <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400" 
                    value={examCode} 
                    onChange={(e) => setExamCode(e.target.value)} 
                    placeholder="e.g., CIVIL001, TNPSC-CIVIL-2025"
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    Unique identifier for this exam
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    Exam Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400" 
                    value={examName} 
                    onChange={(e) => setExamName(e.target.value)} 
                    placeholder="e.g., TNPSC Group I - Civil Services"
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    Full name of the exam as it will appear to students
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Description
                  </label>
                  <textarea 
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400 resize-none" 
                    rows={3}
                    value={examDescription} 
                    onChange={(e) => setExamDescription(e.target.value)}
                    placeholder="Enter exam description (Optional) - Provide additional details about the exam"
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    Optional: Add instructions or additional information for students
                  </p>
                </div>
              </div>
            </div>

            {/* Exam Details Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                <Tag className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Exam Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400 cursor-pointer"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    <option value="Civil">Civil Question</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    Type of questions in this exam
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Year
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400 cursor-pointer"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    <option value="">Select Year</option>
                    {(() => {
                      const currentYear = new Date().getFullYear();
                      const years = [];
                      for (let i = currentYear - 5; i <= currentYear + 5; i++) {
                        years.push(i.toString());
                      }
                      return years.map(y => <option key={y} value={y}>{y}</option>);
                    })()}
                  </select>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    Year this exam is relevant for
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Month
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400 cursor-pointer"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    <option value="">Select Month</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((monthName, idx) => (
                      <option key={idx + 1} value={idx + 1}>{monthName}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    Month this exam is scheduled for
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400 cursor-pointer"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="">Select Duration</option>
                    {['15', '30', '45', '60', '90', '120', '150', '180', '240'].map(d => (
                      <option key={d} value={d}>{d} minutes</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    Total time allowed for students to complete the exam
                  </p>
                </div>
              </div>
            </div>
            {/* Exam Settings Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Exam Settings</h3>
              </div>
              <div className="space-y-4 mt-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowMultipleAttempts}
                      onChange={(e) => {
                        setAllowMultipleAttempts(e.target.checked);
                        if (!e.target.checked) {
                          setMaxAttempts(1);
                        }
                      }}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-base font-semibold text-gray-800">
                          Restrict Attempt Limit
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {allowMultipleAttempts 
                          ? '✓ Enabled: Students will be limited to the maximum attempts specified below.'
                          : 'When unchecked, students can attempt the exam unlimited times.'}
                      </p>
                      {allowMultipleAttempts && (
                        <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Maximum Attempts <span className="text-red-500">*</span>
                          </label>
                          <input 
                            type="number" 
                            min="1"
                            className="w-full max-w-xs px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white" 
                            value={maxAttempts} 
                            onChange={(e) => setMaxAttempts(Math.max(1, parseInt(e.target.value) || 1))} 
                            placeholder="e.g., 3"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Students can attempt this exam up to {maxAttempts} time{maxAttempts > 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl p-5 border-2 border-blue-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={publishImmediately}
                      onChange={(e) => setPublishImmediately(e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-base font-semibold text-gray-800">
                          Publish immediately
                        </span>
                        {publishImmediately && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {publishImmediately 
                          ? '✓ Exam will be visible to students immediately after creation.'
                          : 'If unchecked, exam will be saved as draft and can be published later from the exams list.'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step > 0 && step <= questions.length && renderQuestionForm(questions[step - 1], step - 1)}

      {step === questions.length + 1 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Review Questions</h2>
            <p className="text-sm text-gray-600 mt-1">Review all questions before submitting</p>
          </div>
          <div className="p-8">
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Question {i + 1}</h3>
                    <span className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-xl">
                      {q.questionType || 'MCQ'}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4 text-base leading-relaxed">{q.questionTextEnglish || q.questionText || 'No question text'}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {["A", "B", "C", "D"].map((opt) => (
                      <div key={opt} className="text-sm bg-gray-50 p-3 rounded-lg">
                        <span className="font-semibold text-gray-700">{opt}:</span> <span className="text-gray-600">{q.options?.[opt] || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-6 text-sm pt-4 border-t border-gray-200">
                    <span className="flex items-center gap-2">
                      <strong className="text-gray-600">Correct:</strong> 
                      <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold rounded-lg">{q.correctOption || 'N/A'}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <strong className="text-gray-600">Difficulty:</strong> 
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 font-semibold rounded-lg capitalize">{q.difficulty || 'N/A'}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            {step > 0 && (
              <button 
                onClick={() => setStep(step - 1)} 
                className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center gap-2 font-semibold text-gray-700 shadow-sm hover:shadow"
              >
                <ArrowLeft size={18} />
                Back
              </button>
            )}
          </div>
          <div className="flex gap-3">
            {step > 0 && step <= questions.length && (
              <button 
                onClick={addQuestion} 
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus size={18} />
                Add Question
              </button>
            )}
            {step <= questions.length && (
              <button 
                onClick={() => setStep(step + 1)} 
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Next
                <ArrowRight size={18} />
              </button>
            )}
            {step === questions.length + 1 && (
              <button 
                onClick={handleSubmit} 
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <CheckCircle size={18} />
                Submit Exam
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}