import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, ChevronLeft, ChevronRight, GraduationCap, ArrowLeft, Eye, Edit } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    filterDepartments();
  }, [searchQuery, filterType, departments]);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/department`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('API Response:', res.data);
      
      // Transform backend data to match our component structure
      const deptData = res.data;
      
      if (Array.isArray(deptData)) {
        const transformedData = deptData.map((dept, index) => ({
          _id: dept._id || dept.id || index.toString(),
          name: dept.department || dept.name,
          type: dept.type || 'Not Specified',
          userCount: dept.total || dept.userCount || 0
        }));
        setDepartments(transformedData);
      } else {
        console.error('Unexpected response format:', res.data);
        setDepartments([]);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      
      if (err.response) {
        alert(err.response.data.message || 'Failed to fetch departments');
      } else if (err.request) {
        alert('Cannot connect to server. Please check if backend is running.');
      } else {
        alert('An error occurred while fetching departments.');
      }
      
      setDepartments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDepartments = () => {
    let filtered = departments;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(dept =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'All') {
      filtered = filtered.filter(dept => dept.type === filterType);
    }

    setFilteredDepartments(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/department`, {
          id: id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Department deleted successfully!');
        fetchDepartments();
      } catch (err) {
        console.error('Error deleting department:', err);
        alert('Failed to delete department');
      }
    }
  };

  // Get unique types for filter dropdown
  const uniqueTypes = ['All', ...new Set(departments.map(dept => dept.type))];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* High-Quality Background Image */}
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
      
      {/* Elegant gradient overlay matching the warm tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-orange-800/30 to-amber-800/20 z-10" />
      
      {/* Subtle animated orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-blob z-10" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-blob z-10" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-blob z-10" style={{ animationDelay: '4s' }} />
      
      {/* Main Content */}
      <div className="relative z-20 p-6 lg:p-8 min-h-screen backdrop-blur-xs">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center px-4 py-2.5 bg-white/90 backdrop-blur-sm text-orange-700 hover:text-orange-800 rounded-xl hover:bg-white transition-all duration-300 mb-4 group shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mr-5 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
                  All Departments
                </h1>
                <p className="text-white/90 mt-2 font-medium backdrop-blur-sm px-2 py-1 rounded-lg inline-block">
                  Manage and view all academic departments
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Search */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 ml-1">
                  <div className="flex items-center">
                    <Search className="w-4 h-4 mr-2 text-orange-600" />
                    Search Departments
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by department name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 placeholder-gray-500 text-gray-900 font-medium shadow-inner"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                </div>
              </div>

              {/* Filter */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 ml-1">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2 text-orange-600" />
                    Filter by Type
                  </div>
                </label>
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 text-gray-900 font-medium appearance-none shadow-inner cursor-pointer"
                  >
                    {uniqueTypes.map(type => (
                      <option key={type} value={type} className="bg-white text-gray-900">{type}</option>
                    ))}
                  </select>
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-amber-600 transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center text-sm">
                <div className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-lg backdrop-blur-sm border border-orange-200">
                  <span className="font-semibold text-orange-800">
                    {filteredDepartments.length} 
                  </span>
                  <span className="text-gray-700 ml-1">department{filteredDepartments.length !== 1 ? 's' : ''} found</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Page <span className="text-orange-600 font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                  <GraduationCap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-orange-600" />
                </div>
                <p className="mt-6 text-lg font-semibold text-gray-700">Loading departments...</p>
                <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  <GraduationCap className="w-12 h-12 text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-3">No departments found</p>
                <p className="text-gray-600 text-center max-w-md">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <button 
                  onClick={() => {setSearchQuery(''); setFilterType('All');}}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="bg-gradient-to-r from-orange-50/80 to-amber-50/80 backdrop-blur-sm border-b border-orange-200 px-8 py-6">
                  <div className="grid grid-cols-12 gap-4 font-bold text-gray-800 text-sm uppercase tracking-wider">
                    <div className="col-span-4 flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2 text-orange-600" />
                      Department Name
                    </div>
                    <div className="col-span-3">Type</div>
                    <div className="col-span-2">Users</div>
                    <div className="col-span-3 text-center">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-orange-100/50">
                  {currentItems.map((dept, index) => (
                    <div
                      key={dept._id}
                      className="px-8 py-6 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 transition-all duration-300 group animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                              <GraduationCap className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-lg">{dept.name}</p>
                              <p className="text-xs text-gray-500 mt-1">ID: {dept._id}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200 shadow-sm">
                            {dept.type}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl flex flex-col items-center justify-center">
                              <span className="text-2xl font-extrabold text-gray-900">{dept.userCount}</span>
                              <span className="text-xs text-gray-600 font-medium">users</span>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-3 flex items-center justify-center gap-3">
                          
                          <button
                            onClick={() => handleDelete(dept._id, dept.name)}
                            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-2 border-red-300 rounded-xl hover:from-red-100 hover:to-red-200 hover:border-red-400 hover:text-red-800 transition-all transform hover:-translate-y-1 hover:shadow-lg font-semibold group"
                          >
                            <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-gradient-to-r from-orange-50/80 to-amber-50/80 backdrop-blur-sm border-t border-orange-200 px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-700">
                        Showing <span className="font-bold text-orange-700">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredDepartments.length)}</span> of{' '}
                        <span className="font-bold text-orange-700">{filteredDepartments.length}</span> departments
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="flex items-center px-5 py-2.5 bg-white border-2 border-orange-200 text-orange-700 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-orange-200 font-semibold shadow-sm"
                        >
                          <ChevronLeft className="w-5 h-5 mr-2" />
                          Previous
                        </button>
                        
                        {/* Page Numbers */}
                        <div className="flex gap-2">
                          {[...Array(totalPages)].map((_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => paginate(i + 1)}
                              className={`w-12 h-12 rounded-xl font-bold transition-all shadow-sm ${
                                currentPage === i + 1
                                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg transform scale-105'
                                  : 'bg-white border-2 border-orange-200 text-gray-700 hover:bg-orange-50 hover:border-orange-300'
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="flex items-center px-5 py-2.5 bg-white border-2 border-orange-200 text-orange-700 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-orange-200 font-semibold shadow-sm"
                        >
                          Next
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 mb-6 animate-fade-in">
            <p className="text-white/80 text-sm font-medium drop-shadow-lg">
              <GraduationCap className="inline-block w-4 h-4 mr-2" />
              EduFlow Department Management System
            </p>
            <p className="text-white/60 text-xs mt-2">
              © 2025 All rights reserved. Powered by innovation.
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

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        .animate-slide-up {
          animation: slide-up 0.7s ease-out forwards;
        }

        .animate-blob {
          animation: blob 12s ease-in-out infinite;
        }

        .backdrop-blur-xs {
          backdrop-filter: blur(4px);
        }
        
        select {
          background-image: none !important;
        }
        
        select::-ms-expand {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default Departments;