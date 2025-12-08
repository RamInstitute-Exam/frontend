import React, { useState, useEffect, useCallback } from 'react';
import { UploadCloud, FileText, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { batchAPI } from '../../services/apiService'; 
import pythonApiService from '../../services/pythonApiService';

export default function PDFUpload() {
  const [examCode, setExamCode] = useState('');
  const [examName, setExamName] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [duration, setDuration] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [questionPdf, setQuestionPdf] = useState(null);
  const [answerPdf, setAnswerPdf] = useState(null);
  const [batchName, setBatchName] = useState('');
  const [customBatch, setCustomBatch] = useState('');
  const [examType, setExamType] = useState('Civil');
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [publishImmediately, setPublishImmediately] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [allowMultipleAttempts, setAllowMultipleAttempts] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(null);

  // Fetch batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await batchAPI.getBatches();
        const batchesData = Array.isArray(res) ? res : [];
        setBatches(batchesData);
      } catch (err) {
        console.error('Error fetching batches:', err);
      }
    };
    fetchBatches();
  }, []);

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('examDraft');
    if (draft) {
      const data = JSON.parse(draft);
      setExamCode(data.examCode || '');
      setExamName(data.examName || '');
      setExamDescription(data.examDescription || '');
      setCategory(data.category || '');
      setYear(data.year || '');
      setMonth(data.month || '');
      setDuration(data.duration || '');
      setBatchName(data.batchName || '');
      setExamType(data.examType || 'Civil');
    }
  }, []);

  // Save draft
  useEffect(() => {
    const draft = {
      examCode,
      examName,
      examDescription,
      category,
      year,
      month,
      duration,
      batchName,
      examType,
    };
    localStorage.setItem('examDraft', JSON.stringify(draft));
  }, [examCode, examName, examDescription, category, year, month, duration, batchName, examType]);

  // Auto-set examType
  useEffect(() => {
    if (category === 'Civil Engineering') setExamType('Civil');
    else if (category === 'General Knowledge') setExamType('GK');
  }, [category]);

  // Form submit
  const handleSubmit = async () => {
    if (
      !examCode || !examName ||
      !category || !year || !month || !questionPdf || !answerPdf || !batchName
    ) {
      return toast.error('Please fill all required fields and upload both PDFs.');
    }

    try {
      setLoading(true);
      setUploadProgress({ stage: 'upload', message: 'Preparing files...', progress: 0 });
      setProcessingProgress(null);
      
      // Step 1: Extract PDFs using Python API
      setProcessingProgress({
        stage: 'parsing',
        message: 'Extracting text from PDFs using Python API...',
        progress: 10
      });

      let questionText = '';
      let answerText = '';
      let extractionMethod = 'nodejs'; // fallback

      try {
        // Check if Python API is available
        const pythonHealth = await pythonApiService.checkPythonAPIHealth();
        
        if (pythonHealth.available) {
          console.log('✅ Python API available, using for PDF extraction');
          setProcessingProgress({
            stage: 'parsing',
            message: 'Extracting text from PDFs using Python (PyMuPDF/pdfplumber)...',
            progress: 20
          });

          // Extract using Python API with OCR enabled for Tamil text
          const extractionResult = await pythonApiService.extractBatchPDFs(questionPdf, answerPdf, true);
          
          if (extractionResult.question?.success) {
            questionText = extractionResult.question.text;
            extractionMethod = extractionResult.question.method || 'python';
            console.log(`✅ Question PDF extracted using: ${extractionMethod}`);
            setProcessingProgress({
              stage: 'parsing',
              message: `Question PDF extracted successfully (${extractionMethod})`,
              progress: 50
            });
          } else {
            throw new Error(extractionResult.question?.error || 'Question PDF extraction failed');
          }

          if (extractionResult.answer?.success) {
            answerText = extractionResult.answer.text;
            extractionMethod = extractionResult.answer.method || 'python';
            console.log(`✅ Answer PDF extracted using: ${extractionMethod}`);
            setProcessingProgress({
              stage: 'parsing',
              message: `Answer PDF extracted successfully (${extractionMethod})`,
              progress: 60
            });
          } else {
            throw new Error(extractionResult.answer?.error || 'Answer PDF extraction failed');
          }
        } else {
          console.warn('⚠️ Python API not available, falling back to Node.js backend');
          throw new Error('Python API not available');
        }
      } catch (pythonError) {
        console.warn('Python API extraction failed, using Node.js backend:', pythonError);
        // Fallback to Node.js backend (which will use Python script or pdf-parse)
        setProcessingProgress({
          stage: 'parsing',
          message: 'Using Node.js backend for PDF extraction...',
          progress: 30
        });
      }

      // Step 2: Send to Node.js backend for processing
      setProcessingProgress({
        stage: 'parsing',
        message: 'Sending extracted text to backend for processing...',
        progress: 70
      });

      const formData = new FormData();
      formData.append('examCode', examCode);
      formData.append('examName', examName);
      formData.append('examDescription', examDescription);
      formData.append('category', category === 'Custom' ? customCategory : category);
      formData.append('year', year);
      formData.append('month', month);
      formData.append('duration', duration === 'Custom' ? customDuration : duration);
      formData.append('maxAttempts', allowMultipleAttempts ? maxAttempts.toString() : '0');
      formData.append('allowMultipleAttempts', 'true');
      formData.append('batchName', batchName === 'Custom' ? customBatch : batchName);
      formData.append('questionPDF', questionPdf);
      formData.append('answerPDF', answerPdf);
      formData.append('examType', examType);
      formData.append('publishImmediately', publishImmediately);
      
      // If we have extracted text from Python, send it too (backend can use it)
      if (questionText) {
        formData.append('questionText', questionText);
        formData.append('answerText', answerText);
        formData.append('extractionMethod', extractionMethod);
      }

      // Upload with progress tracking
      let progressIdFromHeader = null;
      const response = await batchAPI.uploadExamPDF(formData, (progress) => {
        setUploadProgress(progress);
        // When upload reaches 100%, show processing
        if (progress.progress === 100) {
          setProcessingProgress({
            stage: 'parsing',
            message: 'Processing extracted text and saving to database...',
            progress: 80
          });
        }
      }, (headers) => {
        // Extract progressId from response headers if available
        if (headers && headers['x-progress-id']) {
          progressIdFromHeader = headers['x-progress-id'];
          console.log('📥 Got progressId from header:', progressIdFromHeader);
        }
      });

      console.log('📥 Upload response received:', response);
      console.log('📥 Response type:', typeof response);
      console.log('📥 Response keys:', Object.keys(response || {}));
      console.log('📥 Response.progressId:', response?.progressId);
      console.log('📥 Response.data:', response?.data);
      console.log('📥 Response.data?.progressId:', response?.data?.progressId);
      console.log('📥 progressIdFromHeader:', progressIdFromHeader);

      // Extract progressId from response (handle different response structures)
      let progressId = null;
      if (response) {
        progressId = response.progressId || response.data?.progressId || progressIdFromHeader;
      } else if (progressIdFromHeader) {
        progressId = progressIdFromHeader;
      }
      
      console.log('✅ Final extracted progressId:', progressId);
      
      if (!progressId) {
        console.error('❌ No progressId found! Cannot start polling.');
        toast.error('Failed to get progress ID. Please check console for details.');
      }

      // If we got a progressId, poll for processing progress
      if (progressId) {
        console.log('Starting progress polling with ID:', progressId);
        // Start polling immediately
        const pollProgress = async () => {
          const maxAttempts = 300; // 5 minutes max (1 second intervals)
          let attempts = 0;
          
          // Poll immediately first time
          const pollOnce = async () => {
            try {
              console.log(`Polling progress (attempt ${attempts + 1})...`);
              const progress = await batchAPI.getUploadProgress(progressId);
              console.log('Progress received:', progress);
              
              if (progress) {
                setProcessingProgress(progress);
                
                if (progress.stage === 'complete' || progress.stage === 'error') {
                  setLoading(false); // Stop loading on completion or error
                  if (progress.stage === 'complete') {
                    toast.success(`Upload successful! ${progress.questionCount || 0} questions processed.`);
                  } else {
                    toast.error(progress.message || 'Processing failed');
                  }
                  return true; // Stop polling
                }
              }
              return false; // Continue polling
            } catch (err) {
              console.error('Error polling progress:', err);
              console.error('Error details:', err.response?.data || err.message);
              // If progress not found, might be too early - continue polling
              return false;
            }
          };
          
          // Poll immediately
          const shouldStop = await pollOnce();
          if (shouldStop) return;
          
          // Then poll every second
          const interval = setInterval(async () => {
            attempts++;
            
            try {
              console.log(`Polling progress (attempt ${attempts})...`);
              const progress = await batchAPI.getUploadProgress(progressId);
              console.log('Progress received:', progress);
              
              if (progress) {
                setProcessingProgress(progress);
                
                if (progress.stage === 'complete' || progress.stage === 'error') {
                  clearInterval(interval);
                  setLoading(false); // Stop loading on completion or error
                  if (progress.stage === 'complete') {
                    toast.success(`Upload successful! ${progress.questionCount || 0} questions processed.`);
                  } else {
                    toast.error(progress.message || 'Processing failed');
                  }
                  return;
                }
              } else {
                console.warn('No progress data received');
              }
            } catch (err) {
              console.error('Error polling progress:', err);
              console.error('Error details:', err.response?.data || err.message);
              // Continue polling even on error (might be temporary)
            }
            
            if (attempts >= maxAttempts) {
              clearInterval(interval);
              toast.warning('Processing is taking longer than expected. Please check the status.');
            }
          }, 1000); // Poll every second
        };
        
        pollProgress();
      } else {
        // Fallback if no progressId - still show processing
        setProcessingProgress({
          stage: 'parsing',
          message: 'Processing uploaded files...',
          progress: 50
        });
        // Wait a bit then show success
        setTimeout(() => {
          setProcessingProgress({
            stage: 'complete',
            message: 'Upload completed successfully!',
            progress: 100
          });
          toast.success('Upload successful!');
        }, 2000);
      }

      localStorage.removeItem('examDraft');
      
      // Reset form after a delay to show completion
      setTimeout(() => {
        setExamCode('');
        setExamName('');
        setExamDescription('');
        setCategory('');
        setCustomCategory('');
        setYear('');
        setMonth('');
        setDuration('');
        setCustomDuration('');
        setQuestionPdf(null);
        setAnswerPdf(null);
        setBatchName('');
        setCustomBatch('');
        setExamType('Civil');
        setPublishImmediately(false);
        setUploadProgress(null);
        setProcessingProgress(null);
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error('Upload failed. Please try again.');
      setUploadProgress(null);
      setProcessingProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const batchOptions = [
    ...batches.map(b => b.batchName || b.name),
    'Custom'
  ].filter(Boolean);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg border border-blue-500/20 p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Create New Exam</h1>
            <p className="text-blue-100 mt-2 text-base">Upload exam PDFs with questions and answer keys to create a new test</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Exam Details</h2>
          <p className="text-sm text-gray-600 mt-1">Fill in the required information to create your exam</p>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            <TextInput 
              label="Exam Code" 
              value={examCode} 
              setValue={setExamCode}
              placeholder="Enter Exam Code"
              required
            />
            <TextInput 
              label="Description" 
              value={examDescription} 
              setValue={setExamDescription}
              placeholder="Enter Description (Optional)"
              full
            />
            <SelectWithCustom
              label="Category"
              value={category}
              setValue={setCategory}
              options={['General Knowledge', 'Civil Engineering', 'Custom']}
              customValue={customCategory}
              setCustomValue={setCustomCategory}
              required
            />
            <SelectInput 
              label="Exam Type" 
              value={examType} 
              setValue={setExamType} 
              options={['Civil', 'GK']}
            />
            <SelectInput 
              label="Month" 
              value={month} 
              setValue={setMonth}
              options={['1','2','3','4','5','6','7','8','9','10','11','12']}
              displayOptions={['January','February','March','April','May','June','July','August','September','October','November','December']}
              required
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <TextInput 
              label="Exam Name" 
              value={examName} 
              setValue={setExamName}
              placeholder="Enter Exam Name"
              required
            />
            <SelectWithCustom
              label="Batch"
              value={batchName}
              setValue={setBatchName}
              options={batchOptions.length > 0 ? batchOptions : ['Custom']}
              customValue={customBatch}
              setCustomValue={setCustomBatch}
              required
            />
            <SelectInput 
              label="Year" 
              value={year} 
              setValue={setYear} 
              options={(() => {
                const currentYear = new Date().getFullYear();
                const years = [];
                for (let i = currentYear - 5; i <= currentYear + 5; i++) {
                  years.push(i.toString());
                }
                return years;
              })()}
              required
            />
            <SelectWithCustom
              label="Duration (minutes)"
              value={duration}
              setValue={setDuration}
              options={['15', '30', '45', '60', '90', '120', '150', '180', '240', 'Custom']}
              customValue={customDuration}
              setCustomValue={setCustomDuration}
              required
            />
            <div className="space-y-4 pt-2">
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowMultipleAttempts}
                    onChange={(e) => {
                      setAllowMultipleAttempts(e.target.checked);
                      if (!e.target.checked) {
                        // When unchecked, reset maxAttempts to 1 (will be sent as 0 for unlimited)
                        setMaxAttempts(1);
                      }
                    }}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-gray-800">
                    Restrict Attempt Limit
                  </span>
                </label>
                <p className="text-xs text-gray-600 mt-2 ml-8">
                  {allowMultipleAttempts 
                    ? 'When checked, students will be limited to the maximum attempts specified below.'
                    : 'When unchecked, students can attempt the exam unlimited times.'}
                </p>
                {allowMultipleAttempts && (
                  <div className="ml-8 mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Maximum Attempts <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={maxAttempts}
                      onChange={(e) => setMaxAttempts(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400"
                      placeholder="Enter max attempts (e.g., 3)"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Publish Option */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={publishImmediately}
                onChange={(e) => setPublishImmediately(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
              />
              <div className="flex-1">
                <span className="text-base font-semibold text-gray-800 block">
                  Publish immediately
                </span>
                <span className="text-sm text-gray-600 mt-1 block">
                  Make exam visible to students right away. If unchecked, exam will be saved as draft and can be published later from the Exams management page.
                </span>
              </div>
            </label>
          </div>
        </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Upload PDF Files</h2>
          <p className="text-sm text-gray-600 mt-1">Upload the question paper and answer key PDFs</p>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileDropzone 
              label="Question PDF" 
              description="Drop or select Question PDF"
              file={questionPdf} 
              setFile={setQuestionPdf}
              required
            />
            <FileDropzone 
              label="Answer Key PDF" 
              description="Drop or select Answer Key PDF"
              file={answerPdf} 
              setFile={setAnswerPdf}
              required
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              setExamCode('');
              setExamName('');
              setExamDescription('');
              setCategory('');
              setYear('');
              setMonth('');
              setDuration('');
              setQuestionPdf(null);
              setAnswerPdf(null);
              setBatchName('');
              setExamType('Civil');
              setAllowMultipleAttempts(false);
              setMaxAttempts(1);
              setPublishImmediately(false);
              localStorage.removeItem('examDraft');
              toast.info('Form cleared');
            }}
            className="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-gray-700 shadow-sm hover:shadow"
          >
            Clear Form
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="w-5 h-5" />
                Create Exam
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Display */}
      {(uploadProgress || processingProgress) && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className={`px-6 py-4 border-b border-gray-200 ${
            processingProgress?.stage === 'error' 
              ? 'bg-gradient-to-r from-red-50 to-red-100' 
              : processingProgress?.stage === 'complete'
              ? 'bg-gradient-to-r from-green-50 to-green-100'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {processingProgress?.stage === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : processingProgress?.stage === 'complete' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Loader className="w-5 h-5 animate-spin text-blue-600" />
                )}
                {processingProgress?.stage === 'error' ? 'Upload Error' :
                 processingProgress?.stage === 'complete' ? 'Upload Complete' :
                 'Upload Progress'}
              </h3>
              {(processingProgress?.stage === 'error' || processingProgress?.stage === 'complete') && (
                <button
                  onClick={() => {
                    setUploadProgress(null);
                    setProcessingProgress(null);
                    setLoading(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <div className="p-6 space-y-6">
          
            {/* Upload Progress */}
            {uploadProgress && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">File Upload</span>
                  <span className="text-sm font-bold text-blue-600">{uploadProgress.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${uploadProgress.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">{uploadProgress.message}</p>
              </div>
            )}

            {/* Processing Progress */}
            {processingProgress && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">
                    {processingProgress.stage === 'ocr' ? 'OCR Processing' :
                     processingProgress.stage === 'parsing' ? 'Parsing PDF' :
                     processingProgress.stage === 'saving' ? 'Saving to Database' :
                     processingProgress.stage === 'complete' ? 'Completed' :
                     processingProgress.stage === 'error' ? 'Error' : 'Processing'}
                  </span>
                  <span className={`text-sm font-bold ${
                    processingProgress.stage === 'complete' ? 'text-green-600' :
                    processingProgress.stage === 'error' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {processingProgress.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 shadow-sm ${
                      processingProgress.stage === 'complete' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      processingProgress.stage === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}
                    style={{ width: `${processingProgress.progress}%` }}
                  />
                </div>
                <div className="space-y-1">
                  {processingProgress.stage === 'error' ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-800 mb-1">Error occurred</p>
                          <p className="text-sm text-red-700">{processingProgress.message || 'An error occurred during processing'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">
                        {processingProgress.message}
                        {processingProgress.currentPage && processingProgress.totalPages && (
                          <span className="ml-2 text-blue-600 font-medium">
                            (Page {processingProgress.currentPage} of {processingProgress.totalPages})
                          </span>
                        )}
                      </p>
                      {/* Show Python extraction method if mentioned in message */}
                      {processingProgress.message && (
                        processingProgress.message.includes('pymupdf') || 
                        processingProgress.message.includes('pdfplumber') ||
                        processingProgress.message.includes('Python')
                      ) && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg">
                          <span className="text-xs font-semibold text-green-700">🐍 Python Enhanced</span>
                          <span className="text-xs text-green-600">
                            {processingProgress.message.includes('pymupdf') ? 'PyMuPDF' : 
                             processingProgress.message.includes('pdfplumber') ? 'pdfplumber' : 
                             'Better Tamil extraction'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {processingProgress.questionCount && (
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-green-600 font-semibold">
                        {processingProgress.questionCount} questions processed successfully
                      </p>
                    </div>
                  )}
                  {processingProgress.tamilQuestionsCount !== undefined && (
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <p className="text-sm text-blue-600 font-semibold">
                        {processingProgress.tamilQuestionsCount} questions with Tamil text detected
                      </p>
                    </div>
                  )}
                  {processingProgress.subOptionsCount !== undefined && (
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <p className="text-sm text-purple-600 font-semibold">
                        {processingProgress.subOptionsCount} questions with sub-options (i, ii, iii, iv)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Text Input Component
function TextInput({ label, value, setValue, placeholder, full, required }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || `Enter ${label}`}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400"
      />
    </div>
  );
}

// Reusable Select Input Component
function SelectInput({ label, value, setValue, options, displayOptions, required }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400 cursor-pointer"
      >
        <option value="">Select {label}</option>
        {options.map((opt, idx) => (
          <option key={opt} value={opt}>
            {displayOptions ? displayOptions[idx] : opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// Select with Custom Option Component
function SelectWithCustom({ label, value, setValue, options, customValue, setCustomValue, required }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400 cursor-pointer"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {value === 'Custom' && (
        <input
          type="text"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder={`Enter custom ${label.toLowerCase()}`}
          className="mt-3 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white hover:border-gray-400"
        />
      )}
    </div>
  );
}

// File Dropzone Component
function FileDropzone({ label, description, file, setFile, required }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        toast.success(`${label} uploaded successfully`);
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  }, [setFile, label]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        toast.success(`${label} uploaded successfully`);
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    toast.info(`${label} removed`);
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <label className="block text-sm font-semibold text-gray-700 mb-3 px-6 pt-6">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById(`file-input-${label}`).click()}
        className={`
          border-2 border-dashed rounded-xl mx-6 mb-6 p-10 text-center cursor-pointer transition-all duration-300
          ${isDragging 
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-[1.02]' 
            : file 
            ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-md' 
            : 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:border-blue-400 hover:from-blue-50 hover:to-blue-100 hover:shadow-md'
          }
        `}
      >
        {file ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="p-4 bg-green-500 rounded-full shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900 mb-1">{file.name}</p>
              <p className="text-sm text-gray-600 font-medium">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeFile}
              className="mt-3 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <X size={16} />
              Remove File
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className={`p-4 rounded-full shadow-md ${isDragging ? 'bg-blue-500' : 'bg-gray-200'}`}>
                <FileText className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-gray-500'}`} />
              </div>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-700">{description || `Drop or select ${label}`}</p>
              <p className="text-sm text-gray-500 mt-2 font-medium">PDF files only • Max 50MB</p>
            </div>
            <div className="pt-2">
              <span className="inline-block px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Browse Files
              </span>
            </div>
          </div>
        )}
        <input
          id={`file-input-${label}`}
          type="file"
          accept="application/pdf"
          hidden
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
}
