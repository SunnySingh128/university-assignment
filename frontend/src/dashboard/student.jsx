import React, { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle, XCircle, Clock, TrendingUp, Plus, Eye, GraduationCap, X, AlertCircle, Sparkles, Award, BookOpen, Target } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 text-green-800',
    error: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-400 text-red-800',
    warning: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400 text-amber-800',
    info: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-400 text-blue-800'
  };

  const icons = {
    success: <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />,
    error: <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />,
    warning: <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />,
    info: <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
  };

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-2 transform transition-all duration-300 animate-slide-in backdrop-blur-sm ${styles[type]}`}>
      {icons[type]}
      <p className="font-bold text-sm">{message}</p>
      <button 
        onClick={onClose}
        className="ml-2 hover:opacity-70 transition-opacity"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-scale-in border-2 border-amber-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Confirm Submission</h3>
        </div>
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all transform hover:scale-105 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-amber-600 hover:via-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [toast, setToast] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchDashboardData();
    fetchProfessors();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoadingDashboard(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email: email,
        password: password,
      });
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const fetchProfessors = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/professor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email })
      });
      const data = await res.json();
      if (data.success) {
        setProfessors(data.professors.map(p => ({email:p})));
      }
    } catch (err) {
      console.error("Error getting professor list:", err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedProfessor) {
      showToast("Please select a professor first!", "warning");
      return;
    }

    if (!title || !file) {
      showToast("Please fill in all fields (Title and File)!", "warning");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmUpload = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("email", email);
      formData.append("file", file);
      formData.append("professor", selectedProfessor);

      const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/student/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data) {
        showToast("Assignment uploaded successfully!", "success");
        setTitle("");
        setFile(null);
        setSelectedProfessor("");
        document.getElementById('file').value = '';
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast(error.response?.data?.message || "Upload failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, gradient, iconBg }) => (
    <div className={`bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-white/50 hover:shadow-amber-500/20 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group relative overflow-hidden`}>
      <div className={`absolute inset-0 ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className={`p-4 rounded-2xl ${iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          {isLoadingDashboard && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-3 border-amber-600"></div>
          )}
        </div>
        <h3 className="text-gray-600 text-sm font-bold mb-3 uppercase tracking-wider">{title}</h3>
        <p className="text-5xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          {isLoadingDashboard ? '...' : value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showConfirmModal && (
        <ConfirmModal
          message="Are you sure you want to submit this assignment for review?"
          onConfirm={confirmUpload}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=2400&q=95&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.85) contrast(1.15) saturate(1.1)'
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 via-orange-800/50 to-rose-900/60 z-10" />
      
      {/* Animated Orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse z-10" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse z-10" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl animate-pulse z-10" style={{ animationDelay: '3s' }} />

      <div className="relative z-20 p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300 hover:rotate-6">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-white drop-shadow-2xl mb-2 tracking-tight">Assignment Dashboard</h1>
                  <p className="text-orange-100 text-lg font-semibold drop-shadow-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Track and manage your submissions
                  </p>
                </div>
              </div>
              <div className="flex items-center bg-white/95 backdrop-blur-xl px-6 py-4 rounded-2xl border-2 border-white/50 shadow-2xl hover:shadow-amber-500/20 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <span className="text-white font-black text-lg">
                    {email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-800 font-bold">{email}</span>
              </div>
            </div>
          </div>

          {/* Upload Form */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border-2 border-white/50 mb-8 hover:shadow-amber-500/20 transition-all duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">Upload New Assignment</h2>
                <p className="text-gray-600 font-semibold">Submit your work for review</p>
              </div>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="relative group">
                <label htmlFor="title" className="block text-sm font-black text-gray-700 mb-3 ml-1 uppercase tracking-wider">
                  Assignment Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Enter assignment title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  className="w-full bg-amber-50/70 border-2 border-amber-300 rounded-2xl px-6 py-4 text-lg focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 outline-none disabled:bg-gray-100 placeholder-gray-400 text-gray-800 font-semibold shadow-inner"
                />
              </div>

              <div className="relative group">
                <label htmlFor="professor" className="block text-sm font-black text-gray-700 mb-3 ml-1 uppercase tracking-wider">
                  Select Professor <span className="text-red-500">*</span>
                </label>
                <select
                  id="professor"
                  value={selectedProfessor}
                  onChange={(e) => setSelectedProfessor(e.target.value)}
                  disabled={loading}
                  className="w-full bg-amber-50/70 border-2 border-amber-300 rounded-2xl px-6 py-4 text-lg focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 outline-none disabled:bg-gray-100 text-gray-800 appearance-none font-semibold shadow-inner"
                >
                  <option value="">-- Choose Professor --</option>
                  {professors?.map((prof, index) => (
                    <option key={prof.email || index} value={prof.email}>
                      {prof.email} (Professor)
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative group">
                <label htmlFor="file" className="block text-sm font-black text-gray-700 mb-3 ml-1 uppercase tracking-wider">
                  Upload File <span className="text-red-500">*</span>
                </label>
                <input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={loading}
                  className="w-full bg-amber-50/70 border-2 border-amber-300 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 outline-none disabled:bg-gray-100 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-amber-500 file:to-orange-600 file:text-white hover:file:from-amber-600 hover:file:to-orange-700 file:font-bold file:shadow-lg file:transition-all cursor-pointer shadow-inner"
                />
                <p className="mt-3 text-sm text-gray-600 ml-1 font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Supported: PDF, DOC, DOCX, ZIP (Max 10MB)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white py-5 rounded-2xl text-xl font-black hover:from-amber-600 hover:via-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transition-all duration-300 shadow-2xl hover:shadow-amber-500/50 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6 mr-3" />
                    Upload Assignment
                  </>
                )}
              </button>
            </form>
          </div>

          {/* View Button */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/studentassignments', { state: { email, password } })}
              className="px-12 py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white text-xl font-black rounded-2xl hover:from-amber-600 hover:via-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transition-all duration-300 shadow-2xl hover:shadow-amber-500/50 transform hover:scale-105 active:scale-95 flex items-center gap-3 uppercase tracking-wider"
            >
              <Eye className="w-6 h-6" />
              View All Assignments
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}