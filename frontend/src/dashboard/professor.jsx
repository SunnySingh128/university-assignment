import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Clock, Eye, Search, Filter, GraduationCap, User, Download } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ProfessorDashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [processingId, setProcessingId] = useState(null);

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
      const res = await axios.post('/api/student/professor', {
        headers: { Authorization: `Bearer ${token}` },
        professor:"suhani",
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
        assignment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "All") {
      filtered = filtered.filter(assignment => assignment.status === filterStatus);
    }

    setFilteredAssignments(filtered);
  };

  const handleAccept = async (assignmentId,a) => {
    if (!window.confirm(`Are you sure you want to ${a} this assignment?`)) {
      return;
    }
console.log(a," ",assignmentId);
    setProcessingId(assignmentId);
    try {
      const token = localStorage.getItem('token');
       await axios.post(
      `/api/student/professor1/${assignmentId}`,   // URL
      { status: a },                              // BODY
      { headers: { Authorization: `Bearer ${token}` }} // HEADERS
    );

      alert('Assignment accepted successfully!');
      fetchAssignments(); // Refresh the list
    } catch (error) {
      console.error('Error accepting assignment:', error);
      alert(error.response?.data?.message || `Failed to ${a} assignment`);
    } finally {
      setProcessingId(null);
    }
  };

  // const handleDecline = async (assignmentId) => {
  //   const reason = window.prompt('Please provide a reason for declining:');
  //   if (!reason) {
  //     return;
  //   }

  //   setProcessingId(assignmentId);
  //   try {
  //     const token = localStorage.getItem('token');
  //     await axios.post(
  //       `http://localhost:3000/api/student/professor/${assignmentId}/decline`,
  //       { reason },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     alert('Assignment declined successfully!');
  //     fetchAssignments(); // Refresh the list
  //   } catch (error) {
  //     console.error('Error declining assignment:', error);
  //     alert(error.response?.data?.message || 'Failed to decline assignment');
  //   } finally {
  //     setProcessingId(null);
  //   }
  // };

  const statusColors = {
    Draft: "bg-gray-100 text-gray-800 border-gray-300",
    Submitted: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Approved: "bg-green-100 text-green-800 border-green-300",
    Rejected: "bg-red-100 text-red-800 border-red-300",
  };

  const statusIcons = {
    Draft: FileText,
    Submitted: Clock,
    accepted: CheckCircle,
    rejected: XCircle,
  };

  const getStatusIcon = (status) => {
    const Icon = statusIcons[status] || FileText;
    return Icon;
  };

  const statusCounts = {
    All: assignments.length,
    Draft: assignments.filter(a => a.status === "Draft").length,
    Submitted: assignments.filter(a => a.status === "Submitted").length,
    Approved: assignments.filter(a => a.status === "accepted").length,
    Rejected: assignments.filter(a => a.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 lg:p-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-700"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Professor Dashboard</h1>
                <p className="text-gray-600 mt-1">Review and manage student submissions</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center">
            <p className="text-3xl font-bold text-blue-600">{statusCounts.All}</p>
            <p className="text-sm text-gray-600 mt-1">Total</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center">
            <p className="text-3xl font-bold text-gray-600">{statusCounts.Draft}</p>
            <p className="text-sm text-gray-600 mt-1">Draft</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center">
            <p className="text-3xl font-bold text-yellow-600">{statusCounts.Submitted}</p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center">
            <p className="text-3xl font-bold text-green-600">{statusCounts.Approved}</p>
            <p className="text-sm text-gray-600 mt-1">Approved</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 text-center">
            <p className="text-3xl font-bold text-red-600">{statusCounts.Rejected}</p>
            <p className="text-sm text-gray-600 mt-1">Rejected</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Assignments
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by title, student name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none appearance-none bg-white cursor-pointer"
                >
                  <option value="All">All Status ({statusCounts.All})</option>
                  <option value="Draft">Draft ({statusCounts.Draft})</option>
                  <option value="Submitted">Submitted ({statusCounts.Submitted})</option>
                  <option value="accepted">accepted ({statusCounts.accepted})</option>
                  <option value="rejected">rejected ({statusCounts.rejected})</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAssignments.length} of {assignments.length} assignments
          </div>
        </div>

        {/* Assignments List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading assignments...</p>
            </div>
          ) : filteredAssignments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left p-4 font-semibold text-gray-700">Student</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Assignment</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Submitted</th>
                    <th className="text-right p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment, index) => {
                    const StatusIcon = getStatusIcon(assignment.status);
                    return (
                      <tr key={assignment._id || index} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">{assignment.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-start">
                            <FileText className="w-5 h-5 text-gray-400 mr-2 mt-1" />
                            <div>
                              <p className="font-semibold text-gray-900">{assignment.title}</p>
                              {assignment.description && (
                                <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[assignment.status]}`}>
                            <StatusIcon className="w-4 h-4 mr-1.5" />
                            {assignment.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">
                          {new Date(assignment.uploadedAt || assignment.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`/api/${assignment.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all text-sm"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </a>
                            
                            {assignment.status === 'Submitted' && (
                              <>
                                <button
                                  onClick={() => handleAccept(assignment._id,"accept")}
                                  disabled={processingId === assignment._id}
                                  className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleAccept(assignment._id,"rejected")}
                                  disabled={processingId === assignment._id}
                                  className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Decline
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
              <FileText className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-semibold mb-2">No assignments found</p>
              <p className="text-sm">
                {searchTerm || filterStatus !== "All"
                  ? "Try adjusting your search or filter criteria"
                  : "No student submissions yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}