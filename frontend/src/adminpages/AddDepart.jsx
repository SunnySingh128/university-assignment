import React, { useState } from 'react';
import { School, ArrowLeft, GraduationCap, Plus, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddDepartment() {
  const [departmentName, setDepartmentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!departmentName.trim()) {
      alert('Please enter department name');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/addDepartment`,
        { name: departmentName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Response:', res.data);
      
      // Show success message
      setShowSuccess(true);
      setDepartmentName('');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error adding department:', err);
      
      if (err.response) {
        alert(err.response.data.message || 'Failed to add department');
      } else if (err.request) {
        alert('Cannot connect to server. Please check if backend is running.');
      } else {
        alert('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* High-Quality Background Image - Same as Departments page */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=2400&q=95&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          filter: 'brightness(0.9) contrast(1.1) saturate(1.2)'
        }}
      />
      
      {/* Elegant gradient overlay - Same warm tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-orange-800/30 to-amber-800/20 z-10" />
      
      {/* Subtle animated orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-blob z-10" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-blob z-10" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-blob z-10" style={{ animationDelay: '4s' }} />
      
      {/* Main Content */}
      <div className="relative z-20 p-6 lg:p-8 min-h-screen backdrop-blur-xs">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center px-4 py-2.5 bg-white/90 backdrop-blur-sm text-orange-700 hover:text-orange-800 rounded-xl hover:bg-white transition-all duration-300 mb-4 group shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mr-5 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <School className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
                  Add New Department
                </h1>
                <p className="text-white/90 mt-2 font-medium backdrop-blur-sm px-2 py-1 rounded-lg inline-block">
                  Create a new academic department in the system
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-8 bg-gradient-to-r from-green-50/90 to-emerald-50/90 backdrop-blur-xl border-2 border-green-300 rounded-3xl p-6 animate-slide-down shadow-xl">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-green-800 font-bold text-xl mb-1">Success!</h3>
                  <p className="text-green-700 font-medium">Department has been added successfully.</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Department Name Input */}
              <div className="group">
                <label htmlFor="departmentName" className="block text-sm font-semibold text-gray-800 mb-3 ml-1">
                  <div className="flex items-center">
                    <School className="w-4 h-4 mr-2 text-orange-600" />
                    Department Name <span className="text-red-500 ml-1">*</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    id="departmentName"
                    type="text"
                    required
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 placeholder-gray-500 text-gray-900 font-medium shadow-inner disabled:opacity-70"
                    placeholder="e.g., Computer Science, Electrical Engineering, Business Administration"
                    disabled={isLoading}
                  />
                  <School className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                </div>
                <p className="mt-3 text-sm text-gray-600 font-medium pl-1">
                  Enter the official full name of the department
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none group"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      <span>Adding Department...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <span>Add Department</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDepartmentName('')}
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 border-2 border-gray-300 rounded-xl font-semibold hover:from-gray-100 hover:to-gray-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* Info Card */}
          <div className="mt-8 bg-gradient-to-br from-orange-50/90 to-amber-50/90 backdrop-blur-xl border-2 border-orange-200 rounded-3xl p-8 animate-slide-up shadow-xl" style={{ animationDelay: '200ms' }}>
            <div className="flex items-start">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mr-5 shadow-inner flex-shrink-0">
                <GraduationCap className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-800 mb-4">Tips for Adding Departments</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                    <p className="text-gray-800 font-medium">Use the full official name of the department</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                    <p className="text-gray-800 font-medium">Ensure consistent naming conventions across all departments</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                    <p className="text-gray-800 font-medium">Check for duplicates before adding new departments</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                    <p className="text-gray-800 font-medium">Department names are case-sensitive in the system</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 mb-6 animate-fade-in">
            <p className="text-white/80 text-sm font-medium drop-shadow-lg">
              <School className="inline-block w-4 h-4 mr-2" />
              EduFlow Department Management
            </p>
            <p className="text-white/60 text-xs mt-2">
              © 2025 All rights reserved. Secure academic administration.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.7s ease-out forwards;
        }

        .animate-slide-down {
          animation: slide-down 0.5s ease-out forwards;
        }

        .animate-blob {
          animation: blob 12s ease-in-out infinite;
        }

        .backdrop-blur-xs {
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
}

export default AddDepartment;