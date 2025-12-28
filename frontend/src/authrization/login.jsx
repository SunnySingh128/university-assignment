import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, User, GraduationCap, Loader2, CheckCircle, XCircle, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-50 border-green-300 text-green-800',
    error: 'bg-red-50 border-red-300 text-red-800',
    warning: 'bg-amber-50 border-amber-300 text-amber-800'
  };

  const icons = {
    success: <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />,
    error: <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />,
    warning: <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
  };

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-2 transform transition-all duration-300 animate-slide-in ${styles[type]}`}>
      {icons[type]}
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

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please fill all the fields", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      const userRole = res.data.role;
      
      showToast("Login successful! Redirecting...", "success");
      
      setTimeout(() => {
        if (userRole === "admin") {
          navigate("/admin");
        } else if (userRole === "student") {
          navigate("/student", { state: { email, password } });
        } else if (userRole === "professor") {
          navigate("/professor", { state: { email } });
        } else if (userRole === "hod") {
          navigate("/hod", { state: { email } });
        } else {
          showToast("Unknown role. Please contact support.", "error");
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      showToast("Invalid credentials. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const forgotpassword = () => {
    setIsAnimating(true);
    setTimeout(() => {
      navigate('/forgotpassword');
    }, 500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* High-Quality Background Image with Crystal Clear Visibility */}
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
      
      {/* Elegant gradient overlay matching the warm tones of the image */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 via-orange-800/50 to-rose-900/60 z-10" />
      
      {/* Subtle animated orbs in warm tones */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl animate-pulse z-10" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse z-10" style={{ animationDelay: '1s' }} />
      
      {/* Main Login Card */}
      <div className={`relative z-20 w-full max-w-md transition-all duration-500 ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm">
              Sign in to your EduFlow account
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Email */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 group-focus-within:text-orange-600 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                  className="w-full pl-12 pr-4 py-3.5 bg-amber-50/70 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 placeholder-gray-400 text-gray-800"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 group-focus-within:text-orange-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                  className="w-full pl-12 pr-14 py-3.5 bg-amber-50/70 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 placeholder-gray-400 text-gray-800"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-orange-700 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-orange-600 bg-amber-50 border-amber-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                />
                <span className="ml-2 text-gray-700 group-hover:text-orange-600 transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={forgotpassword}
                className="text-orange-600 hover:text-orange-700 font-semibold transition-colors hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600 leading-relaxed">
              By signing in, you agree to our{' '}
              <a href="#" className="text-orange-600 hover:text-orange-700 font-medium hover:underline">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#" className="text-orange-600 hover:text-orange-700 font-medium hover:underline">
                Privacy Policy
              </a>
            </p>
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

export default Login;