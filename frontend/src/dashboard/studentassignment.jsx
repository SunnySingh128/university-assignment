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
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/student/student-assignment`, {
        params: { email: email },
        headers: { Authorization: `Bearer ${token}` }
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
          bg: 'bg-gradient-to-r from-amber-100 to-orange-100',
          text: 'text-amber-700',
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
    <div className="min-h-screen relative overflow-hidden">
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

      <div className="relative z-20 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
        
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={() => navigate('/student', { state: { email, password } })}
              className="flex items-center text-white hover:text-amber-200 mb-6 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">My Assignments</h1>
                <p className="text-orange-100 text-sm drop-shadow">Track your progress and submissions</p>
              </div>
              
              {/* User Stats */}
              <div className="flex flex-wrap gap-3">
                {email && (
                  <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-3 border border-white/30">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{email}</span>
                  </div>
                )}
                <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-3 border border-white/30 hover:scale-105 transition-transform">
                  <div className="text-xl font-bold text-green-600">{stats.accepted}</div>
                  <div className="text-xs text-gray-600">Approved</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-3 border border-white/30 hover:scale-105 transition-transform">
                  <div className="text-xl font-bold text-amber-600">{stats.submitted}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-5 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  defaultValue={searchTerm}
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none appearance-none text-sm cursor-pointer"
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
                  className="text-amber-600 hover:text-orange-700 font-medium flex items-center gap-1 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Assignments Grid */}
          <div className="grid gap-5">
            {loading ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-white/30">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-amber-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-700 font-medium">Loading assignments...</p>
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
                    className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-5 transition-all hover:shadow-xl hover:-translate-y-1 ${
                      isHovered ? 'scale-[1.01]' : ''
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      
                      {/* Assignment Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-lg ${statusStyle.bg} ${isHovered ? 'scale-110' : ''} transition-transform`}>
                            <FileText className="w-5 h-5 text-gray-700" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-amber-600 transition-colors">
                              {assignment.title}
                            </h3>
                            {assignment.description && (
                              <p className="text-gray-600 text-sm">{assignment.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${statusStyle.bg} ${statusStyle.text} ${statusStyle.pulse ? 'animate-pulse' : ''} hover:scale-105 transition-transform`}>
                            {statusStyle.icon}
                            {assignment.status}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(assignment.uploadedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <a
                          href={assignment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        >
                          <Eye className="w-4 h-4" />
                          View File
                        </a>
                      </div>
                    </div>

                    {/* Feedback Section */}
                    {assignment.status === "rejected" && !assignment.hasResubmitted && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2 mb-3">
                          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-red-800 text-sm mb-1">Assignment Rejected</p>
                            <p className="text-xs text-red-700">
                              {assignment.feedback || "No feedback provided"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleResubmit(assignment._id)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Resubmit Assignment
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-white/30">
                <div className="inline-block p-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-4">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-700 text-lg font-semibold mb-2">No assignments found</p>
                <p className="text-gray-500 text-sm mb-4">
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
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}