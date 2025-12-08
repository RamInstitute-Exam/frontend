import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Award,
  ArrowRight,
  X
} from 'lucide-react';
import { testSeriesAPI } from '../../services/apiService';
import { toast } from 'react-toastify';

const MockTestInstructions = () => {
  const { examCode } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('english');
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    fetchTestDetails();
  }, [examCode]);

  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      // Fetch test details - this would need a new API endpoint
      // For now, using mock data structure
      const response = await testSeriesAPI.getMockTests({ search: examCode });
      const test = response.data?.find(t => t.exam_code === examCode);
      
      if (test) {
        setTestData(test);
      } else {
        toast.error('Test not found');
        navigate('/student/test-series');
      }
    } catch (error) {
      console.error('Error fetching test details:', error);
      toast.error('Failed to load test details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    if (!agreed) {
      toast.error(language === 'tamil' 
        ? 'தயவுசெய்து விதிமுறைகளை ஏற்றுக்கொள்ளுங்கள்' 
        : 'Please accept the terms and conditions');
      return;
    }
    navigate(`/student/test/${examCode}/start`, { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!testData) {
    return null;
  }

  const instructions = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: language === 'tamil' ? 'காலம்' : 'Duration',
      text: language === 'tamil' 
        ? `இந்த தேர்வு ${testData.duration_minutes} நிமிடங்கள் நீடிக்கும்`
        : `This test will last for ${testData.duration_minutes} minutes`
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: language === 'tamil' ? 'கேள்விகள்' : 'Questions',
      text: language === 'tamil'
        ? `மொத்தம் ${testData.total_questions} கேள்விகள் உள்ளன`
        : `There are ${testData.total_questions} questions in total`
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: language === 'tamil' ? 'மதிப்பெண்கள்' : 'Marks',
      text: language === 'tamil'
        ? `ஒவ்வொரு சரியான பதிலுக்கும் +${testData.total_marks / testData.total_questions} மதிப்பெண்கள்`
        : `+${(testData.total_marks / testData.total_questions).toFixed(1)} marks for each correct answer`
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      title: language === 'tamil' ? 'எதிர்மறை மதிப்பெண்கள்' : 'Negative Marking',
      text: testData.negative_marking
        ? language === 'tamil'
          ? `தவறான பதிலுக்கு ${testData.negative_mark_percentage}% கழிக்கப்படும்`
          : `${testData.negative_mark_percentage}% will be deducted for wrong answers`
        : language === 'tamil'
          ? 'எதிர்மறை மதிப்பெண்கள் இல்லை'
          : 'No negative marking'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'tamil' ? 'தேர்வு வழிமுறைகள்' : 'Test Instructions'}
            </h1>
            <button
              onClick={() => navigate('/student/test-series')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{testData.title}</h2>
            <p className="text-gray-700">{testData.description}</p>
          </div>

          {/* Test Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <InfoCard
              icon={<Clock className="w-5 h-5" />}
              label={language === 'tamil' ? 'காலம்' : 'Duration'}
              value={`${testData.duration_minutes} ${language === 'tamil' ? 'நிமிடங்கள்' : 'mins'}`}
            />
            <InfoCard
              icon={<BookOpen className="w-5 h-5" />}
              label={language === 'tamil' ? 'கேள்விகள்' : 'Questions'}
              value={testData.total_questions}
            />
            <InfoCard
              icon={<Award className="w-5 h-5" />}
              label={language === 'tamil' ? 'மொத்த மதிப்பெண்கள்' : 'Total Marks'}
              value={testData.total_marks}
            />
            <InfoCard
              icon={<Users className="w-5 h-5" />}
              label={language === 'tamil' ? 'கடந்து செல்ல' : 'Passing'}
              value={`${testData.passing_marks} ${language === 'tamil' ? 'மதிப்பெண்கள்' : 'marks'}`}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            {language === 'tamil' ? 'முக்கிய வழிமுறைகள்' : 'Important Instructions'}
          </h2>

          <div className="space-y-4">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 flex-shrink-0">
                  {instruction.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{instruction.title}</h3>
                  <p className="text-gray-700">{instruction.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Instructions */}
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              {language === 'tamil' ? 'கூடுதல் வழிமுறைகள்' : 'Additional Instructions'}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li>
                {language === 'tamil'
                  ? 'தேர்வு தொடங்கிய பிறகு, நீங்கள் பதில்களை சேமிக்கலாம் மற்றும் பின்னர் மதிப்பாய்வு செய்யலாம்'
                  : 'You can save answers and review them later once the test starts'}
              </li>
              <li>
                {language === 'tamil'
                  ? 'கேள்விகளை "மதிப்பாய்வுக்கு" குறிக்கலாம்'
                  : 'You can mark questions for "review"'}
              </li>
              <li>
                {language === 'tamil'
                  ? 'நேரம் முடிவடைந்தவுடன் தேர்வு தானாக சமர்ப்பிக்கப்படும்'
                  : 'The test will be auto-submitted when time expires'}
              </li>
              <li>
                {language === 'tamil'
                  ? 'தேர்வின் போது பிற தாவல்களுக்கு மாறுவது தடுக்கப்படலாம்'
                  : 'Switching to other tabs during the test may be prevented'}
              </li>
            </ul>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="agree" className="text-gray-700 cursor-pointer">
              <span className="font-semibold">
                {language === 'tamil' ? 'நான் ஒப்புக்கொள்கிறேன்:' : 'I agree to:'}
              </span>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-600">
                <li>
                  {language === 'tamil'
                    ? 'தேர்வு விதிமுறைகள் மற்றும் நிபந்தனைகளை படித்து புரிந்துகொண்டேன்'
                    : 'I have read and understood the test rules and conditions'}
                </li>
                <li>
                  {language === 'tamil'
                    ? 'நேர்மையாக தேர்வு எழுதுவேன்'
                    : 'I will take the test honestly'}
                </li>
                <li>
                  {language === 'tamil'
                    ? 'தேர்வின் போது எந்தவொரு மோசடியும் செய்ய மாட்டேன்'
                    : 'I will not engage in any malpractice during the test'}
                </li>
              </ul>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/student/test-series')}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            {language === 'tamil' ? 'மீண்டும்' : 'Go Back'}
          </button>
          <button
            onClick={handleStartTest}
            disabled={!agreed}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              agreed
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {language === 'tamil' ? 'தேர்வு தொடங்க' : 'Start Test'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
      <div className="flex justify-center mb-2 text-blue-600">
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default MockTestInstructions;

