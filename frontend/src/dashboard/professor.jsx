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

  // Forward modal states - UPDATED
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [professorsList, setProfessorsList] = useState([]); // For storing professors
  const [hodsList, setHodsList] = useState([]); // For storing HODs
  const [forwardEmail, setForwardEmail] = useState("");
  const [selectedForwardName, setSelectedForwardName] = useState(""); // For displaying selected name
  const [forwardNotes, setForwardNotes] = useState("");
  const [currentForwardId, setCurrentForwardId] = useState(null);
  const [loadingForwardOptions, setLoadingForwardOptions] = useState(false); // Loading state for fetching
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

  // UPDATED: Handle Forward button click
const handleForwardClick = async (assignment) => {
  setCurrentForwardId(assignment._id);
  setCurrentAssignment(assignment); // 🔥 THIS FIXES THE CRASH
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


  // Send Feedback on Rejection
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

  // Handle Forward submission
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
        department:department1,
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
          bg: 'bg-gradient-to-r from-gray-100 to-gray-200',
          text: 'text-gray-700',
          border: 'border-gray-300',
          icon: FileText
        };
      case 'Submitted': 
        return {
          bg: 'bg-gradient-to-r from-yellow-100 to-amber-100',
          text: 'text-amber-700',
          border: 'border-amber-300',
          icon: Clock
        };
      case 'accepted': 
        return {
          bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
          text: 'text-green-700',
          border: 'border-green-300',
          icon: CheckCircle
        };
      case 'rejected': 
        return {
          bg: 'bg-gradient-to-r from-red-100 to-rose-100',
          text: 'text-red-700',
          border: 'border-red-300',
          icon: XCircle
        };
      default: 
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-300',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      {/* Floating background elements - ENHANCED */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header - ENHANCED */}
        <div className="mb-10">
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center text-slate-700 hover:text-indigo-700 mb-8 transition-all duration-300 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm hover:shadow-md border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium text-sm">Back to Dashboard</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="flex items-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-5 shadow-lg hover:scale-105 transition-all duration-300 ring-4 ring-white/50">
                <GraduationCap className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 bg-gradient-to-r from-slate-800 to-indigo-800 bg-clip-text text-transparent">Professor Dashboard</h1>
                <p className="text-slate-600">Review and manage student submissions</p>
              </div>
            </div>

            {/* Quick Stats - ENHANCED */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-5 py-4 border border-slate-200 hover:scale-[1.02] transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-yellow-300">
                <div className="text-2xl font-bold text-amber-600">{stats.submitted}</div>
                <div className="text-sm font-medium text-slate-700">Pending</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-5 py-4 border border-slate-200 hover:scale-[1.02] transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-emerald-300">
                <div className="text-2xl font-bold text-emerald-600">{stats.accepted}</div>
                <div className="text-sm font-medium text-slate-700">Accepted</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-5 py-4 border border-slate-200 hover:scale-[1.02] transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-rose-300">
                <div className="text-2xl font-bold text-rose-600">{stats.rejected}</div>
                <div className="text-sm font-medium text-slate-700">Rejected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filter - ENHANCED */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-200/60 p-7 mb-10 hover:shadow-2xl transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
            {/* Search */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Search Assignments</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors z-10" />
                <input
                  type="text"
                  placeholder="Search by title, student name, or email..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-full pl-12 pr-5 py-3.5 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 bg-white/80 shadow-inner"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Filter by Status</label>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors z-10" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 cursor-pointer appearance-none bg-white/80 shadow-inner"
                >
                  <option value="All">All Status ({stats.total})</option>
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted ({stats.submitted})</option>
                  <option value="accepted">Accepted ({stats.accepted})</option>
                  <option value="rejected">Rejected ({stats.rejected})</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-slate-600 flex items-center">
            <div className="h-2 w-2 rounded-full bg-indigo-500 mr-2"></div>
            Showing <span className="font-semibold mx-1 text-slate-800">{filteredAssignments.length}</span> of <span className="font-semibold mx-1 text-slate-800">{assignments.length}</span> assignments
          </div>
        </div>

        {/* Assignment Cards - ENHANCED */}
        <div className="space-y-5">
          {loading ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-16 text-center border border-slate-200">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-500 border-t-transparent mx-auto mb-6"></div>
              <p className="text-slate-700 font-medium text-lg">Loading assignments...</p>
              <p className="text-slate-500 text-sm mt-2">Please wait while we fetch your data</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-16 text-center border border-slate-200">
              <div className="inline-block p-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-8 border border-indigo-200">
                <FileText className="w-20 h-20 text-indigo-400" />
              </div>
              <p className="text-slate-800 text-2xl font-semibold mb-3">No assignments found</p>
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
                  className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 ${statusStyle.border} p-7 transition-all duration-400 hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-400 ${
                    isHovered ? 'scale-[1.005] ring-2 ring-indigo-100' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    
                    {/* Student Info - ENHANCED */}
                    <div className="flex items-center gap-4 lg:w-1/4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300 flex-shrink-0 ring-2 ring-white">
                          <User className="w-6 h-6" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate text-lg">{assignment.email}</p>
                        <p className="text-xs text-slate-500 font-medium">Student ID</p>
                      </div>
                    </div>

                    {/* Assignment Details - ENHANCED */}
                    <div className="flex-1 lg:w-2/5">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 hover:text-indigo-700 transition-colors cursor-pointer line-clamp-1">
                        {assignment.title}
                      </h3>
                      {assignment.description && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{assignment.description}</p>
                      )}
                      <div className="flex items-center text-sm text-slate-500">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Submitted: {new Date(assignment.uploadedAt || assignment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>

                    {/* Status Badge - ENHANCED */}
                    <div className="lg:w-1/6">
                      <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border} hover:scale-105 transition-transform cursor-pointer shadow-sm`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="capitalize">{assignment.status}</span>
                      </span>
                    </div>

                    {/* Actions - ENHANCED */}
                    <div className="flex flex-wrap gap-3 lg:w-1/4 lg:justify-end">
                      <a
                        href={assignment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-800 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-slate-300"
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
                            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Decline</span>
                          </button>

                          {/* Forward Button - ENHANCED */}
                          <button
                            onClick={() => handleForwardClick(assignment)}
                            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* FEEDBACK MODAL - ENHANCED */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-3xl overflow-hidden transform transition-all duration-300 scale-100 hover:scale-[1.01]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-7">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <XCircle className="w-7 h-7" />
                Provide Feedback
              </h2>
              <p className="text-rose-100 text-sm mt-2">Help the student improve their work</p>
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
                className="w-full h-40 border-2 border-slate-300 rounded-xl p-4 focus:ring-3 focus:ring-rose-500/30 focus:border-rose-500 outline-none transition-all duration-300 resize-none bg-slate-50/50"
              ></textarea>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackText("");
                  }}
                  className="flex-1 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-slate-300"
                >
                  Cancel
                </button>

                <button
                  onClick={sendRejectFeedback}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Send Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATED FORWARD MODAL - ENHANCED */}
      {showForwardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-3xl overflow-hidden transform transition-all duration-300 scale-100 hover:scale-[1.01] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-7 sticky top-0 z-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Forward className="w-7 h-7" />
                Forward Assignment
              </h2>
              <p className="text-blue-100 text-sm mt-2">Select a professor or HOD to forward this assignment</p>
            </div>

            {/* Modal Body */}
            <div className="p-7">
              {loadingForwardOptions ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto mb-6"></div>
                  <p className="text-slate-700 font-medium text-lg">Loading professors and HODs...</p>
                  <p className="text-slate-500 text-sm mt-2">Fetching available reviewers</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Professors Section - ENHANCED */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center pb-3 border-b border-slate-200">
                        <GraduationCap className="w-6 h-6 mr-3 text-indigo-600" />
                        Professors
                        <span className="ml-auto text-sm font-normal bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
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
                                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-sm'
                                  : 'bg-white border-slate-200 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center">
                                      <GraduationCap className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-800">{professor.name || professor.email}</p>
                                      <p className="text-sm text-slate-600">{professor.email}</p>
                                      {professor.department && (
                                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                                          {professor.department}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {forwardEmail === professor.email && (
                                  <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full ml-3">
                                    <CheckCircleIcon className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                            <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No professors found</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* HODs Section - ENHANCED */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center pb-3 border-b border-slate-200">
                        <User className="w-6 h-6 mr-3 text-purple-600" />
                        Head of Departments
                        <span className="ml-auto text-sm font-normal bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
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
                                  ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-400 shadow-sm'
                                  : 'bg-white border-slate-200 hover:border-purple-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                      <User className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-800">{hod.name || hod.email} <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-2">HOD</span></p>
                                      <p className="text-sm text-slate-600">{hod.email}</p>
                                      {hod.department && (
                                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                                          {hod.department}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {forwardEmail === hod.email && (
                                  <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full ml-3">
                                    <CheckCircleIcon className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                            <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No HODs found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Selected Person Info - ENHANCED */}
                  {selectedForwardName && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-300 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
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

                  {/* Additional Notes - ENHANCED */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-3">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={forwardNotes}
                      onChange={(e) => setForwardNotes(e.target.value)}
                      placeholder="Add any notes or instructions for the reviewer..."
                      className="w-full h-40 border-2 border-slate-300 rounded-xl p-4 focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-300 resize-none bg-slate-50/50"
                    ></textarea>
                  </div>

                  {/* Action Buttons - ENHANCED */}
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
                      className="flex-1 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-slate-300"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleForwardSubmit}
                      disabled={!forwardEmail}
                      className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Add CSS animations in your global CSS file */}
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
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}