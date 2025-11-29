import React, { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle, XCircle, Clock, TrendingUp, Plus, Eye, GraduationCap } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const password = location.state?.password;
  
  const [dashboardStats, setDashboardStats] = useState({
    draft: 0,
    submitted: 0,
    approved: 0,
    rejected: 0
  });
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
const [professors, setProfessors] = useState([]);
const [selectedProfessor, setSelectedProfessor] = useState("");
  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
      fetchProfessors();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true);
    try {
      const res = await axios.post('/api/auth/login', {
        email: email,
        password: password,
      });

      if (res.data && res.data.user) {
        setDashboardStats({
          draft: res.data.stats?.draft || 0,
          submitted: res.data.stats?.submitted || 0,
          approved: res.data.stats?.approved || 0,
          rejected: res.data.stats?.rejected || 0
        });

        setRecentAssignments(res.data.recentAssignments || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setIsLoadingDashboard(false);
    }
  };
 // Fetch list of professors from backend
const fetchProfessors = async () => {
  try {
   const res = await fetch("/api/admin/professor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email
      })
    });

    const data = await res.json();
    
    if (data.success) {
      setProfessors(data.professors);
    }
  } catch (err) {
    console.error("Error getting professor list:", err);
  }
};

  const handleUpload = async (e) => {
    e.preventDefault();
     if (!selectedProfessor) {
    alert("Please select a professor first!");
    return;
  }

  if (!window.confirm("Are you sure you want to submit this assignment for review?")) {
    return;
  }
    if (!title || !file) {
      alert("Please fill in all fields (Title and File)!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("email", email);
      formData.append("file", file);
      formData.append("professor",selectedProfessor);

      const uploadRes = await axios.post("/api/student/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (uploadRes.data) {
        alert("Assignment uploaded successfully!");
        setTitle("");
        setFile(null);
        // Reset file input
        document.getElementById('file').value = '';
        // Refresh dashboard data
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className={`${bgColor} rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {isLoadingDashboard && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">
        {isLoadingDashboard ? '...' : value}
      </p>
    </div>
  );

  const statusColors = {
    Draft: "bg-gray-100 text-gray-800 border-gray-300",
    Submitted: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Approved: "bg-green-100 text-green-800 border-green-300",
    Rejected: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 lg:p-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-700"></div>
      </div>

        <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">My Assignment Dashboard</h1>
                <p className="text-gray-600 text-sm mt-1">Track and manage your assignment submissions</p>
              </div>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                <span className="text-blue-600 font-semibold text-sm">
                  {email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-gray-700 font-medium text-sm">{email}</span>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
          <div className="flex items-center mb-6">
            <Upload className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Upload New Assignment</h2>
          </div>
          
          <form onSubmit={handleUpload} className="space-y-6">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter assignment title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none disabled:bg-gray-100"
              />
            </div>

            {/* File Input */}
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                Upload File <span className="text-red-500">*</span>
              </label>
              <input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none disabled:bg-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">
                Supported formats: PDF, DOC, DOCX, ZIP (Max 10MB)
              </p>
            </div>
              
              {/* Submit for Review Section */}
<div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">

  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
    <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
    Submit Assignment for Review
  </h2>

  {/* Professor Dropdown */}
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Select Professor <span className="text-red-500">*</span>
    </label>

   <select
  className="w-full border border-gray-300 rounded-lg px-4 py-3"
  value={selectedProfessor}
  onChange={(e) => setSelectedProfessor(e.target.value)}
>
  <option value="">-- Choose Professor --</option>

  {professors?.map((prof, index) => (
    <option key={prof._id || index} value={prof._id}>
      {prof}
    </option>
  ))}
</select>


  {/* Submit Review Button
  <button
    onClick={handleSubmitReview}
    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-all shadow-lg"
  >
    Submit for Review
  </button> */}
</div>  
</div>



            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Upload Assignment
                </>
              )}
            </button>
          </form>
        </div>
{/* view assignment button */}
  <div className="flex justify-center">
          <button
            onClick={() => navigate('/studentassignments', { state: { email, password } })}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
          >
            <Eye className="w-5 h-5 mr-2" />
            View All Assignments
          </button>
        </div>
      </div> 
    </div>
  );
}