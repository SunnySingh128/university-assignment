import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Clock, Eye, Search, Filter, GraduationCap, User, ArrowLeft, Forward, CheckCircle as CheckCircleIcon } from 'lucide-react';
import axios from 'axios';
import { useNavigate,useLocation } from 'react-router-dom';
import debounce from '../debouncing';

export default function ProfessorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const email1 = location.state?.email;
  console.log(email1);
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [processingId, setProcessingId] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [department1, setDepartment] = useState("");
  
  // Feedback modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [currentRejectId, setCurrentRejectId] = useState(null);

  // Forward modal states
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [professorsList, setProfessorsList] = useState([]);
  const [hodsList, setHodsList] = useState([]);
  const [forwardEmail, setForwardEmail] = useState("");
  const [selectedForwardName, setSelectedForwardName] = useState("");
  const [forwardNotes, setForwardNotes] = useState("");
  const [currentForwardId, setCurrentForwardId] = useState(null);
  const [loadingForwardOptions, setLoadingForwardOptions] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);

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
        `${import.meta.env.VITE_API_URL}/student/professor`,
        { professor: email1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDepartment(res.data.department); 
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
        `${import.meta.env.VITE_API_URL}/student/professor1/${assignmentId}`,
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

  const handleForwardClick = async (assignment) => {
    setCurrentForwardId(assignment._id);
    setCurrentAssignment(assignment);
    setLoadingForwardOptions(true);

    try {
      const token = localStorage.getItem("token");

      const [professorsResponse, hodsResponse] = await Promise.all([
        axios.post(
          `${import.meta.env.VITE_API_URL}/admin/professor1`,
          { email: email1 },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.post(
          `${import.meta.env.VITE_API_URL}/admin/hod`,
          { email: email1 },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);

      setProfessorsList(
        Array.isArray(professorsResponse.data?.professors)
          ? professorsResponse.data.professors
          : []
      );

      setHodsList(
        Array.isArray(hodsResponse.data?.hod)
          ? hodsResponse.data.hod
          : []
      );

      setShowForwardModal(true);

    } catch (error) {
      console.error("Error fetching forward options:", error);
      alert("Failed to load professors and HODs.");
    } finally {
      setLoadingForwardOptions(false);
    }
  };

  const sendRejectFeedback = async () => {
    if (!feedbackText.trim()) {
      alert("Enter feedback before submitting!");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${import.meta.env.VITE_API_URL}/student/professor1/${currentRejectId}`,
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

  const handleForwardSubmit = async () => {
    console.log(currentAssignment);
    if (!currentAssignment) {
      alert("Assignment data missing. Please reopen forward modal.");
      return;
    }

    if (!forwardEmail.trim()) {
      alert("Please select a professor or HOD!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log("sunny",email1,currentAssignment);
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/assignments/hod`,
        {
          email: currentAssignment.email,
          title: currentAssignment.title,
          professor: email1,
          hod: forwardEmail,
          fileUrl: currentAssignment.fileUrl,
          department: department1,
          status: "Forwarded"
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Assignment forwarded successfully!");

      setShowForwardModal(false);
      setForwardEmail("");
      setSelectedForwardName("");
      setForwardNotes("");
      setCurrentAssignment(null);
      setCurrentForwardId(null);

      fetchAssignments();

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to forward assignment");
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Draft': 
        return {
          bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          icon: FileText
        };
      case 'Submitted': 
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200',
          icon: Clock
        };
      case 'accepted': 
        return {
          bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          icon: CheckCircle
        };
      case 'rejected': 
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: XCircle
        };
      default: 
        return {
          bg: 'bg-gradient-to-r from-slate-50 to-gray-50',
          text: 'text-slate-700',
          border: 'border-slate-200',
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

  const handleSelectPerson = (email, name) => {
    setForwardEmail(email);
    setSelectedForwardName(name);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* High-Quality Background Image - Same as other pages */}
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10 animate-fade-in">
            <button 
              onClick={() => navigate('/')}
              className="group flex items-center px-4 py-2.5 bg-white/90 backdrop-blur-sm text-orange-700 hover:text-orange-800 rounded-xl hover:bg-white transition-all duration-300 mb-8 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-semibold">Back to Dashboard</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div className="flex items-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mr-5 shadow-2xl hover:scale-105 transition-all duration-300 ring-4 ring-white/50">
                  <GraduationCap className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg mb-2">
                    Professor Dashboard
                  </h1>
                  <p className="text-white/90 font-medium backdrop-blur-sm px-2 py-1 rounded-lg inline-block">
                    Review and manage student submissions
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-5 py-4 border border-orange-200 hover:scale-[1.02] transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-yellow-400">
                  <div className="text-2xl font-bold text-amber-600">{stats.submitted}</div>
                  <div className="text-sm font-semibold text-slate-800">Pending</div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-5 py-4 border border-emerald-200 hover:scale-[1.02] transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-emerald-400">
                  <div className="text-2xl font-bold text-emerald-600">{stats.accepted}</div>
                  <div className="text-sm font-semibold text-slate-800">Accepted</div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-5 py-4 border border-red-200 hover:scale-[1.02] transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-red-400">
                  <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                  <div className="text-sm font-semibold text-slate-800">Rejected</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-7 mb-10 hover:shadow-3xl transition-all duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
              {/* Search */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-slate-800 mb-3 ml-1">
                  <div className="flex items-center">
                    <Search className="w-4 h-4 mr-2 text-orange-600" />
                    Search Assignments
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by title, student name, or email..."
                    onChange={(e) => debouncedSearch(e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 placeholder-slate-500 text-slate-900 font-medium shadow-inner"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                </div>
              </div>

              {/* Status Filter */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-slate-800 mb-3 ml-1">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2 text-orange-600" />
                    Filter by Status
                  </div>
                </label>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-12 pr-10 py-3.5 bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 cursor-pointer appearance-none text-slate-900 font-medium shadow-inner"
                  >
                    <option value="All">All Status ({stats.total})</option>
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted ({stats.submitted})</option>
                    <option value="accepted">Accepted ({stats.accepted})</option>
                    <option value="rejected">Rejected ({stats.rejected})</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-amber-600 transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-slate-600 flex items-center">
              <div className="h-2 w-2 rounded-full bg-orange-500 mr-2"></div>
              Showing <span className="font-semibold mx-1 text-slate-800">{filteredAssignments.length}</span> of <span className="font-semibold mx-1 text-slate-800">{assignments.length}</span> assignments
            </div>
          </div>

          {/* Assignment Cards */}
          <div className="space-y-5">
            {loading ? (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 text-center border border-white/30">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
                  <GraduationCap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-orange-600" />
                </div>
                <p className="mt-6 text-lg font-semibold text-slate-700">Loading assignments...</p>
                <p className="text-slate-500 text-sm mt-2">Please wait while we fetch your data</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 text-center border border-white/30">
                <div className="inline-block p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl mb-8 border border-orange-200">
                  <FileText className="w-20 h-20 text-orange-400" />
                </div>
                <p className="text-slate-800 text-2xl font-bold mb-3">No assignments found</p>
                <p className="text-slate-600">Try adjusting your search or filter criteria</p>
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
                    className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border-2 ${statusStyle.border} p-7 transition-all duration-400 hover:shadow-3xl hover:-translate-y-1 hover:border-orange-400 ${
                      isHovered ? 'scale-[1.005] ring-2 ring-orange-100' : ''
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      
                      {/* Student Info */}
                      <div className="flex items-center gap-4 lg:w-1/4">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300 flex-shrink-0 ring-2 ring-white">
                            <User className="w-6 h-6" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate text-lg">{assignment.email}</p>
                          <p className="text-xs text-slate-500 font-medium">Student ID</p>
                        </div>
                      </div>

                      {/* Assignment Details */}
                      <div className="flex-1 lg:w-2/5">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 hover:text-orange-700 transition-colors cursor-pointer line-clamp-1">
                          {assignment.title}
                        </h3>
                        {assignment.description && (
                          <p className="text-sm text-slate-600 line-clamp-2 mb-3">{assignment.description}</p>
                        )}
                        <div className="flex items-center text-sm text-slate-500">
                          <Clock className="w-4 h-4 mr-2 text-amber-600" />
                          <span>Submitted: {new Date(assignment.uploadedAt || assignment.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="lg:w-1/6">
                        <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border} hover:scale-105 transition-transform cursor-pointer shadow-sm`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="capitalize">{assignment.status}</span>
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 lg:w-1/4 lg:justify-end">
                        <a
                          href={assignment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-800 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-slate-300"
                        >
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span>View</span>
                        </a>

                        {assignment.status === "Submitted" && (
                          <>
                            <button
                              onClick={() => handleAccept(assignment._id, "accepted")}
                              disabled={processingId === assignment._id}
                              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              <span>Accept</span>
                            </button>

                            <button
                              onClick={() => handleAccept(assignment._id, "rejected")}
                              disabled={processingId === assignment._id}
                              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              <span>Decline</span>
                            </button>

                            {/* Forward Button */}
                            <button
                              onClick={() => handleForwardClick(assignment)}
                              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Forward className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              <span>Forward</span>
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
      </div>

      {/* FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-3xl overflow-hidden transform transition-all duration-300 scale-100 hover:scale-[1.01] border border-white/30">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-7">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <XCircle className="w-7 h-7" />
                Provide Feedback
              </h2>
              <p className="text-red-100 text-sm mt-2">Help the student improve their work</p>
            </div>

            {/* Modal Body */}
            <div className="p-7">
              <label className="block text-sm font-semibold text-slate-800 mb-3">
                Feedback Message
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Enter detailed feedback for the student..."
                className="w-full h-40 border-2 border-slate-300 rounded-xl p-4 focus:outline-none focus:ring-4 focus:ring-red-500/30 focus:border-red-500 transition-all duration-300 resize-none bg-gradient-to-br from-slate-50/80 to-slate-100/80 shadow-inner"
              ></textarea>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackText("");
                  }}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-slate-300"
                >
                  Cancel
                </button>

                <button
                  onClick={sendRejectFeedback}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Send Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATED FORWARD MODAL */}
      {showForwardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-4xl rounded-3xl shadow-3xl overflow-hidden transform transition-all duration-300 scale-100 hover:scale-[1.01] border border-white/30 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-7 sticky top-0 z-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Forward className="w-7 h-7" />
                Forward Assignment
              </h2>
              <p className="text-amber-100 text-sm mt-2">Select a professor or HOD to forward this assignment</p>
            </div>

            {/* Modal Body */}
            <div className="p-7">
              {loadingForwardOptions ? (
                <div className="text-center py-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto"></div>
                    <GraduationCap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-slate-700 font-medium text-lg mt-6">Loading professors and HODs...</p>
                  <p className="text-slate-500 text-sm mt-2">Fetching available reviewers</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Professors Section */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center pb-3 border-b border-slate-200">
                        <GraduationCap className="w-6 h-6 mr-3 text-orange-600" />
                        Professors
                        <span className="ml-auto text-sm font-normal bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                          {professorsList.length}
                        </span>
                      </h3>
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-3">
                        {professorsList.length > 0 ? (
                          professorsList.map((professor, index) => (
                            <div
                              key={`prof-${index}`}
                              onClick={() => handleSelectPerson(professor.email, professor.name)}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                forwardEmail === professor.email
                                  ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-400 shadow-sm'
                                  : 'bg-white border-slate-200 hover:border-orange-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
                                      <GraduationCap className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-800">{professor.name || professor.email}</p>
                                      <p className="text-sm text-slate-600">{professor.email}</p>
                                      {professor.department && (
                                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></span>
                                          {professor.department}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {forwardEmail === professor.email && (
                                  <div className="flex items-center justify-center w-8 h-8 bg-emerald-500 rounded-full ml-3">
                                    <CheckCircleIcon className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 bg-gradient-to-br from-orange-50/50 to-amber-50/50 rounded-xl border border-dashed border-orange-300">
                            <GraduationCap className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No professors found</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* HODs Section */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center pb-3 border-b border-slate-200">
                        <User className="w-6 h-6 mr-3 text-amber-600" />
                        Head of Departments
                        <span className="ml-auto text-sm font-normal bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                          {hodsList.length}
                        </span>
                      </h3>
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-3">
                        {hodsList.length > 0 ? (
                          hodsList.map((hod, index) => (
                            <div
                              key={`hod-${index}`}
                              onClick={() => handleSelectPerson(hod.email, hod.name)}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                forwardEmail === hod.email
                                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-400 shadow-sm'
                                  : 'bg-white border-slate-200 hover:border-amber-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg flex items-center justify-center">
                                      <User className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-800">{hod.name || hod.email} <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-2">HOD</span></p>
                                      <p className="text-sm text-slate-600">{hod.email}</p>
                                      {hod.department && (
                                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2"></span>
                                          {hod.department}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {forwardEmail === hod.email && (
                                  <div className="flex items-center justify-center w-8 h-8 bg-emerald-500 rounded-full ml-3">
                                    <CheckCircleIcon className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 rounded-xl border border-dashed border-amber-300">
                            <User className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No HODs found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Selected Person Info */}
                  {selectedForwardName && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-xl border-2 border-orange-300 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                          <Forward className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">Selected Recipient</p>
                          <p className="text-xl font-bold text-slate-900">{selectedForwardName}</p>
                          <p className="text-sm text-slate-600">{forwardEmail}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-3">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={forwardNotes}
                      onChange={(e) => setForwardNotes(e.target.value)}
                      placeholder="Add any notes or instructions for the reviewer..."
                      className="w-full h-40 border-2 border-slate-300 rounded-xl p-4 focus:outline-none focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 resize-none bg-gradient-to-br from-slate-50/80 to-slate-100/80 shadow-inner"
                    ></textarea>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setShowForwardModal(false);
                        setForwardEmail("");
                        setSelectedForwardName("");
                        setForwardNotes("");
                        setProfessorsList([]);
                        setHodsList([]);
                      }}
                      className="flex-1 px-6 py-3.5 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-slate-300"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleForwardSubmit}
                      disabled={!forwardEmail}
                      className="flex-1 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Forward Assignment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-12 mb-6 animate-fade-in">
        <p className="text-white/80 text-sm font-medium drop-shadow-lg">
          <GraduationCap className="inline-block w-4 h-4 mr-2" />
          EduFlow Professor Dashboard
        </p>
        <p className="text-white/60 text-xs mt-2">
          © 2025 All rights reserved. Academic assignment management system.
        </p>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
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