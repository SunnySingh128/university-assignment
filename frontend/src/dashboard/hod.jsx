import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Clock, Eye, Search, Filter, GraduationCap, User, Shield, Mail } from 'lucide-react';
import axios from 'axios';
import { useNavigate,useLocation } from 'react-router-dom';

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
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/assignments/hod1`, {
        headers: { Authorization: `Bearer ${token}` },
        email:email1,
      });

      console.log('Assignments data:', res.data);

      if (res.data && Array.isArray(res.data)) {
        setAssignments(res.data);
        setFilteredAssignments(res.data);
      } else if (res.data.assignments && Array.isArray(res.data.assignments)) {
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

      alert('Assignment approved successfully!');
      fetchAssignments();
    } catch (error) {
      console.error('Error accepting assignment:', error);
      alert(error.response?.data?.message || 'Failed to approve assignment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (assignmentId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason) {
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

      alert('Assignment rejected successfully!');
      fetchAssignments();
    } catch (error) {
      console.error('Error rejecting assignment:', error);
      alert(error.response?.data?.message || 'Failed to reject assignment');
    } finally {
      setProcessingId(null);
    }
  };

  const statusColors = {
    Draft: "bg-gray-100 text-gray-800 border-gray-300",
    Submitted: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Forwarded: "bg-blue-100 text-blue-800 border-blue-300",
    Approved: "bg-green-100 text-green-800 border-green-300",
    Rejected: "bg-red-100 text-red-800 border-red-300",
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6 lg:p-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-700"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-xl">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">HOD Dashboard</h1>
                <p className="text-gray-600 mt-1">Review and approve department submissions</p>
              </div>
            </div>

            {/* HOD Info Badge */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs opacity-90">Head of Department</p>
                  <p className="font-bold text-sm">{email1}</p>
                  {hodInfo.email && (
                    <p className="text-xs opacity-75 flex items-center mt-0.5">
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-purple-100 hover:border-purple-300 transition-all text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{statusCounts.All}</p>
            <p className="text-sm text-gray-600 mt-1">Total</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-gray-100 hover:border-gray-300 transition-all text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-600">{statusCounts.Draft}</p>
            <p className="text-sm text-gray-600 mt-1">Draft</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-blue-100 hover:border-blue-300 transition-all text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{statusCounts.Forwarded}</p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-green-100 hover:border-green-300 transition-all text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-green-600">{statusCounts.Approved}</p>
            <p className="text-sm text-gray-600 mt-1">Approved</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-red-100 hover:border-red-300 transition-all text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-red-600">{statusCounts.Rejected}</p>
            <p className="text-sm text-gray-600 mt-1">Rejected</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Assignments
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by title, student, professor, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all outline-none"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Status
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all outline-none appearance-none bg-white cursor-pointer"
                >
                  <option value="All">All Status ({statusCounts.All})</option>
                  <option value="Draft">Draft ({statusCounts.Draft})</option>
                  <option value="Forwarded">Forwarded ({statusCounts.Forwarded})</option>
                  <option value="Approved">Approved ({statusCounts.Approved})</option>
                  <option value="Rejected">Rejected ({statusCounts.Rejected})</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600 font-medium">
            Showing {filteredAssignments.length} of {assignments.length} assignments
          </div>
        </div>

        {/* Assignments List */}
        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading assignments...</p>
            </div>
          ) : filteredAssignments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-purple-100 bg-purple-50">
                    <th className="text-left p-4 font-bold text-gray-700">Student</th>
                    <th className="text-left p-4 font-bold text-gray-700">Assignment</th>
                    <th className="text-left p-4 font-bold text-gray-700">Professor</th>
                    <th className="text-left p-4 font-bold text-gray-700">Department</th>
                    <th className="text-left p-4 font-bold text-gray-700">Status</th>
                    <th className="text-left p-4 font-bold text-gray-700">Submitted</th>
                    <th className="text-right p-4 font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment, index) => {
                    const StatusIcon = getStatusIcon(assignment.status);
                    return (
                      <tr key={assignment._id || index} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{assignment.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-start">
                            <FileText className="w-5 h-5 text-purple-400 mr-2 mt-1" />
                            <div>
                              <p className="font-bold text-gray-900">{assignment.title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-gray-700 font-medium">{assignment.professor || 'N/A'}</p>
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                            {assignment.department}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 ${statusColors[assignment.status]}`}>
                            <StatusIcon className="w-4 h-4 mr-1.5" />
                            {assignment.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 text-sm">
                          {new Date(assignment.uploadedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={assignment.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all text-sm shadow-sm"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </a>
                            
                            {assignment.status === 'Forwarded' && (
                              <>
                                <button
                                  onClick={() => handleAccept(assignment._id)}
                                  disabled={processingId === assignment._id}
                                  className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(assignment._id)}
                                  disabled={processingId === assignment._id}
                                  className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
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
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Shield className="w-16 h-16 mb-4 opacity-30 text-purple-300" />
              <p className="text-lg font-semibold mb-2">No assignments found</p>
              <p className="text-sm">
                {searchTerm || filterStatus !== "All"
                  ? "Try adjusting your search or filter criteria"
                  : "No submissions forwarded for review yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}