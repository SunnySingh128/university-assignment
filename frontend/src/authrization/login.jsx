import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, GraduationCap } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [email, setemail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!email || !password) {
        alert("Please fill all the fields");
        return;
      }

      const res = await axios.post("/api/auth/login", {
        email,
        password,
      });

      // Store token
      localStorage.setItem("token", res.data.token);

      // Get role
      const userRole = res.data.role;

      if (userRole === "admin") {
        navigate("/admin");

      } else if (userRole === "student") {
        // 👉 PASS EMAIL USING navigate
        navigate("/student", {
          state: { email: email,
            password: password,
           }
        });

      } else if (userRole === "professor") {
        navigate("/professor");

      } else if (userRole === "hod") {
        navigate("/hod");

      } else {
        alert("Unknown role. Please contact support.");
      }

    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };

  // const handleSignupClick = () => {
  //   setIsAnimating(true);
  //   setTimeout(() => {
  //     navigate('/signup');
  //   }, 600);
  // };

  const forgotpassword = () => {
    setIsAnimating(true);
    setTimeout(() => {
      navigate('/forgotpassword');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
      </div>

      {/* Main Container */}
      <div className={`relative w-full max-w-md transition-all duration-700 transform ${isAnimating ? 'scale-95 opacity-0 rotate-3' : 'scale-100 opacity-100 rotate-0'}`}>
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to EduFlow</h1>
          <p className="text-gray-600">Sign in to manage your assignments</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setemail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                onClick={forgotpassword}
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">New to EduFlow?</span>
            </div>
          </div>

          {/* Signup Button */}
          {/* <button
            onClick={handleSignupClick}
            className="w-full bg-white text-blue-600 py-3 rounded-lg font-medium border-2 border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5"
          >
            Create New Account
          </button> */}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          By continuing, you agree to our{' '}
          <button className="text-blue-600 hover:underline">Terms of Service</button>
          {' '}and{' '}
          <button className="text-blue-600 hover:underline">Privacy Policy</button>
        </p>
      </div>
    </div>
  );
}

export default Login;
