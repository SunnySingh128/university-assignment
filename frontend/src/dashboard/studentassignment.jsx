import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Clock, Eye, Search, Filter, GraduationCap, ArrowLeft, User } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

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

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [searchTerm, filterStatus, assignments]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/student/student-assignment', {
        params: { email: email }
      });
      console.log

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

  const statusColors = {
    Draft: "bg-gray-100 text-gray-800 border-gray-300",
    Submitted: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Approved: "bg-green-100 text-green-800 border-green-300",
    Rejected: "bg-red-100 text-red-800 border-red-300",
  };

  const statusIcons = {
    Draft: FileText,
    Submitted: Clock,
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
    Submitted: assignments.length,
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
          <button
            onClick={() => navigate('/', { state: { email, password } })}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6 transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">All Assignments</h1>
                <p className="text-gray-600 mt-1">View and manage all your assignment submissions</p>
              </div>
            </div>

            {/* User Email Badge */}
            {email && (
              <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{email}</span>
              </div>
            )}
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
                  placeholder="Search by title..."
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
                  <option value="accepted">Approved ({statusCounts.accepted})</option>
                  <option value="rejected">Rejected ({statusCounts.rejected})</option>
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
                    <th className="text-left p-4 font-semibold text-gray-700">Assignment</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Submitted Date</th>
                    <th className="text-right p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment, index) => {
                    const StatusIcon = getStatusIcon(assignment.status);
                    return (
                      <tr key={index} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mr-3 mt-1">
                              <FileText className="w-5 h-5 text-gray-400" />
                            </div>
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
                          {new Date(assignment.uploadedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="p-4 text-right">
                          <a
                          href={`/api/${assignment.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </a>
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
              <p className="text-lg font-semibold mb-2">
                {searchTerm || filterStatus !== "All" ? "No assignments found" : "No assignments yet"}
              </p>
              <p className="text-sm mb-4">
                {searchTerm || filterStatus !== "All"
                  ? "Try adjusting your search or filter criteria"
                  : "Upload your first assignment to get started!"}
              </p>
              {(searchTerm || filterStatus !== "All") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("All");
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {!loading && assignments.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <p className="text-3xl font-bold text-blue-600">{statusCounts.All}</p>
                <p className="text-sm text-gray-600 mt-1">Total</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-gray-600">{statusCounts.Draft}</p>
                <p className="text-sm text-gray-600 mt-1">Draft</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <p className="text-3xl font-bold text-yellow-600">{statusCounts.Submitted}</p>
                <p className="text-sm text-gray-600 mt-1">Submitted</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-3xl font-bold text-green-600">{statusCounts.Approved}</p>
                <p className="text-sm text-gray-600 mt-1">Approved</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <p className="text-3xl font-bold text-red-600">{statusCounts.Rejected}</p>
                <p className="text-sm text-gray-600 mt-1">Rejected</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}