import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Building, Shield, Save, ArrowLeft, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useParams } from "react-router-dom";

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-50 border-green-300 text-green-800',
    error: 'bg-red-50 border-red-300 text-red-800',
    warning: 'bg-amber-50 border-amber-300 text-amber-800'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600" />
  };

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border ${styles[type]} animate-slide-in`}>
      {icons[type]}
      <p className="font-medium text-sm">{message}</p>
      <button onClick={onClose} className="ml-1 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function SimpleEditProfile() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const departments = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
  ];

  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'professor', label: 'Professor' },
    { value: 'hod', label: 'HOD' },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!userData.fullName) {
      newErrors.fullName = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(userData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!userData.department) {
      newErrors.department = 'Department is required';
    }

    if (!userData.role) {
      newErrors.role = 'Role is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fill all required fields", "warning");
      return;
    }

    setSaving(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/updateUser`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.status === 200) {
        showToast("Profile updated successfully!", "success");

        setTimeout(() => {
          navigate(-1);
        }, 2000);
      }

    } catch (error) {
      console.error('Error updating profile:', error);

      if (error.response) {
        showToast(error.response.data.message || "Update failed", "error");
      } else {
        showToast("Network error. Please try again.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      _id: prev._id || id,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 via-orange-800/50 to-rose-900/60 z-10" />
      
      {/* Animated Orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse z-10" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse z-10" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-20 w-full max-w-md">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white hover:text-amber-200 mb-4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">Edit Profile</h1>
            <p className="text-orange-100 text-sm drop-shadow">Update your information</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-amber-600" />
                  Full Name
                </div>
              </label>
              <input
                type="text"
                value={userData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition text-sm ${errors.fullName ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-amber-600" />
                  Email Address
                </div>
              </label>
              <input
                type="email"
                value={userData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition text-sm ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2 text-amber-600" />
                  Department
                </div>
              </label>
              <select
                value={userData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition appearance-none text-sm cursor-pointer ${errors.department ? 'border-red-400' : 'border-gray-200'}`}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.department}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-amber-600" />
                  Role
                </div>
              </label>
              <select
                value={userData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition appearance-none text-sm cursor-pointer ${errors.role ? 'border-red-400' : 'border-gray-200'}`}
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.role}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white py-3 rounded-lg font-medium hover:from-amber-600 hover:via-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-orange-100 drop-shadow">Your changes will be saved immediately</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}