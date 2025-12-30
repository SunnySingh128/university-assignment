import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Clock, Eye, Search, Filter, GraduationCap, User, ArrowLeft, Forward, CheckCircle as CheckCircleIcon, AlertCircle, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import debounce from '../debouncing';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-50 border-green-300 text-green-800',
    error: 'bg-red-50 border-red-300 text-red-800',
    warning: 'bg-amber-50 border-amber-300 text-amber-800'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600" />
  };

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border ${styles[type]} animate-slide-in`}>
      {icons[type]}
      <p className="font-medium text-sm">{message}</p>
      <button onClick={onClose} className="ml-1 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Confirm Modal
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-amber-100 rounded-xl">
          <AlertCircle className="w-6 h-6 text-amber-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Confirm Action</h3>
      </div>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-700">Confirm</button>
      </div>
    </div>
  </div>
);

export default function ProfessorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const email1 = location.state?.email;
  
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [processingId, setProcessingId] = useState(null);
  const [department1, setDepartment] = useState("");
  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [currentRejectId, setCurrentRejectId] = useState(null);

  const [showForwardModal, setShowForwardModal] = useState(false);
  const [professorsList, setProfessorsList] = useState([]);
  const [hodsList, setHodsList] = useState([]);
  const [forwardEmail, setForwardEmail] = useState("");
  const [selectedForwardName, setSelectedForwardName] = useState("");
  const [forwardNotes, setForwardNotes] = useState("");
  const [loadingForwardOptions, setLoadingForwardOptions] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const debouncedSearch = React.useRef(
    debounce((value) => setSearchTerm(value), 3000)
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
      showToast('Failed to load assignments', 'error');
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

  const handleAccept = (assignmentId, action) => {
    if(action === "rejected"){
      setCurrentRejectId(assignmentId);
      setShowFeedbackModal(true);
      return;
    }
    setConfirmData({ id: assignmentId, action });
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    setShowConfirm(false);
    setProcessingId(confirmData.id);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/student/professor1/${confirmData.id}`,
        { status: confirmData.action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`Assignment ${confirmData.action} successfully!`, 'success');
      fetchAssignments();
    } catch (error) {
      showToast(error.response?.data?.message || 'Action failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleForwardClick = async (assignment) => {
    setCurrentAssignment(assignment);
    setLoadingForwardOptions(true);
    try {
      const token = localStorage.getItem("token");
      const [professorsResponse, hodsResponse] = await Promise.all([
        axios.post(`${import.meta.env.VITE_API_URL}/admin/professor1`, { email: email1 }, { headers: { Authorization: `Bearer ${token}` } }),
        axios.post(`${import.meta.env.VITE_API_URL}/admin/hod`, { email: email1 }, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProfessorsList(Array.isArray(professorsResponse.data?.professors) ? professorsResponse.data.professors : []);
      setHodsList(Array.isArray(hodsResponse.data?.hod) ? hodsResponse.data.hod : []);
      setShowForwardModal(true);
    } catch (error) {
      showToast("Failed to load reviewers", 'error');
    } finally {
      setLoadingForwardOptions(false);
    }
  };

  const sendRejectFeedback = async () => {
    if (!feedbackText.trim()) {
      showToast("Please enter feedback", 'warning');
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/student/professor1/${currentRejectId}`,
        { status: "rejected", feedback: feedbackText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Feedback sent!", 'success');
      setShowFeedbackModal(false);
      setFeedbackText("");
      setCurrentRejectId(null);
      fetchAssignments();
    } catch (error) {
      showToast("Failed to send feedback", 'error');
    }
  };

  const handleForwardSubmit = async () => {
    if (!currentAssignment) {
      showToast("Assignment data missing", 'error');
      return;
    }
    if (!forwardEmail.trim()) {
      showToast("Please select a reviewer", 'warning');
      return;
    }
    try {
      const token = localStorage.getItem("token");
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Assignment forwarded!", 'success');
      setShowForwardModal(false);
      setForwardEmail("");
      setSelectedForwardName("");
      setForwardNotes("");
      setCurrentAssignment(null);
      fetchAssignments();
    } catch (error) {
      showToast(error.response?.data?.message || "Forward failed", 'error');
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      'Draft': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: FileText },
      'Submitted': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
      'accepted': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
      'rejected': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle }
    };
    return styles[status] || styles['Draft'];
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showConfirm && <ConfirmModal message={`Are you sure you want to ${confirmData.action} this assignment?`} onConfirm={confirmAction} onCancel={() => setShowConfirm(false)} />}

      {/* Background */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=2400&q=95&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.85) contrast(1.15) saturate(1.1)'
      }} />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 via-orange-800/50 to-rose-900/60 z-10" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse z-10" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse z-10" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-20 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button onClick={() => navigate('/')} className="flex items-center text-white hover:text-amber-200 mb-6 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg font-medium transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-lg">Professor Dashboard</h1>
                  <p className="text-orange-100 text-sm drop-shadow">Manage student submissions</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-3 border border-white/30">
                  <div className="text-xl font-bold text-amber-600">{stats.submitted}</div>
                  <div className="text-xs font-medium text-gray-600">Pending</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-3 border border-white/30">
                  <div className="text-xl font-bold text-green-600">{stats.accepted}</div>
                  <div className="text-xs font-medium text-gray-600">Accepted</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-3 border border-white/30">
                  <div className="text-xl font-bold text-red-600">{stats.rejected}</div>
                  <div className="text-xs font-medium text-gray-600">Rejected</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-5 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Search assignments..." onChange={(e) => debouncedSearch(e.target.value)} className="w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm" />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none appearance-none text-sm cursor-pointer">
                  <option value="All">All Status ({stats.total})</option>
                  <option value="Submitted">Submitted ({stats.submitted})</option>
                  <option value="accepted">Accepted ({stats.accepted})</option>
                  <option value="rejected">Rejected ({stats.rejected})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Assignments */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-white/30">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-amber-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-700 font-medium">Loading assignments...</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-white/30">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium text-lg">No assignments found</p>
                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              filteredAssignments.map((assignment) => {
                const statusStyle = getStatusStyle(assignment.status);
                const StatusIcon = statusStyle.icon;

                return (
                  <div key={assignment._id} className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border ${statusStyle.border} p-5 hover:shadow-xl transition-all`}>
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-center gap-3 lg:w-1/4">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{assignment.email}</p>
                          <p className="text-xs text-gray-500">Student</p>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900 mb-1">{assignment.title}</h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(assignment.uploadedAt || assignment.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {assignment.status}
                      </span>

                      <div className="flex gap-2">
                        <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all">
                          <Eye className="w-4 h-4" />
                        </a>

                        {assignment.status === "Submitted" && (
                          <>
                            <button onClick={() => handleAccept(assignment._id, "accepted")} disabled={processingId === assignment._id} className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all disabled:opacity-50">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleAccept(assignment._id, "rejected")} disabled={processingId === assignment._id} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all disabled:opacity-50">
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleForwardClick(assignment)} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all">
                              <Forward className="w-4 h-4" />
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

      {/* Keep your existing Feedback and Forward modals here */}
      
      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}