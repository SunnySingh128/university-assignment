import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, GraduationCap, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all the fields");
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

      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "student") {
        navigate("/student", {
          state: { email, password }
        });
      } else if (userRole === "professor") {
        navigate("/professor", { state: { email } });
      } else if (userRole === "hod") {
        navigate("/hod", { state: { email } });
      } else {
        alert("Unknown role. Please contact support.");
      }
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
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
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://thumbs.dreamstime.com/b/abstract-illustration-representing-education-business-growth-open-books-glowing-light-bulbs-graduation-caps-412556971.jpg"
          alt="Education knowledge growth background"
          className="w-full h-full object-cover"
        />
        {/* Teal-cyan tinted overlay to enhance harmony */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 via-cyan-500/10 to-blue-600/20" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      {/* Subtle animated orbs in teal/cyan tones */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5 opacity-50">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-400/30 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-400/30 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      {/* Main Login Card */}
      <div className={`relative w-full max-w-md transition-all duration-500 ease-out ${isAnimating ? 'scale-95 opacity-0 translate-y-10' : 'scale-100 opacity-100 translate-y-0'}`}>
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/70 p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-3xl shadow-xl mb-6">
              <GraduationCap className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back</h1>
            <p className="text-gray-600 text-lg">Sign in to your EduFlow account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-teal-50/70 border border-teal-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all duration-300 placeholder-gray-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-14 py-4 bg-teal-50/70 border border-teal-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all duration-300 placeholder-gray-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-600 hover:text-cyan-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-teal-600 rounded focus:ring-cyan-500" />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <button
                type="button"
                onClick={forgotpassword}
                className="text-sm font-medium text-teal-600 hover:text-cyan-700 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button - Teal to Cyan Gradient */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-2xl hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              By signing in, you agree to our{' '}
              <button className="font-medium text-teal-600 hover:underline">Terms of Service</button>
              {' '}and{' '}
              <button className="font-medium text-teal-600 hover:underline">Privacy Policy</button>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Powered by <span className="font-semibold text-cyan-600">EduFlow</span>
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 20s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

export default Login;