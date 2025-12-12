import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Clock, Eye, Search, Filter, GraduationCap, User, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import debounce from '../debouncing';

export default function ProfessorDashboard() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [processingId, setProcessingId] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
   
  // Feedback modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [currentRejectId, setCurrentRejectId] = useState(null);

  // Debouncing
  const debouncedSearch = React.useRef(
    debounce((value) => {
      setSearchTerm(value);
    }, 3000)
  ).current;

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

      const res = await axios.post(
        '/api/student/professor',
        { professor: "suhani" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (Array.isArray(res.data)) {
        setAssignments(res.data);
        setFilteredAssignments(res.data);
      } else if (res.data.assignments) {
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
      filtered = filtered.filter(a =>
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "All") {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    setFilteredAssignments(filtered);
  };

  // Accept button (approved)
  const handleAccept = async (assignmentId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this assignment?`)) return;

    if(action === "rejected"){
      setCurrentRejectId(assignmentId);
      setShowFeedbackModal(true);
      return;
    }
    
    setProcessingId(assignmentId);
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `/api/student/professor1/${assignmentId}`,
        { status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Assignment ${action} successfully!`);
      fetchAssignments();
    } catch (error) {
      console.error(`Error updating assignment:`, error);
      alert(error.response?.data?.message || `Failed to ${action} assignment`);
    } finally {
      setProcessingId(null);
    }
  };

  // Send Feedback on Rejection
  const sendRejectFeedback = async () => {
    if (!feedbackText.trim()) {
      alert("Enter feedback before submitting!");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `/api/student/professor1/${currentRejectId}`,
        { status: "rejected", feedback: feedbackText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Feedback sent to student!");

      setShowFeedbackModal(false);
      setFeedbackText("");
      setCurrentRejectId(null);

      fetchAssignments();
    } catch (error) {
      console.error(error);
      alert("Failed to send feedback");
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Draft': 
        return {
          bg: 'bg-gradient-to-r from-gray-100 to-gray-200',
          text: 'text-gray-700',
          icon: FileText
        };
      case 'Submitted': 
        return {
          bg: 'bg-gradient-to-r from-yellow-100 to-orange-100',
          text: 'text-yellow-700',
          icon: Clock
        };
      case 'accepted': 
        return {
          bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
          text: 'text-green-700',
          icon: CheckCircle
        };
      case 'rejected': 
        return {
          bg: 'bg-gradient-to-r from-red-100 to-pink-100',
          text: 'text-red-700',
          icon: XCircle
        };
      default: 
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          icon: FileText
        };
    }
  };

  const stats = {
    total: assignments.length,
    submitted: assignments.filter(a => a.status === "Submitted").length,
    accepted: assignments.filter(a => a.status === "accepted").length,
    rejected: assignments.filter(a => a.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">

        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center text-indigo-600 hover:text-indigo-700 mb-6 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-2 transition-transform duration-300" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Professor Dashboard</h1>
                <p className="text-gray-600">Review and manage student submissions</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-white rounded-xl shadow-lg px-4 py-3 border-2 border-yellow-200 hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="text-2xl font-bold text-yellow-600">{stats.submitted}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg px-4 py-3 border-2 border-green-200 hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
                <div className="text-xs text-gray-600">Accepted</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg px-4 py-3 border-2 border-red-200 hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-xs text-gray-600">Rejected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-6 mb-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Assignments</label>
              <Search className="absolute left-4 bottom-3.5 text-gray-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Search by title, student name, or email..."
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Status Filter */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <Filter className="absolute left-4 bottom-3.5 text-gray-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 cursor-pointer appearance-none bg-white"
              >
                <option value="All">All Status ({stats.total})</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted ({stats.submitted})</option>
                <option value="accepted">Accepted ({stats.accepted})</option>
                <option value="rejected">Rejected ({stats.rejected})</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAssignments.length} of {assignments.length} assignments
          </div>
        </div>

        {/* Assignment Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading assignments...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="inline-block p-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-6">
                <FileText className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-gray-600 text-xl font-semibold">No assignments found</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => {
              const statusStyle = getStatusStyle(assignment.status);
              const StatusIcon = statusStyle.icon;
              const isHovered = hoveredCard === assignment._id;

              return (
                <div
                  key={assignment._id}
                  onMouseEnter={() => setHoveredCard(assignment._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-indigo-300 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    isHovered ? 'scale-[1.01]' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    
                    {/* Student Info */}
                    <div className="flex items-center gap-3 lg:w-1/4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{assignment.email}</p>
                        <p className="text-xs text-gray-500">Student</p>
                      </div>
                    </div>

                    {/* Assignment Details */}
                    <div className="flex-1 lg:w-2/5">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-indigo-600 transition-colors">
                        {assignment.title}
                      </h3>
                      {assignment.description && (
                        <p className="text-sm text-gray-600">{assignment.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Submitted: {new Date(assignment.uploadedAt || assignment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="lg:w-1/6">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${statusStyle.bg} ${statusStyle.text} hover:scale-105 transition-transform cursor-pointer`}>
                        <StatusIcon className="w-4 h-4" />
                        {assignment.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 lg:w-1/4 lg:justify-end">
                      <a
                        href={assignment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        View
                      </a>

                      {assignment.status === "Submitted" && (
                        <>
                          <button
                            onClick={() => handleAccept(assignment._id, "accepted")}
                            disabled={processingId === assignment._id}
                            className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Accept
                          </button>

                          <button
                            onClick={() => handleAccept(assignment._id, "rejected")}
                            disabled={processingId === assignment._id}
                            className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Decline
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 hover:scale-[1.02]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <XCircle className="w-6 h-6" />
                Provide Feedback
              </h2>
              <p className="text-red-100 text-sm mt-1">Help the student improve their work</p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback Message
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Enter detailed feedback for the student..."
                className="w-full h-40 border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-300 resize-none"
              ></textarea>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackText("");
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                >
                  Cancel
                </button>

                <button
                  onClick={sendRejectFeedback}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Send Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}