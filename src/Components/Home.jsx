import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BookOpen, FileText, Book, Clock, Target, BarChart3 } from "lucide-react";
import logo from "../assets/Logos.jpeg";
import banner from "../assets/home-banner.jpg";
export default function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    selections: 0,
    tests: 0,
    classes: 0,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('SSC Exams');
  
  // Logo and Banner images - use imported images
  const [logoImage] = useState(
    import.meta.env.VITE_HOMEPAGE_LOGO || 
    localStorage.getItem('homepage_logo') || 
    logo // Use imported logo from assets folder
  );
  const [bannerImage] = useState(
    import.meta.env.VITE_HOMEPAGE_BANNER || 
    localStorage.getItem('homepage_banner') || 
    banner // Use imported banner from assets folder
  );

  // Animate stats on mount
  useEffect(() => {
    const targetStats = {
      students: 50000,
      selections: 12000,
      tests: 150000,
      classes: 5000,
    };

    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setStats({
        students: Math.floor(targetStats.students * progress),
        selections: Math.floor(targetStats.selections * progress),
        tests: Math.floor(targetStats.tests * progress),
        classes: Math.floor(targetStats.classes * progress),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setStats(targetStats);
      }
    }, increment);

    return () => clearInterval(timer);
  }, []);

  // Check if images fail to load
  const [logoError, setLogoError] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  // Exam Categories Data
  const examCategories = {
    'SSC Exams': [
      { name: "SSC CHSL", logo: "SSC" },
      { name: "SSC GD Constable", logo: "SSC" },
      { name: "SSC CGL", logo: "SSC" },
      { name: "SSC MTS", logo: "SSC" },
      { name: "SSC CPO", logo: "SSC" },
      { name: "Delhi Police Constable", logo: "DP" },
      { name: "Delhi Police Head Constable", logo: "DP" },
      { name: "IB MTS", logo: "IB" },
      { name: "SSC Head Constable AWO TPO", logo: "SSC" },
      { name: "SSC Selection Post", logo: "SSC" },
      { name: "SSC Stenographer", logo: "SSC" },
    ],
    'Banking Exams': [
      { name: "IBPS PO", logo: "IBPS" },
      { name: "IBPS Clerk", logo: "IBPS" },
      { name: "SBI PO", logo: "SBI" },
      { name: "SBI Clerk", logo: "SBI" },
      { name: "RBI Grade B", logo: "RBI" },
      { name: "RBI Assistant", logo: "RBI" },
      { name: "NABARD Grade A", logo: "NAB" },
      { name: "NABARD Grade B", logo: "NAB" },
      { name: "LIC AAO", logo: "LIC" },
      { name: "LIC ADO", logo: "LIC" },
    ],
    'Teaching Exams': [
      { name: "CTET", logo: "CTET" },
      { name: "UGC NET", logo: "UGC" },
      { name: "DSSSB TGT", logo: "DSS" },
      { name: "DSSSB PGT", logo: "DSS" },
      { name: "KVS TGT", logo: "KVS" },
      { name: "KVS PGT", logo: "KVS" },
      { name: "NVS TGT", logo: "NVS" },
      { name: "NVS PGT", logo: "NVS" },
      { name: "HTET", logo: "HTET" },
      { name: "REET", logo: "REET" },
    ],
    'Civil Services Exam': [
      { name: "UPSC CSE", logo: "UPSC" },
      { name: "UPSC CDS", logo: "UPSC" },
      { name: "UPSC NDA", logo: "UPSC" },
      { name: "UPSC CAPF", logo: "UPSC" },
      { name: "State PSC", logo: "PSC" },
      { name: "TNPSC Group 1", logo: "TNPSC" },
      { name: "TNPSC Group 2", logo: "TNPSC" },
      { name: "MPPSC", logo: "MPPSC" },
    ],
    'Railways Exams': [
      { name: "RRB NTPC", logo: "RRB" },
      { name: "RRB JE", logo: "RRB" },
      { name: "RRB ALP", logo: "RRB" },
      { name: "RRB Group D", logo: "RRB" },
      { name: "RRC Group D", logo: "RRC" },
      { name: "RRB Technician", logo: "RRB" },
    ],
    'Engineering Recruitment Exams': [
      { name: "GATE", logo: "GATE" },
      { name: "ESE", logo: "ESE" },
      { name: "ISRO Scientist", logo: "ISRO" },
      { name: "DRDO Scientist", logo: "DRDO" },
      { name: "BARC", logo: "BARC" },
      { name: "SSC JE", logo: "SSC" },
      { name: "DMRC JE", logo: "DMRC" },
    ],
  };

  const categories = [
    'SSC Exams',
    'Banking Exams',
    'Teaching Exams',
    'Civil Services Exam',
    'Railways Exams',
    'Engineering Recruitment Exams'
  ];

  const currentExams = examCategories[selectedCategory] || [];

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Top Announcement Bar */}
      <div className="w-full bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white text-center py-2 text-sm">
        <p className="font-medium">
          🎉 Special Offer: Get 50% off on all test series! Limited time only.
        </p>
      </div>

      {/* Header - Enhanced Professional Design */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex justify-between items-center h-16 sm:h-20 md:h-24 lg:h-28">
            {/* Logo - Enhanced with Better Styling */}
            <div className="flex items-center flex-shrink-0">
              <a href="/" className="flex items-center space-x-2 sm:space-x-3 group relative">
                {!logoError ? (
                  <div className="relative transition-transform group-hover:scale-105">
                    <img
                      src={logoImage}
                      alt="Logo"
                      className="h-10 sm:h-12 md:h-14 lg:h-16 xl:h-20 w-auto object-contain drop-shadow-sm max-h-full"
                      onError={() => setLogoError(true)}
                      onLoad={() => setLogoError(false)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 sm:space-x-2.5 group-hover:opacity-90 transition-opacity">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <span className="text-white font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">t</span>
                    </div>
                    {/* <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent lowercase tracking-tight">
                      testbook
                    </span> */}
                  </div>
                )}
              </a>
            </div>

            {/* Desktop Navigation Menu - Enhanced */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 flex-1 justify-center">
              <a 
                href="#exams" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('exams')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-700 hover:text-blue-600 transition-all flex items-center text-base xl:text-lg whitespace-nowrap px-3 py-2 rounded-lg hover:bg-blue-50 font-medium group"
              >
                Exams
                <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4 ml-1.5 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <a 
                href="#supercoaching" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('supercoaching')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-700 hover:text-blue-600 transition-all text-base xl:text-lg whitespace-nowrap px-3 py-2 rounded-lg hover:bg-blue-50 font-medium"
              >
                SuperCoaching
              </a>
              <a 
                href="#pass" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('pass')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-700 hover:text-blue-600 transition-all flex items-center text-base xl:text-lg whitespace-nowrap px-3 py-2 rounded-lg hover:bg-blue-50 font-medium group"
              >
                Pass
                <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4 ml-1.5 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <a 
                href="#footer" 
                onClick={(e) => {
                  e.preventDefault();
                  const footer = document.querySelector('footer');
                  footer?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-700 hover:text-blue-600 transition-all flex items-center text-base xl:text-lg whitespace-nowrap px-3 py-2 rounded-lg hover:bg-blue-50 font-medium group"
              >
                More
                <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4 ml-1.5 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </nav>

            {/* Right Side Actions - Enhanced */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              {/* Search - Desktop Enhanced */}
              <div className="hidden lg:flex items-center relative">
                <div className="absolute left-3 text-gray-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search exams, courses..."
                  className="pl-10 pr-4 py-2.5 xl:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm xl:text-base w-48 xl:w-64 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>

              {/* Search Icon - Mobile */}
              <button className="lg:hidden text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Language Selector - Desktop Enhanced */}
              <div className="hidden lg:flex items-center space-x-1.5 text-gray-600 cursor-pointer hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all group">
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-xs font-semibold">A</span>
                  <span className="text-[9px] font-medium">E</span>
                </div>
                <svg className="w-3 h-3 ml-0.5 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Notification Bell - Enhanced */}
              <button className="hidden md:block text-gray-600 hover:text-blue-600 relative p-2.5 rounded-lg hover:bg-gray-50 transition-all group">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>

              {/* Sign In Button - Enhanced */}
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 bg-transparent border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all text-sm sm:text-base whitespace-nowrap"
              >
                Sign In
              </button>

              {/* Get Started Button - Enhanced */}
              <button
                onClick={() => navigate("/student-Register")}
                className="px-5 py-2.5 sm:px-6 sm:py-3 lg:px-7 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg text-sm sm:text-base whitespace-nowrap transform hover:scale-105 active:scale-95"
              >
                Get Started
              </button>

              {/* Mobile Menu Button - Enhanced */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu - Enhanced */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
              <nav className="flex flex-col py-4 px-4 space-y-1">
                <a
                  href="#exams"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    document.getElementById('exams')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-between py-3 px-4 rounded-lg font-medium"
                >
                  <span>Exams</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                <a
                  href="#supercoaching"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    document.getElementById('supercoaching')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all py-3 px-4 rounded-lg font-medium"
                >
                  SuperCoaching
                </a>
                <a
                  href="#pass"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    document.getElementById('pass')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-between py-3 px-4 rounded-lg font-medium"
                >
                  <span>Pass</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                <a
                  href="#footer"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    const footer = document.querySelector('footer');
                    footer?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-between py-3 px-4 rounded-lg font-medium"
                >
                  <span>More</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/login");
                    }}
                    className="w-full px-4 py-3 bg-transparent border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/student-Register");
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
                  >
                    Get Started
                  </button>
                  <div className="flex items-center space-x-2 text-gray-600 py-2">
                    <div className="flex flex-col items-center">
                      <span className="text-xs leading-none">A</span>
                      <span className="text-[10px] leading-none">E</span>
                    </div>
                    <span className="text-sm">English</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Exact Testbook Layout */}
      <main className="w-full bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 xl:gap-16 items-center">
            {/* Left Side - Content */}
            <div className="space-y-6">
              {/* Main Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-gray-900 leading-tight">
                One Destination for Complete Exam Preparation
              </h1>

              {/* Process Flow */}
              <div className="flex items-center space-x-3 text-xl md:text-2xl lg:text-3xl">
                <span className="font-semibold text-gray-900">Learn</span>
                <span className="text-green-500 text-2xl md:text-3xl">▸</span>
                <span className="font-semibold text-gray-900">Practice</span>
                <span className="text-green-500 text-2xl md:text-3xl">▸</span>
                <span className="font-semibold text-gray-900">Improve</span>
                <span className="text-green-500 text-2xl md:text-3xl">▸</span>
                <span className="font-semibold text-gray-900">Succeed</span>
              </div>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-700">
                Start your preparation for selections. <span className="font-semibold text-green-600">For Free!</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate("/student-Register")}
                  className="px-8 py-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all shadow-lg hover:shadow-xl text-lg md:text-xl"
                >
                  Get Started For Free
                </button>
              </div>

            </div>

            {/* Right Side - Banner Image */}
            <div className="hidden lg:block relative">
              <div className="relative w-full h-[600px]">
                {/* Banner Image Container */}
                <div className="relative w-full h-full rounded-3xl overflow-hidden">
                  <img
                    src={bannerImage}
                    alt="Banner"
                    className="w-full h-full object-cover rounded-3xl shadow-2xl"
                    onError={() => setBannerError(true)}
                    onLoad={() => setBannerError(false)}
                  />
                </div>
                {/* Fallback Illustration - Only show if banner fails to load */}
                {bannerError && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 rounded-3xl p-8 flex items-end justify-center">
                    {/* Student Characters and Study Elements */}
                    <div className="relative w-full h-full">
                      {/* Student 1 - Standing with Chart */}
                      <div className="absolute bottom-20 right-20 transform">
                        <div className="relative">
                          {/* Student Figure */}
                          <div className="w-32 h-40 bg-gradient-to-b from-blue-400 to-blue-600 rounded-t-full rounded-b-lg shadow-xl"></div>
                          {/* Chart */}
                          <div className="absolute -left-16 top-0 w-24 h-20 bg-white rounded-lg shadow-lg p-2">
                            <div className="w-full h-full flex items-end space-x-1">
                              <div className="flex-1 bg-blue-200 rounded-t" style={{ height: '40%' }}></div>
                              <div className="flex-1 bg-blue-400 rounded-t" style={{ height: '60%' }}></div>
                              <div className="flex-1 bg-green-500 rounded-t" style={{ height: '80%' }}></div>
                              <div className="flex-1 bg-green-600 rounded-t" style={{ height: '100%' }}></div>
                            </div>
                            <div className="absolute -top-2 -right-2 w-16 h-12 bg-green-500 rounded-lg shadow-md flex items-center justify-center">
                              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-b-[12px] border-b-white border-r-[8px] border-r-transparent"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Student 2 - Seated at Desk */}
                      <div className="absolute bottom-16 left-24 transform">
                        <div className="relative">
                          {/* Desk */}
                          <div className="w-24 h-4 bg-amber-700 rounded shadow-lg"></div>
                          {/* Student */}
                          <div className="absolute -top-16 left-4 w-16 h-20 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-t-full rounded-b-lg shadow-xl"></div>
                          {/* Papers */}
                          <div className="absolute -top-4 left-8 w-8 h-10 bg-white rounded shadow-md"></div>
                          <div className="absolute -top-2 left-12 w-8 h-10 bg-gray-100 rounded shadow-md"></div>
                          {/* Clock */}
                          <div className="absolute -top-6 right-2 w-6 h-6 bg-white rounded-full shadow-md border-2 border-gray-300"></div>
                        </div>
                      </div>

                      {/* Student 3 - Reading Book */}
                      <div className="absolute bottom-32 left-8 transform">
                        <div className="relative">
                          {/* Student */}
                          <div className="w-20 h-28 bg-gradient-to-b from-purple-400 to-purple-600 rounded-t-full rounded-b-lg shadow-xl"></div>
                          {/* Book */}
                          <div className="absolute -left-4 top-8 w-12 h-16 bg-red-500 rounded shadow-lg"></div>
                          <div className="absolute -left-4 top-8 w-12 h-16 bg-red-600 rounded-l shadow-lg"></div>
                        </div>
                      </div>

                      {/* Floating Books and Papers */}
                      <div className="absolute top-20 right-32 w-12 h-16 bg-green-500 rounded shadow-lg transform rotate-12"></div>
                      <div className="absolute top-32 left-40 w-12 h-16 bg-orange-500 rounded shadow-lg transform -rotate-12"></div>
                      <div className="absolute top-16 left-20 w-10 h-14 bg-purple-400 rounded shadow-md transform rotate-6"></div>
                      <div className="absolute bottom-40 right-8 w-8 h-10 bg-white rounded shadow-md transform -rotate-6"></div>
                      <div className="absolute bottom-48 left-12 w-8 h-10 bg-gray-100 rounded shadow-md transform rotate-12"></div>

                      {/* Bar Charts Background */}
                      <div className="absolute top-8 right-8 w-32 h-24 bg-white rounded-lg shadow-lg p-2">
                        <div className="w-full h-full flex items-end space-x-1">
                          <div className="flex-1 bg-blue-300 rounded-t" style={{ height: '50%' }}></div>
                          <div className="flex-1 bg-blue-400 rounded-t" style={{ height: '70%' }}></div>
                          <div className="flex-1 bg-blue-500 rounded-t" style={{ height: '60%' }}></div>
                          <div className="flex-1 bg-blue-600 rounded-t" style={{ height: '80%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Statistics Section - Exact Testbook Style */}
      <section className="w-full bg-gradient-to-r from-green-50 to-green-100 py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {/* Registered Students */}
            <div className="bg-white rounded-xl p-6 shadow-lg text-center border-2 border-green-100">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
                {stats.students.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium text-base md:text-lg">Registered Students</div>
            </div>

            {/* Student Selections */}
            <div className="bg-white rounded-xl p-6 shadow-lg text-center border-2 border-green-100">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
                {stats.selections.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium text-base md:text-lg">Student Selections</div>
            </div>

            {/* Tests Attempted */}
            <div className="bg-white rounded-xl p-6 shadow-lg text-center border-2 border-green-100">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
                {stats.tests.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium text-base md:text-lg">Tests Attempted</div>
            </div>

            {/* Classes Attended */}
            <div className="bg-white rounded-xl p-6 shadow-lg text-center border-2 border-green-100">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
                {stats.classes.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium text-base md:text-lg">Classes Attended</div>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Categories Section */}
      <section id="exams" className="w-full bg-white py-12 lg:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <p className="text-gray-700 text-center mb-8 text-xl md:text-2xl lg:text-3xl">
            Get exam-ready with concepts, questions and study notes as per the latest pattern
          </p>

          {/* Exam Category Tabs */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap text-base md:text-lg transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600'
                }`}
              >
                {category}
              </button>
            ))}
            <button className="px-4 py-2 text-gray-600 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Popular Exams Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {currentExams.map((exam, index) => (
              <div
                key={index}
                onClick={() => navigate("/student/exams")}
                className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {exam.logo}
                  </div>
                  <span className="text-gray-800 font-medium text-base md:text-lg">{exam.name}</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
            <div
              onClick={() => navigate("/student/exams")}
              className="bg-white border-2 border-blue-500 rounded-lg p-4 flex items-center justify-center hover:bg-blue-50 transition-all cursor-pointer"
            >
              <span className="text-blue-600 font-semibold">Explore all exams</span>
            </div>
          </div>
        </div>
      </section>

      {/* Supercoaching Section */}
      <section id="supercoaching" className="w-full bg-gradient-to-br from-blue-50 to-blue-100 py-16 lg:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl">
            {/* Header with Logo and Branding */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-14 h-14 bg-red-600 rounded flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-3xl">S</span>
              </div>
              <div>
                <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold">
                  <span className="text-red-600">Super</span>
                  <span className="text-blue-900">coaching</span>
                </h2>
                <p className="text-blue-900 text-lg md:text-xl lg:text-2xl mt-1">with India's Super Teachers</p>
              </div>
            </div>

            {/* Main Headline */}
            <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-blue-900 mb-10">
              Crack any government exam
            </h3>

            {/* Features Grid - 2x3 Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {/* Card 1: GK Questions Tests */}
              <div className="bg-orange-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex space-x-1">
                    <div className="w-8 h-10 bg-red-500 rounded-sm"></div>
                    <div className="w-8 h-10 bg-green-500 rounded-sm"></div>
                    <div className="w-8 h-10 bg-blue-500 rounded-sm"></div>
                  </div>
                </div>
                <p className="text-gray-800 font-medium text-base md:text-lg text-center">GK Questions Tests</p>
              </div>

              {/* Card 2: Civil Questions Tests */}
              <div className="bg-orange-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="mb-4 flex items-center justify-center">
                  <FileText className="w-12 h-12 text-blue-600" />
                </div>
                <p className="text-gray-800 font-medium text-base md:text-lg text-center">Civil Questions Tests</p>
              </div>

              {/* Card 3: Complete Study Material */}
              <div className="bg-orange-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="mb-4 flex items-center justify-center">
                  <Book className="w-12 h-12 text-purple-600" />
                </div>
                <p className="text-gray-800 font-medium text-base md:text-lg text-center">Complete Study Material</p>
              </div>

              {/* Card 4: Practice Questions */}
              <div className="bg-orange-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="mb-4 flex items-center justify-center">
                  <Clock className="w-12 h-12 text-orange-600" />
                </div>
                <p className="text-gray-800 font-medium text-base md:text-lg text-center">Practice Questions</p>
              </div>

              {/* Card 5: Performance Analytics */}
              <div className="bg-orange-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="mb-4 flex items-center justify-center">
                  <Target className="w-12 h-12 text-purple-600" />
                </div>
                <p className="text-gray-800 font-medium text-base md:text-lg text-center">Performance Analytics</p>
              </div>

              {/* Card 6: Access to Mock Tests */}
              <div className="bg-orange-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="mb-4 flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-green-600" />
                </div>
                <p className="text-gray-800 font-medium text-base md:text-lg text-center">Access to Mock Tests</p>
              </div>
            </div>

            {/* CTA Button */}
            <button 
              onClick={() => navigate("/student/exams")}
              className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl text-lg md:text-xl transform hover:scale-105"
            >
              Explore Supercoaching
            </button>
          </div>
        </div>
      </section>

      {/* Testbook Pass Section */}
      <section id="pass" className="w-full bg-white py-16 lg:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Attractive Illustration */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 flex items-center justify-center relative overflow-hidden">
                  {/* Decorative Background Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
                  
                  {/* Main Phone Icon with Checkmark */}
                  <div className="relative z-10">
                    {/* Large Phone Icon */}
                    <div className="relative">
                      <div className="w-48 h-80 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-[3rem] shadow-2xl flex items-center justify-center relative transform hover:scale-105 transition-transform duration-300">
                        {/* Phone Screen */}
                        <div className="w-40 h-72 bg-white rounded-[2.5rem] m-2 flex flex-col items-center justify-center relative overflow-hidden">
                          {/* Screen Content */}
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-300 rounded-full"></div>
                          <div className="mt-8 space-y-2">
                            <div className="w-32 h-4 bg-blue-100 rounded"></div>
                            <div className="w-28 h-4 bg-gray-100 rounded"></div>
                            <div className="w-24 h-4 bg-gray-100 rounded"></div>
                          </div>
                          <div className="mt-6 grid grid-cols-2 gap-2">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                              <span className="text-2xl">GK</span>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-2xl">📋</span>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="text-2xl">📊</span>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-2xl">✓</span>
                            </div>
                          </div>
                        </div>
                        {/* Phone Frame Shadow */}
                        <div className="absolute inset-0 rounded-[3rem] border-4 border-white/20"></div>
                      </div>
                      
                      {/* Green Checkmark Badge */}
                      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300 animate-pulse">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50 animate-ping"></div>
                      </div>
                      
                      {/* Decorative Elements */}
                      <div className="absolute -top-8 -left-8 w-16 h-16 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
                      <div className="absolute top-1/2 -right-12 w-20 h-20 bg-purple-400 rounded-full opacity-20 blur-xl"></div>
                    </div>
                    
                    {/* Floating Icons Around Phone */}
                    <div className="absolute -top-12 left-8 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform">
                      <span className="text-2xl">📋</span>
                    </div>
                    <div className="absolute top-1/4 -right-16 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center transform -rotate-12 hover:rotate-0 transition-transform">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="absolute bottom-1/4 -left-12 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform">
                      <span className="text-2xl">🏆</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900">
                Access GK & Civil Question Tests
              </h2>
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-700">
                Get unlimited access to GK and Civil question tests, mock exams, and comprehensive practice materials for government exam preparation
              </p>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900">What you get</h3>
              
              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-gray-700 font-medium text-base md:text-lg">GK Question Tests</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-gray-700 font-medium">Civil Question Tests</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-gray-700 font-medium">Performance Analytics</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-gray-700 font-medium">Mock Test Series</p>
                </div>
              </div>

              <button 
                onClick={() => navigate("/student/exams")}
                className="w-full sm:w-auto px-8 py-4 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-all shadow-lg text-lg md:text-xl transform hover:scale-105"
              >
                Explore Tests
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Wall of Fame Section */}
      <section className="w-full bg-white py-16 lg:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4">
              Don't just take our word for it, our results speak for themselves
            </h2>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-600">
              We are proud to have partnered with lakhs of students in securing their dream job
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            {[
              { number: "53567", label: "Total", icon: "🏅", bg: "bg-amber-50" },
              { number: "19054", label: "Selections in SSC", icon: "🎓", bg: "bg-white" },
              { number: "18921", label: "Selections in Banking", icon: "🏦", bg: "bg-white" },
              { number: "7087", label: "Selections in Railways", icon: "🚂", bg: "bg-white" },
              { number: "8505", label: "Selections in Other Govt Exams", icon: "🏛️", bg: "bg-white" },
            ].map((stat, index) => (
              <div key={index} className={`${stat.bg} rounded-xl p-6 text-center border-2 border-gray-100`}>
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-base md:text-lg text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Wall of Fame Title */}
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="text-blue-600">testbook</span> Wall of Fame
            </h3>
          </div>

          {/* Student Profiles Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Samridhi Talwar", rank: "AIR 1", exam: "Delhi Judicial 2024", color: "from-pink-400 to-pink-600" },
              { name: "Ashish Tiwari", rank: "AIR 2", exam: "SSC CGL 2024", color: "from-blue-400 to-blue-600" },
              { name: "Debesh Bairagi", rank: "AIR 4", exam: "SSC CGL 2024", color: "from-green-400 to-green-600" },
              { name: "Ishant Shukla", rank: "AIR 8", exam: "SSC CGL 2024", color: "from-purple-400 to-purple-600" },
              { name: "Rohit Chadhar", rank: "AIR 1", exam: "SSC CHSL 2024", color: "from-red-400 to-red-600" },
              { name: "Sagardip Ghosh", rank: "AIR 3", exam: "SSC CHSL 2024", color: "from-yellow-400 to-yellow-600" },
              { name: "Mohan Kumar", rank: "AIR 1", exam: "SSC JE (ME) 2023", color: "from-indigo-400 to-indigo-600" },
              { name: "Sanket Paul", rank: "AIR 1", exam: "SSC JE (CE) 2023", color: "from-teal-400 to-teal-600" },
              { name: "Shaurya Kumar", rank: "AIR 2", exam: "SSC JE (EE) 2023", color: "from-orange-400 to-orange-600" },
              { name: "Prachi Purohit", rank: "SELECTED", exam: "UGC NET 2024", color: "from-cyan-400 to-cyan-600" },
              { name: "Anam Zafar", rank: "SELECTED", exam: "UGC NET 2024", color: "from-rose-400 to-rose-600" },
              { name: "Diksha Dawar", rank: "SELECTED", exam: "UGC NET 2024", color: "from-violet-400 to-violet-600" },
            ].map((student, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-4">
                  <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${student.color} rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs">⭐</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1 text-base md:text-lg">{student.name}</h4>
                <p className="text-sm md:text-base text-green-600 font-medium">
                  {student.rank} | {student.exam}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-800 text-gray-300 py-12 lg:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Contact Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">t</span>
                </div>
                <span className="text-xl font-semibold text-white lowercase">testbook</span>
              </div>
              <p className="text-base mb-2">Ram Institute</p>
              <p className="text-base mb-2">Simmakkal</p>
              <p className="text-base mb-2">raminstitute@gmail.com</p>
              <p className="text-base mb-2">Toll Free: 1800 203 0577</p>
              <p className="text-base">Office Hours: 10 AM to 7 PM (all 7 days)</p>
            </div>


            {/* Products */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-lg">Products</h4>
              <ul className="space-y-2 text-base">
                <li><a href="#" className="hover:text-white">GK Exams</a></li>
                <li><a href="#" className="hover:text-white">Civil Exams</a></li>
              </ul>
            </div>

            {/* App & Social */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-lg">Our App</h4>
             
              <h4 className="text-white font-semibold mb-4 text-lg">Follow us on</h4>
              <div className="flex space-x-4">
                {['f', '🐦', 'in', '📷', '▶️', 'Q'].map((icon, index) => (
                  <a key={index} href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                    <span className="text-white">{icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-base text-gray-400 mb-4 md:mb-0">
              Copyright © 2025 Ram Institute: All rights reserved
            </p>
            <div className="flex space-x-6 text-base">
              <a href="#" className="hover:text-white">User Policy</a>
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Privacy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl hover:bg-green-600 transition-all transform hover:scale-110"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
