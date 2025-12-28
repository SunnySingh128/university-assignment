import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, User, GraduationCap, School, UserCircle, Loader2, CheckCircle, XCircle, X, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Bulk from '../authrization/bulkupload';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-2 transform transition-all duration-300 animate-slide-in ${
      type === 'success' 
        ? 'bg-green-50 border-green-300 text-green-800' 
        : 'bg-red-50 border-red-300 text-red-800'
    }`}>
      {type === 'success' ? (
        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
      )}
      <p className="font-semibold text-sm">{message}</p>
      <button 
        onClick={onClose}
        className="ml-2 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

function App() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [toast, setToast] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    department: '',
  });

  const navigate = useNavigate();

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/fetchdepartment`);
      const data = await response.json();
      
      console.log('Departments fetched:', data);
      
      if (Array.isArray(data)) {
        setDepartments(data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);

    try {
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        department: formData.department,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/store/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('User created successfully! Redirecting to login page...', 'success');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
        showToast(data.message || 'Registration failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = 'An error occurred. Please check your connection and try again.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 py-12">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* High-Quality Background Image */}
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
      
      {/* Gradient Overlay with Warm Amber/Orange Tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 via-orange-800/50 to-rose-900/60 z-10" />
      
      {/* Animated Orbs */}
      <div className="absolute top-20 left-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl animate-pulse z-10" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse z-10" style={{ animationDelay: '1.5s' }} />

      {/* Standalone Bulk Upload Button - Top Right Corner */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={() => setShowBulkUpload(!showBulkUpload)}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-2xl hover:from-amber-600 hover:via-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <Upload className="w-5 h-5" />
          <span>Bulk Upload</span>
        </button>
      </div>

      {/* Bulk Upload Modal/Component */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-amber-200 max-w-2xl w-full max-h-[90vh] overflow-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowBulkUpload(false)}
              className="absolute top-4 right-4 p-2 hover:bg-amber-100 rounded-lg transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
            
            {/* Bulk Upload Component Content */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Users</h2>
              </div>
              <Bulk />
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className={`relative z-20 w-full max-w-md transition-all duration-700 transform ${isAnimating ? 'scale-95 opacity-0 -rotate-3' : 'scale-100 opacity-100 rotate-0'}`}>
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 rounded-3xl mb-4 shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Join EduFlow</h1>
          <p className="text-orange-100 text-sm drop-shadow-md">Create your account to get started</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30">
          <div className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name Input */}
            <div className="relative group">
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-600 group-focus-within:text-orange-600 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  disabled={isLoading}
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="block w-full pl-12 pr-4 py-3.5 bg-amber-50/70 border-2 border-amber-200 rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed placeholder-gray-400 text-gray-800"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="relative group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-600 group-focus-within:text-orange-600 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={isLoading}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="block w-full pl-12 pr-4 py-3.5 bg-amber-50/70 border-2 border-amber-200 rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed placeholder-gray-400 text-gray-800"
                  placeholder="student@university.edu"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="relative group">
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-600 group-focus-within:text-orange-600 transition-colors z-10">
                  <UserCircle className="h-5 w-5" />
                </div>
                <select
                  id="role"
                  required
                  disabled={isLoading}
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="block w-full pl-12 pr-4 py-3.5 bg-amber-50/70 border-2 border-amber-200 rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 outline-none appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-medium"
                >
                  <option value="">Select your role</option>
                  <option value="student">Student</option>
                  <option value="professor">Professor</option>
                  <option value="hod">Head of Department</option>
                </select>
              </div>
            </div>

            {/* Department Dropdown */}
            <div className="relative group">
              <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                Department
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-600 group-focus-within:text-orange-600 transition-colors z-10">
                  <School className="h-5 w-5" />
                </div>
                <select
                  id="department"
                  required
                  disabled={isLoading}
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="block w-full pl-12 pr-4 py-3.5 bg-amber-50/70 border-2 border-amber-200 rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 outline-none appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-medium"
                >
                  <option value="">Select your department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start pt-2">
              <input
                id="terms"
                type="checkbox"
                required
                disabled={isLoading}
                className="w-4 h-4 mt-1 text-orange-600 bg-amber-50 border-amber-300 rounded focus:ring-orange-500 focus:ring-2 disabled:cursor-not-allowed"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                I agree to the{' '}
                <button type="button" className="text-orange-600 hover:text-orange-700 font-semibold hover:underline">
                  Terms of Service
                </button>
                {' '}and{' '}
                <button type="button" className="text-orange-600 hover:text-orange-700 font-semibold hover:underline">
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Signup Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold hover:from-amber-600 hover:via-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

        </div>

        {/* Branding */}
        <div className="text-center mt-6">
          <p className="text-white text-sm font-medium drop-shadow-lg flex items-center justify-center space-x-2">
            <GraduationCap className="w-4 h-4" />
            <span>Powered by EduFlow</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;