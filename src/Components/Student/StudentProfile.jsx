import { useEffect, useState } from 'react'
import API from '../../config/API'
import { UserCircleIcon, EnvelopeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import axios from 'axios'
import { motion } from 'framer-motion'


const StudentProfile = () => {
  const [studentData, setStudentData] = useState({})
  const [examStats, setExamStats] = useState({ completed: 0, total: 0 })

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) return

    const fetchStudent = async () => {
      try {
        const res = await axios.get(`https://institute-backend-wro4.onrender.com/Student/student-profile/${userId}`)
        setStudentData(res.data.studentdetails)
        console.log(res.data);
        

        // Example: fetch completed and total exam counts
        
        const examRes = await axios.get(`https://institute-backend-wro4.onrender.com/Question/student/${userId}/exam/status`,{withCredentials: true})
        setExamStats(examRes.data) // expected: { completed: 6, total: 10 }
      } catch (err) {
        console.error('Error fetching student profile:', err)
      }
    }

    fetchStudent()
  }, [])

  const { name, email, mobileNumber ,profilePhoto} = studentData
  const { completed, } = examStats
  // const progress = total ? Math.round((completed / total) * 100) : 0

  return (
   <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md dark:bg-gray-900 dark:text-white"
>
  <div className="flex flex-wrap items-center gap-6">
    <img
      src={profilePhoto}
      alt="Profile"
      className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
    />
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{name}</h2>
      <p className="flex items-center text-gray-600 text-sm dark:text-gray-300">
        <EnvelopeIcon className="w-4 h-4 mr-2" />
        {email}
      </p>
      <p className="flex items-center text-gray-600 text-sm dark:text-gray-300">
        <DevicePhoneMobileIcon className="w-4 h-4 mr-2" />
        {mobileNumber}
      </p>
    </div>
  </div>

  {/* Progress Section */}
  <div className="mt-6 text-center">
    {/* <ProgressCircle percentage={progress} /> */}
    <p className="text-sm text-gray-600 mt-2 dark:text-gray-300">
      {completed}  exams completed
    </p>
  </div>
</motion.div>

  )
}

// Circular SVG progress
const ProgressCircle = ({ percentage }) => {
  const radius = 45
  const stroke = 8
  const normalized = radius - stroke * 2
  const circumference = 2 * Math.PI * normalized
  const offset = circumference - (percentage / 100) * circumference

  return (
    <svg height={radius * 2} width={radius * 2} className="mx-auto">
      <circle
        stroke="#E5E7EB"
        fill="transparent"
        strokeWidth={stroke}
        r={normalized}
        cx={radius}
        cy={radius}
      />
      <motion.circle
        stroke="#3B82F6"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        r={normalized}
        cx={radius}
        cy={radius}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1 }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="text-blue-600 font-semibold"
      >
        {percentage}%
      </text>
    </svg>
  )
}

export default StudentProfile
