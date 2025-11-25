
import React, { useState, useEffect } from 'react';
import { Users, School, GraduationCap, UserCircle, LogOut, Menu, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalStudents: 0,
    totalProfessors: 0,
    totalHODs: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Single API call to fetch all counts
      const res = await axios.get('/api/store/fetchallcounts', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('API Response:', res.data);

      setStats({
        totalDepartments: res.data.userCount || 0,
        totalStudents: res.data.studentCount || 0,
        totalProfessors: res.data.professorCount || 0,
        totalHODs: res.data.hodCount || 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      
      if (err.response) {
        alert(err.response.data.message || 'Failed to fetch dashboard stats');
      } else if (err.request) {
        alert('Cannot connect to server. Please check if backend is running.');
      } else {
        alert('An error occurred while fetching stats.');
      }
      
      setStats({
        totalDepartments: 0,
        totalStudents: 0,
        totalProfessors: 0,
        totalHODs: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <div 
      className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {isLoading && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className={`text-3xl font-bold text-gray-900 ${isLoading ? 'animate-pulse' : 'animate-count-up'}`}>
        {isLoading ? '...' : value}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-700"></div>
      </div>

      <div className="flex min-h-screen relative">
        {/* Sidebar */}
        <aside 
          className={`${
            isSidebarOpen ? 'w-64' : 'w-0'
          } bg-white shadow-xl transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-200`}
        >
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">EduFlow</h1>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Navigation
              </h2>
              
              <button
                onClick={() => navigate('/admin/department')}
                className="w-full flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
              >
                <School className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Departments</span>
              </button>

              <button
                onClick={() => navigate('/admin/user')}
                className="w-full flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
              >
                <Users className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Users</span>
              </button>
             

                <button
                onClick={() => navigate('/AddDepartment')}
                className="w-full flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
              >
                <Users className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Add Department</span>
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
              >
                <UserCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Add User</span>
              </button>
            </nav>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full mt-8 flex items-center px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="mr-4 p-2 rounded-lg hover:bg-white transition-colors"
              >
                {isSidebarOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            
            <button
              onClick={fetchDashboardStats}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              Refresh Stats
            </button>
          </div>

          {/* Dashboard Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Departments"
                value={stats.totalDepartments}
                icon={School}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
                delay={0}
              />
              
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                icon={Users}
                color="bg-gradient-to-br from-green-500 to-green-600"
                delay={100}
              />
              
              <StatCard
                title="Total Professors"
                value={stats.totalProfessors}
                icon={GraduationCap}
                color="bg-gradient-to-br from-orange-500 to-orange-600"
                delay={200}
              />
              
              <StatCard
                title="Total HODs"
                value={stats.totalHODs}
                icon={UserCircle}
                color="bg-gradient-to-br from-purple-500 to-purple-600"
                delay={300}
              />
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center text-sm text-gray-500 mt-8">
            © 2025 EduFlow Admin Dashboard. All rights reserved.
          </footer>
        </main>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes count-up {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-count-up {
          animation: count-up 0.3s ease-out;
        }

        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;