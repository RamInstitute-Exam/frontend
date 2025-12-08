'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Save, ArrowLeft, BookOpen, FileText, Clock, Calendar, CheckCircle } from 'lucide-react';
import API from '../../config/API';

type OptionKeys = 'A' | 'B' | 'C' | 'D';
type SubOptionKeys = 'i' | 'ii' | 'iii' | 'iv';

type MCQ = {
  questionNumber?: number;
  questionTextEnglish: string;
  questionTextTamil?: string;
  questionTextOCRTamil?: string;
  options: Record<OptionKeys, string>;
  subOptions?: Record<SubOptionKeys, string>; // GK-only
  correctOption: OptionKeys | '';
  questionType: 'mcq' | 'assertion-reason' | 'match' | 'passage' | 'statement' | 'assertion' | '';
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard' | '';
  imageUrl?: string;      // persisted from backend
  imageFile?: File | null;
};

type Exam = {
  examCode: string;
  examName: string;
  examDescription?: string;
  category?: string;
  year?: number | null;
  month?: number | null;
  duration?: number;
  status?: string;
  maxAttempts?: number;
  allowMultipleAttempts?: boolean;
  civilQuestions: MCQ[];
  generalKnowledgeQuestions: MCQ[];
  createdAt?: string;
  _id?: string;
};
type QuestionFile = { questionNumber: number; file: File };
const defaultOptions: Record<OptionKeys, string> = { A: '', B: '', C: '', D: '' };
const defaultSubOptions: Record<SubOptionKeys, string> = { i: '', ii: '', iii: '', iv: '' };

const makeBlankQuestion = (withSubOptions = false, nextNumber?: number): MCQ => ({
  questionNumber: nextNumber ?? 1,
  questionTextEnglish: '',
  questionTextTamil: '',
  questionTextOCRTamil: '',
  options: { ...defaultOptions },
  subOptions: withSubOptions ? { ...defaultSubOptions } : undefined,
  correctOption: '',
  questionType: 'mcq',
  explanation: '',
  difficulty: 'easy',
});

export default function EditExamGoogleFormUI() {
  const { batchId, examCode } = useParams<{ batchId: string; examCode: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exam, setExam] = useState<Exam | null>(null);
  const [imageFiles, setImageFiles] = useState<QuestionFile[]>([]);
  const [activeTab, setActiveTab] = useState<'civil' | 'gk'>('civil');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, questionNumber: number) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    setImageFiles((prev) => {
      const others = prev.filter((f) => f.questionNumber !== questionNumber);
      return [...others, { questionNumber, file }];
    });

    if (!exam) return;
    const listKey = activeTab === 'civil' ? 'civilQuestions' : 'generalKnowledgeQuestions';
    const list = [...(exam[listKey] as MCQ[])];
    const q = list.find((q) => q.questionNumber === questionNumber);
    if (q) q.imageUrl = URL.createObjectURL(file);
    setExam({ ...exam, [listKey]: list });
  };

  const questions = useMemo(
    () => (activeTab === 'civil' ? exam?.civilQuestions ?? [] : exam?.generalKnowledgeQuestions ?? []),
    [exam, activeTab]
  );

  // ===== Fetch exam =====
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        
        const encodedBatchId = encodeURIComponent(batchId || '');
        const res = await API.get<Exam>(`/Batch/${encodedBatchId}/exams/${examCode}`);

        const payload: Exam = {
          ...res.data,
          maxAttempts: res.data.maxAttempts ?? res.data.max_attempts ?? 1,
          allowMultipleAttempts: res.data.allowMultipleAttempts ?? res.data.allow_multiple_attempts ?? false,
          civilQuestions: Array.isArray(res.data.civilQuestions) ? res.data.civilQuestions : [],
          generalKnowledgeQuestions: Array.isArray(res.data.generalKnowledgeQuestions)
            ? res.data.generalKnowledgeQuestions
            : []
        };

        const normalize = (arr: any[], withSubOptions: boolean) =>
          arr.map((q: any, idx: number) => {
            // ✅ Convert flat optionA/B/C/D to nested options object
            const options = q.options || {
              A: q.optionA || '',
              B: q.optionB || '',
              C: q.optionC || '',
              D: q.optionD || ''
            };
            
            // ✅ Convert flat subOptionI/Ii/Iii/Iv to nested subOptions object (for GK)
            let subOptions = undefined;
            if (withSubOptions) {
              subOptions = q.subOptions || {
                i: q.subOptionI || '',
                ii: q.subOptionIi || '',
                iii: q.subOptionIii || '',
                iv: q.subOptionIv || ''
              };
            }
            
            return {
              id: q.id, // Preserve ID for React keys
              questionNumber: q.questionNumber ?? idx + 1,
              questionTextEnglish: q.questionTextEnglish ?? '',
              questionTextTamil: q.questionTextTamil ?? '',
              questionTextOCRTamil: q.questionTextOCRTamil ?? '',
              options: { ...defaultOptions, ...options },
              subOptions: withSubOptions ? { ...defaultSubOptions, ...subOptions } : undefined,
              correctOption: (q.correctOption as OptionKeys) || '',
              questionType: (q.questionType as MCQ['questionType']) || 'mcq',
              explanation: q.explanation ?? '',
              difficulty: (q.difficulty as MCQ['difficulty']) || 'medium',
              imageUrl: q.imageUrl || q.image_url || '', // Support both camelCase and snake_case
              hasImage: q.hasImage || !!q.imageUrl || !!q.image_url || false,
              imageFile: null
            };
          });

        payload.civilQuestions = normalize(payload.civilQuestions, false);
        payload.generalKnowledgeQuestions = normalize(payload.generalKnowledgeQuestions, true);

        setExam(payload);
        setActiveTab(payload.civilQuestions.length ? 'civil' : 'gk');
      } catch (e: any) {
        console.error('Fetch error:', e);
        const errorMessage = e.response?.data?.message || e.message || 'Failed to load exam';
        alert(`Error loading exam: ${errorMessage}`);
        if (e.response?.status === 404) {
          navigate('/admin/exams');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (batchId && examCode) {
      run();
    } else {
      setLoading(false);
      alert('Missing batchId or examCode');
      navigate('/admin/exams');
    }
  }, [batchId, examCode, navigate]);

  // ===== Handlers =====
  const setMeta = (field: keyof Exam, value: any) => {
    if (!exam) return;
    setExam({ ...exam, [field]: value });
  };

  const updateQuestion = (index: number, updates: Partial<MCQ>) => {
    if (!exam) return;
    const listKey = activeTab === 'civil' ? 'civilQuestions' : 'generalKnowledgeQuestions';
    const list = [...(exam[listKey] as MCQ[])];
    list[index] = { ...list[index], ...updates };
    setExam({ ...exam, [listKey]: list });
  };

  const updateOption = (index: number, optionKey: OptionKeys, value: string) => {
    if (!exam) return;
    const listKey = activeTab === 'civil' ? 'civilQuestions' : 'generalKnowledgeQuestions';
    const list = [...(exam[listKey] as MCQ[])];
    list[index] = { ...list[index], options: { ...list[index].options, [optionKey]: value } };
    setExam({ ...exam, [listKey]: list });
  };

  const updateSubOption = (index: number, subOptionKey: SubOptionKeys, value: string) => {
    if (!exam || activeTab !== 'gk') return;
    const list = [...(exam.generalKnowledgeQuestions as MCQ[])];
    list[index] = { 
      ...list[index], 
      subOptions: { ...(list[index].subOptions || defaultSubOptions), [subOptionKey]: value } 
    };
    setExam({ ...exam, generalKnowledgeQuestions: list });
  };

  const addQuestion = () => {
    if (!exam) return;
    const listKey = activeTab === 'civil' ? 'civilQuestions' : 'generalKnowledgeQuestions';
    const list = [...(exam[listKey] as MCQ[])];
    const withSub = activeTab === 'gk';
    const nextNumber = (list[list.length - 1]?.questionNumber ?? list.length) + 1;
    list.push(makeBlankQuestion(withSub, nextNumber));
    setExam({ ...exam, [listKey]: list });
  };

  const removeQuestion = (index: number) => {
    if (!exam) return;
    const listKey = activeTab === 'civil' ? 'civilQuestions' : 'generalKnowledgeQuestions';
    const list = [...(exam[listKey] as MCQ[])];
    if (!list.length) return;
    list.splice(index, 1);
    const renumbered = list.map((q, i) => ({ ...q, questionNumber: i + 1 }));
    setExam({ ...exam, [listKey]: renumbered });
  };

  const handleSave = async () => {
    if (!exam) return;
    try {
      setSaving(true);

      // ✅ Convert nested options back to flat optionA/B/C/D format for backend
      const convertQuestionForSave = (q: MCQ) => {
        const base: any = {
          questionNumber: q.questionNumber,
          questionTextEnglish: q.questionTextEnglish,
          questionTextTamil: q.questionTextTamil || '',
          questionTextOCRTamil: q.questionTextOCRTamil || '',
          optionA: q.options?.A || '',
          optionB: q.options?.B || '',
          optionC: q.options?.C || '',
          optionD: q.options?.D || '',
          correctOption: q.correctOption || 'A',
          questionType: q.questionType || 'mcq',
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'medium',
          imageUrl: q.imageUrl || null,
          hasImage: q.hasImage || false
        };
        
        // Add sub-options for GK questions
        if (q.subOptions) {
          base.subOptionI = q.subOptions.i || '';
          base.subOptionIi = q.subOptions.ii || '';
          base.subOptionIii = q.subOptions.iii || '';
          base.subOptionIv = q.subOptions.iv || '';
        }
        
        return base;
      };

      const payload: any = {
        examCode: exam.examCode,
        examName: exam.examName,
        examDescription: exam.examDescription || '',
        category: exam.category || '',
        year: exam.year,
        month: exam.month,
        duration: exam.duration || 0,
        maxAttempts: exam.maxAttempts || 1,
        allowMultipleAttempts: exam.allowMultipleAttempts || false,
        civilQuestions: (exam.civilQuestions || []).map((q, idx) => ({
          ...convertQuestionForSave(q),
          questionNumber: q.questionNumber ?? idx + 1
        })),
        generalKnowledgeQuestions: (exam.generalKnowledgeQuestions || []).map((q, idx) => ({
          ...convertQuestionForSave(q),
          questionNumber: q.questionNumber ?? idx + 1
        }))
      };

      const formData = new FormData();
      formData.append('examData', JSON.stringify(payload));

      imageFiles.forEach((f) => {
        formData.append('questionImages', f.file, `q${f.questionNumber}.png`);
      });

      const encodedBatchId = encodeURIComponent(batchId || '');
      await API.put(
        `/Batch/manual-upload/${encodedBatchId}/${examCode}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      alert('✅ Exam updated successfully with images!');
      navigate('/admin/exams');
    } catch (err) {
      console.error('Save error:', err);
      alert('❌ Failed to update exam.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Could not load the exam. Please check batchId/examCode.</p>
          <button
            onClick={() => navigate('/admin/exams')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Matching ExamPreview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/admin/Exams')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Exams</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-lg border p-1 bg-gray-50">
                <button
                  onClick={() => setActiveTab('civil')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'civil' ? 'bg-white shadow border' : 'text-gray-600'
                  }`}
                >
                  Civil
                </button>
                <button
                  onClick={() => setActiveTab('gk')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'gk' ? 'bg-white shadow border' : 'text-gray-600'
                  }`}
                >
                  GK
                </button>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow disabled:opacity-50"
              >
                {saving ? <Save className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={exam.examName || ''}
                onChange={(e) => setMeta('examName', e.target.value)}
                className="text-3xl font-bold text-gray-900 mb-2 w-full bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                placeholder="Untitled Exam"
              />
              <textarea
                value={exam.examDescription || ''}
                onChange={(e) => setMeta('examDescription', e.target.value)}
                className="text-gray-600 mb-4 w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none resize-none"
                placeholder="No description"
                rows={2}
              />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText size={16} />
                  <span><strong>Code:</strong> {exam.examCode}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="text"
                    value={exam.category || ''}
                    onChange={(e) => setMeta('category', e.target.value)}
                    className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium border border-transparent hover:border-purple-300 focus:border-purple-500 focus:outline-none w-20"
                    placeholder="Category"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <input
                    type="number"
                    value={exam.duration || 0}
                    onChange={(e) => setMeta('duration', Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded"
                  />
                  <span>mins</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    exam.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : exam.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {exam.status || 'draft'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <input
                    type="number"
                    value={exam.year ?? ''}
                    onChange={(e) => setMeta('year', e.target.value ? Number(e.target.value) : null)}
                    className="w-20 px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded"
                    placeholder="Year"
                  />
                  <span>,</span>
                  <input
                    type="number"
                    value={exam.month ?? ''}
                    onChange={(e) => setMeta('month', e.target.value ? Number(e.target.value) : null)}
                    className="w-16 px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded"
                    placeholder="Month"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exam.allowMultipleAttempts || false}
                      onChange={(e) => setMeta('allowMultipleAttempts', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>Allow Multiple Attempts</span>
                  </label>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Max Attempts:</span>
                  <input
                    type="number"
                    min="1"
                    value={exam.maxAttempts ?? 1}
                    onChange={(e) => setMeta('maxAttempts', e.target.value ? Number(e.target.value) : 1)}
                    className="w-16 px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded"
                    placeholder="1"
                    disabled={!exam.allowMultipleAttempts}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Count */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab === 'civil' ? 'Civil' : 'GK'} Questions ({questions.length} total)
            </h2>
            <button
              onClick={addQuestion}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Question
            </button>
          </div>
        </div>

        {/* Questions List - Editable version of Preview */}
        {questions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No questions yet. Click "Add Question" to create one.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div
                key={question.id || index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-lg font-bold">
                      <input
                        type="number"
                        value={question.questionNumber || index + 1}
                        onChange={(e) => updateQuestion(index, { questionNumber: Number(e.target.value) })}
                        className="w-10 h-10 text-center bg-transparent border border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none rounded-lg font-bold"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Question {question.questionNumber || index + 1}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {activeTab === 'gk' ? 'GK' : 'Civil'}
                        </span>
                        <select
                          value={question.questionType || ''}
                          onChange={(e) => updateQuestion(index, { questionType: e.target.value as MCQ['questionType'] })}
                          className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="mcq">MCQ</option>
                          <option value="assertion-reason">Assertion-Reason</option>
                          <option value="match">Match</option>
                          <option value="passage">Passage</option>
                          <option value="statement">Statement</option>
                          <option value="assertion">Assertion</option>
                        </select>
                        <select
                          value={question.difficulty || 'medium'}
                          onChange={(e) => updateQuestion(index, { difficulty: e.target.value as MCQ['difficulty'] })}
                          className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full border border-transparent hover:border-purple-300 focus:border-purple-500 focus:outline-none capitalize"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-lg">
                      <CheckCircle size={16} />
                      <span className="text-sm font-semibold">Answer:</span>
                      <select
                        value={question.correctOption || ''}
                        onChange={(e) => updateQuestion(index, { correctOption: e.target.value as OptionKeys })}
                        className="bg-transparent border border-transparent hover:border-green-300 focus:border-green-500 focus:outline-none font-semibold text-sm"
                      >
                        <option value="">Select</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    <button
                      onClick={() => removeQuestion(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete question"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question (English)</label>
                  <textarea
                    value={question.questionTextEnglish || ''}
                    onChange={(e) => updateQuestion(index, { questionTextEnglish: e.target.value })}
                    className="w-full text-base text-gray-800 leading-relaxed p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                    rows={3}
                    placeholder="Enter question text (English)..."
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-2 mt-3">Question (Tamil)</label>
                  <textarea
                    value={question.questionTextTamil || ''}
                    onChange={(e) => updateQuestion(index, { questionTextTamil: e.target.value })}
                    className="w-full text-base text-gray-600 leading-relaxed p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                    rows={2}
                    placeholder="Question text (Tamil)..."
                  />
                  
                  {/* Question Image - Display existing image prominently */}
                  {(question.imageUrl || question.hasImage) && question.imageUrl && (
                    <div className="mt-4 mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question Image</label>
                      <div className="border-2 border-gray-200 rounded-lg p-2 bg-gray-50">
                        <img
                          src={question.imageUrl}
                          alt={`Question ${question.questionNumber}`}
                          className="max-w-full h-auto rounded-lg mx-auto"
                          onError={(e) => {
                            console.error('Image failed to load:', question.imageUrl);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Question Image Upload */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {question.imageUrl ? 'Replace Question Image' : 'Upload Question Image'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, question.questionNumber!)}
                      className="mb-2"
                    />
                    {question.hasImage && !question.imageUrl && (
                      <p className="text-sm text-yellow-600 mt-1">
                        ⚠️ This question is marked as having an image, but no image URL is available.
                      </p>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    const optionKey = option as OptionKeys;
                    const optionText = question.options?.[optionKey] || '';
                    const isCorrect = question.correctOption === option;
                    
                    return (
                      <div
                        key={option}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isCorrect
                            ? 'bg-green-50 border-green-500'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            {option}
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={optionText}
                              onChange={(e) => updateOption(index, optionKey, e.target.value)}
                              className="w-full text-sm text-gray-800 leading-relaxed p-2 border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded bg-transparent resize-none"
                              rows={2}
                              placeholder={`Option ${option}...`}
                            />
                            {isCorrect && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-green-700 font-medium">
                                <CheckCircle size={12} />
                                <span>Correct Answer</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* GK Sub-options */}
                {activeTab === 'gk' && question.subOptions && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Sub-options:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {['i', 'ii', 'iii', 'iv'].map((subOpt) => {
                        const subOptKey = subOpt as SubOptionKeys;
                        const subOptText = question.subOptions?.[subOptKey] || '';
                        return (
                          <div key={subOpt} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-bold text-gray-600">({subOpt})</span>
                              <textarea
                                value={subOptText}
                                onChange={(e) => updateSubOption(index, subOptKey, e.target.value)}
                                className="flex-1 text-sm text-gray-700 p-1 border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded bg-transparent resize-none"
                                rows={2}
                                placeholder={`Suboption ${subOpt}...`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Explanation:</h4>
                  <textarea
                    value={question.explanation || ''}
                    onChange={(e) => updateQuestion(index, { explanation: e.target.value })}
                    className="w-full text-sm text-gray-600 leading-relaxed p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                    rows={2}
                    placeholder="Why this option is correct..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {questions.length} question{questions.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/Exams')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
