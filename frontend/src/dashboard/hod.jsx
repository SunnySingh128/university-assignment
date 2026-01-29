import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Clock, Eye, Search, Filter, GraduationCap, User, Shield, Mail, CheckCircle as CheckCircleIcon, XCircle as XCircleIcon, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate,useLocation } from 'react-router-dom';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800',
    error: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-800',
    warning: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-800'
  };

  const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0" />,
    error: <XCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />,
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
        <XCircleIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function HODDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const email1 = location.state?.email;
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [processingId, setProcessingId] = useState(null);
  const [hodInfo, setHodInfo] = useState({ name: '', email: '' });
  const [toast, setToast] = useState(null);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchAssignments();
    loadHODInfo();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [searchTerm, filterStatus, assignments]);

  const loadHODInfo = () => {
    // Get HOD info from localStorage or user state
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setHodInfo({
      name: user.name || 'HOD',
      email: user.email || ''
    });
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:3000/assignments/hod1`, {
        email: email1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Assignments data:', res.data);

      if (res.data && Array.isArray(res.data)) {
        setAssignments(res.data);
        setFilteredAssignments(res.data);
      } else if (res.data.assignments && Array.isArray(res.data.assignments)) {
        setAssignments(res.data.assignments);
        setFilteredAssignments(res.data.assignments);
      }
      showToast("Assignments loaded successfully!", "success");
    } catch (error) {
      console.error('Error fetching assignments:', error);
      showToast("Failed to load assignments. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments;

    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.professor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "All") {
      filtered = filtered.filter(assignment => assignment.status === filterStatus);
    }

    setFilteredAssignments(filtered);
  };

  const handleAccept = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to approve this assignment?')) {
      return;
    }

    setProcessingId(assignmentId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/student/hod/${assignmentId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('Assignment approved successfully!', 'success');
      fetchAssignments();
    } catch (error) {
      console.error('Error accepting assignment:', error);
      showToast(error.response?.data?.message || 'Failed to approve assignment', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (assignmentId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason) {
      showToast('Rejection cancelled. No reason provided.', 'warning');
      return;
    }

    setProcessingId(assignmentId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/student/hod/${assignmentId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('Assignment rejected successfully!', 'success');
      fetchAssignments();
    } catch (error) {
      console.error('Error rejecting assignment:', error);
      showToast(error.response?.data?.message || 'Failed to reject assignment', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const statusColors = {
    Draft: "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200",
    Submitted: "bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-800 border-amber-200",
    Forwarded: "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200",
    Approved: "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200",
  };

  const statusIcons = {
    Draft: FileText,
    Submitted: Clock,
    Forwarded: Clock,
    Approved: CheckCircle,
    Rejected: XCircle,
  };

  const getStatusIcon = (status) => {
    const Icon = statusIcons[status] || FileText;
    return Icon;
  };

  const statusCounts = {
    All: assignments.length,
    Draft: assignments.filter(a => a.status === "Draft").length,
    Forwarded: assignments.filter(a => a.status === "Forwarded").length,
    Approved: assignments.filter(a => a.status === "Approved").length,
    Rejected: assignments.filter(a => a.status === "Rejected").length,
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mr-5 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg mb-2">
                    HOD Dashboard
                  </h1>
                  <p className="text-white/90 font-medium backdrop-blur-sm px-2 py-1 rounded-lg inline-block">
                    Review and approve department submissions
                  </p>
                </div>
              </div>

              {/* HOD Info Badge */}
              <div className="bg-white/95 backdrop-blur-xl border-2 border-amber-200 rounded-2xl shadow-2xl px-6 py-5 hover:shadow-3xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mr-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-600">Head of Department</p>
                    <p className="font-bold text-slate-900 text-lg">{email1}</p>
                    {hodInfo.email && (
                      <p className="text-xs text-slate-600 mt-1 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {hodInfo.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-10">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-orange-200 hover:border-orange-400 hover:shadow-2xl transition-all text-center group hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <p className="text-4xl font-extrabold text-orange-600">{statusCounts.All}</p>
              <p className="text-sm font-semibold text-slate-800 mt-2">Total</p>
            </div>
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-amber-200 hover:border-amber-400 hover:shadow-2xl transition-all text-center group hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <p className="text-4xl font-extrabold text-amber-600">{statusCounts.Draft}</p>
              <p className="text-sm font-semibold text-slate-800 mt-2">Draft</p>
            </div>
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-orange-200 hover:border-orange-400 hover:shadow-2xl transition-all text-center group hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <p className="text-4xl font-extrabold text-orange-600">{statusCounts.Forwarded}</p>
              <p className="text-sm font-semibold text-slate-800 mt-2">Pending</p>
            </div>
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all text-center group hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <p className="text-4xl font-extrabold text-emerald-600">{statusCounts.Approved}</p>
              <p className="text-sm font-semibold text-slate-800 mt-2">Approved</p>
            </div>
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-red-200 hover:border-red-400 hover:shadow-2xl transition-all text-center group hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <XCircle className="w-7 h-7 text-white" />
              </div>
              <p className="text-4xl font-extrabold text-red-600">{statusCounts.Rejected}</p>
              <p className="text-sm font-semibold text-slate-800 mt-2">Rejected</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 mb-10 hover:shadow-3xl transition-all duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Search */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-800 mb-3 ml-1">
                  <div className="flex items-center">
                    <Search className="w-4 h-4 mr-2 text-orange-600" />
                    Search Assignments
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by title, student, professor, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 placeholder-gray-500 text-gray-900 font-medium shadow-inner"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                </div>
              </div>

              {/* Status Filter */}
              <div className="group">
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
                    className="w-full pl-12 pr-5 py-3.5 bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 text-gray-900 font-medium appearance-none shadow-inner cursor-pointer"
                  >
                    <option value="All">All Status ({statusCounts.All})</option>
                    <option value="Draft">Draft ({statusCounts.Draft})</option>
                    <option value="Forwarded">Forwarded ({statusCounts.Forwarded})</option>
                    <option value="Approved">Approved ({statusCounts.Approved})</option>
                    <option value="Rejected">Rejected ({statusCounts.Rejected})</option>
                  </select>
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
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

          {/* Assignments List */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                  <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-orange-600" />
                </div>
                <p className="mt-6 text-lg font-semibold text-gray-700">Loading assignments...</p>
                <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your data</p>
              </div>
            ) : filteredAssignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-50/80 to-amber-50/80 backdrop-blur-sm border-b-2 border-orange-200">
                      <th className="text-left p-6 font-bold text-gray-800 text-sm uppercase tracking-wider">Student</th>
                      <th className="text-left p-6 font-bold text-gray-800 text-sm uppercase tracking-wider">Assignment</th>
                      <th className="text-left p-6 font-bold text-gray-800 text-sm uppercase tracking-wider">Professor</th>
                      <th className="text-left p-6 font-bold text-gray-800 text-sm uppercase tracking-wider">Department</th>
                      <th className="text-left p-6 font-bold text-gray-800 text-sm uppercase tracking-wider">Status</th>
                      <th className="text-left p-6 font-bold text-gray-800 text-sm uppercase tracking-wider">Submitted</th>
                      <th className="text-right p-6 font-bold text-gray-800 text-sm uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((assignment, index) => {
                      const StatusIcon = getStatusIcon(assignment.status);
                      return (
                        <tr key={assignment._id || index} className="border-b border-orange-100/50 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 transition-all duration-300">
                          <td className="p-6">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center mr-4">
                                <User className="w-6 h-6 text-orange-600" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-lg">{assignment.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-start">
                              <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg flex items-center justify-center mr-3">
                                <FileText className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-lg">{assignment.title}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            <p className="text-gray-800 font-medium text-lg">{assignment.professor || 'N/A'}</p>
                          </td>
                          <td className="p-6">
                            <span className="inline-block px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 rounded-xl text-sm font-bold border border-amber-200">
                              {assignment.department}
                            </span>
                          </td>
                          <td className="p-6">
                            <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border-2 ${statusColors[assignment.status]}`}>
                              <StatusIcon className="w-5 h-5 mr-2" />
                              {assignment.status}
                            </span>
                          </td>
                          <td className="p-6 text-gray-600 text-sm">
                            {new Date(assignment.uploadedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="p-6">
                            <div className="flex items-center justify-end gap-3">
                              <a
                                href={assignment.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-800 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 border border-slate-300"
                              >
                                <Eye className="w-5 h-5 mr-2" />
                                View
                              </a>
                              
                              {assignment.status === 'Forwarded' && (
                                <>
                                  <button
                                    onClick={() => handleAccept(assignment._id)}
                                    disabled={processingId === assignment._id}
                                    className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(assignment._id)}
                                    disabled={processingId === assignment._id}
                                    className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <XCircle className="w-5 h-5 mr-2" />
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  <Shield className="w-12 h-12 text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-3 text-center">No assignments found</p>
                <p className="text-gray-600 text-center max-w-md">
                  {searchTerm || filterStatus !== "All"
                    ? "Try adjusting your search or filter criteria"
                    : "No submissions forwarded for review yet"}
                </p>
                <button 
                  onClick={() => {setSearchTerm(''); setFilterStatus('All');}}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-12 mb-6 animate-fade-in">
            <p className="text-white/80 text-sm font-medium drop-shadow-lg">
              <Shield className="inline-block w-4 h-4 mr-2" />
              EduFlow HOD Management System
            </p>
            <p className="text-white/60 text-xs mt-2">
              © 2025 All rights reserved. Department leadership portal.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
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