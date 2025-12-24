import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Clock, Eye, ArrowLeft, Search, Filter, Download, RefreshCw, User } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import debounce from '../debouncing';

export default function StudentAssignments() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const password = location.state?.password;
  
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [hoveredCard, setHoveredCard] = useState(null);

  const debouncedSearch = React.useRef(
    debounce((value) => {
      setSearchTerm(value);
    }, 300)
  ).current;

  function handleResubmit() {
    navigate("/student", { state: { email, password } });
  }

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [searchTerm, filterStatus, assignments]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/student/student-assignment`, {
        params: { email: email }
      });

      if (res.data && res.data.assignments) {
        setAssignments(res.data.assignments);
        setFilteredAssignments(res.data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      alert('Failed to load assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments;

    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "All") {
      filtered = filtered.filter(assignment => assignment.status === filterStatus);
    }

    setFilteredAssignments(filtered);
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Draft': 
        return {
          bg: 'bg-gradient-to-r from-gray-100 to-gray-200',
          text: 'text-gray-700',
          icon: <FileText className="w-4 h-4" />,
          pulse: false
        };
      case 'Submitted': 
        return {
          bg: 'bg-gradient-to-r from-yellow-100 to-orange-100',
          text: 'text-yellow-700',
          icon: <Clock className="w-4 h-4 animate-spin" />,
          pulse: true
        };
      case 'accepted': 
        return {
          bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
          text: 'text-green-700',
          icon: <CheckCircle className="w-4 h-4" />,
          pulse: false
        };
      case 'rejected': 
        return {
          bg: 'bg-gradient-to-r from-red-100 to-pink-100',
          text: 'text-red-700',
          icon: <XCircle className="w-4 h-4" />,
          pulse: false
        };
      default: 
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          icon: <FileText className="w-4 h-4" />,
          pulse: false
        };
    }
  };

  const stats = {
    total: assignments.length,
    draft: assignments.filter(a => a.status === "Draft").length,
    submitted: assignments.filter(a => a.status === "Submitted").length,
    accepted: assignments.filter(a => a.status === "accepted").length,
    rejected: assignments.filter(a => a.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/student', { state: { email, password } })}
            className="group flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-2 transition-transform duration-300" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Assignments</h1>
              <p className="text-gray-600">Track your progress and submissions</p>
            </div>
            
            {/* User Email and Quick Stats */}
            <div className="flex flex-wrap gap-3">
              {email && (
                <div className="flex items-center bg-white rounded-xl shadow-lg px-4 py-3 border-2 border-blue-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{email}</span>
                </div>
              )}
              <div className="bg-white rounded-xl shadow-lg px-4 py-3 border-2 border-green-200 hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
                <div className="text-xs text-gray-600">Approved</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg px-4 py-3 border-2 border-yellow-200 hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="text-2xl font-bold text-yellow-600">{stats.submitted}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-6 mb-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search assignments..."
                defaultValue={searchTerm}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 cursor-pointer appearance-none bg-white"
              >
                <option value="All">All Assignments ({stats.total})</option>
                <option value="Draft">Draft ({stats.draft})</option>
                <option value="Submitted">Submitted ({stats.submitted})</option>
                <option value="accepted">Approved ({stats.accepted})</option>
                <option value="rejected">Rejected ({stats.rejected})</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
            <span>Showing {filteredAssignments.length} of {assignments.length} assignments</span>
            {(searchTerm || filterStatus !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("All");
                }}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Assignments Grid */}
        <div className="grid gap-6">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading assignments...</p>
            </div>
          ) : filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment) => {
              const statusStyle = getStatusStyle(assignment.status);
              const isHovered = hoveredCard === assignment._id;
              
              return (
                <div
                  key={assignment._id}
                  onMouseEnter={() => setHoveredCard(assignment._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-300 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    isHovered ? 'scale-[1.01]' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    
                    {/* Assignment Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-xl ${statusStyle.bg} ${isHovered ? 'scale-110' : ''} transition-transform duration-300`}>
                          <FileText className="w-6 h-6 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                            {assignment.title}
                          </h3>
                          {assignment.description && (
                            <p className="text-gray-600 text-sm">{assignment.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.pulse ? 'animate-pulse' : ''} hover:scale-105 transition-transform cursor-pointer`}>
                          {statusStyle.icon}
                          {assignment.status}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(assignment.uploadedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 md:min-w-[140px]">
                      <a
                        href={assignment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        View
                      </a>
                    </div>
                  </div>

                  {/* Feedback Section */}
                  {assignment.status === "rejected" && !assignment.hasResubmitted && (
                    <div className="mt-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start gap-3 mb-4">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-800 mb-1">Assignment Rejected</p>
                          <p className="text-sm text-red-700">
                            {assignment.feedback || "No feedback provided"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleResubmit(assignment._id)}
                        className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Resubmit Assignment
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="inline-block p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
                <FileText className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-gray-600 text-xl font-semibold mb-2">No assignments found</p>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterStatus !== "All" 
                  ? "Try adjusting your filters" 
                  : "Start by uploading your first assignment"}
              </p>
              {(searchTerm || filterStatus !== "All") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("All");
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}