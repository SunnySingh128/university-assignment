import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, ChevronLeft, ChevronRight, Users as UsersIcon, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All Roles');
  const [filterDepartment, setFilterDepartment] = useState('All Departments');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterRole, filterDepartment, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}admin/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('API Response:', res.data);
      
      // Handle array response and transform data
      const userData = res.data;
      
      if (Array.isArray(userData)) {
        // Transform backend data to match component structure
        const transformedData = userData.map((user, index) => ({
          _id: user._id,
          name: user.fullName,
          email: user.email,
          role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown',
          department: user.department
        }));
        setUsers(transformedData);
      } else {
        console.error('Unexpected response format:', res.data);
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      
      if (err.response) {
        alert(err.response.data.message || 'Failed to fetch users');
      } else if (err.request) {
        alert('Cannot connect to server. Please check if backend is running.');
      } else {
        alert('An error occurred while fetching users.');
      }
      
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter (name or email)
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== 'All Roles') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Department filter
    if (filterDepartment !== 'All Departments') {
      filtered = filtered.filter(user => user.department === filterDepartment);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (email) => {
    if (window.confirm(`Are you sure you want to delete ${email}?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/user1`, {
          headers: { Authorization: `Bearer ${token}` },
          email: email,
        });
        alert('User deleted successfully!');
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user');
      }
    }
  };

  const handleEdit = (id) => {
    console.log(id);
    navigate(`/edit-user/${id}`);
  };

  // Get unique roles and departments for filters
  const uniqueRoles = ['All Roles', ...new Set(users.map(user => user.role).filter(Boolean))];
  const uniqueDepartments = ['All Departments', ...new Set(users.map(user => user.department).filter(Boolean))];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* High-Quality Background Image - Same as Departments page */}
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
      
      {/* Elegant gradient overlay - Same warm tones as Departments page */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-orange-800/30 to-amber-800/20 z-10" />
      
      {/* Subtle animated orbs - Same as Departments page */}
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
                <UsersIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
                  All Users
                </h1>
                <p className="text-white/90 mt-2 font-medium backdrop-blur-sm px-2 py-1 rounded-lg inline-block">
                  Manage all system users and permissions
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 ml-1">
                  <div className="flex items-center">
                    <Search className="w-4 h-4 mr-2 text-orange-600" />
                    Search Users
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 placeholder-gray-500 text-gray-900 font-medium shadow-inner"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                </div>
              </div>

              {/* Role Filter */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 ml-1">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2 text-orange-600" />
                    Filter by Role
                  </div>
                </label>
                <div className="relative">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 text-gray-900 font-medium appearance-none shadow-inner cursor-pointer"
                  >
                    {uniqueRoles.map(role => (
                      <option key={role} value={role} className="bg-white text-gray-900">{role}</option>
                    ))}
                  </select>
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-amber-600 transform rotate-45"></div>
                  </div>
                </div>
              </div>

              {/* Department Filter */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-3 ml-1">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2 text-orange-600" />
                    Filter by Department
                  </div>
                </label>
                <div className="relative">
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 bg-gradient-to-br from-amber-50/80 to-orange-50/80 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 text-gray-900 font-medium appearance-none shadow-inner cursor-pointer"
                  >
                    {uniqueDepartments.map(dept => (
                      <option key={dept} value={dept} className="bg-white text-gray-900">{dept}</option>
                    ))}
                  </select>
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-amber-600 transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Count - Improved alignment */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center text-sm">
                <div className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-lg backdrop-blur-sm border border-orange-200">
                  <span className="font-semibold text-orange-800">
                    {filteredUsers.length} 
                  </span>
                  <span className="text-gray-700 ml-1">user{filteredUsers.length !== 1 ? 's' : ''} found</span>
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
                  <UsersIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-orange-600" />
                </div>
                <p className="mt-6 text-lg font-semibold text-gray-700 text-center">Loading users...</p>
                <p className="text-sm text-gray-500 mt-2 text-center">Please wait a moment</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  <UsersIcon className="w-12 h-12 text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-3 text-center">No users found</p>
                <p className="text-gray-600 text-center max-w-md">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button 
                  onClick={() => {setSearchQuery(''); setFilterRole('All Roles'); setFilterDepartment('All Departments');}}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Table Header - Improved alignment */}
                <div className="bg-gradient-to-r from-orange-50/80 to-amber-50/80 backdrop-blur-sm border-b border-orange-200 px-8 py-6">
                  <div className="grid grid-cols-12 gap-4 font-bold text-gray-800 text-sm uppercase tracking-wider">
                    <div className="col-span-2 flex items-center">
                      <UsersIcon className="w-4 h-4 mr-2 text-orange-600" />
                      <span>Name</span>
                    </div>
                    <div className="col-span-3 flex items-center">
                      <span>Email</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span>Role</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span>Department</span>
                    </div>
                    <div className="col-span-3 text-center">
                      <span>Actions</span>
                    </div>
                  </div>
                </div>

                {/* Table Body - Improved alignment */}
                <div className="divide-y divide-orange-100/50">
                  {currentItems.map((user, index) => (
                    <div
                      key={user._id || user.id}
                      className="px-8 py-6 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 transition-all duration-300 group animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                              <UsersIcon className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-lg leading-tight">{user.name}</p>

                            </div>
                          </div>
                        </div>
                        <div className="col-span-3 flex items-center">
                          <p className="text-gray-700 font-medium text-sm bg-gradient-to-r from-amber-50/50 to-orange-50/50 px-3 py-2 rounded-lg border border-amber-100 w-full">
                            {user.email}
                          </p>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold ${
                            user.role === 'Student' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' :
                            user.role === 'Professor' ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200' :
                            user.role === 'HOD' ? 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-200' :
                            'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <p className="text-gray-700 font-medium text-center w-full">
                            {user.department}
                          </p>
                        </div>
                        <div className="col-span-3 flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEdit(user._id)}
                            className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold group min-w-[100px]"
                          >
                            <Edit className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.email)}
                            className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-2 border-red-300 rounded-xl hover:from-red-100 hover:to-red-200 hover:border-red-400 hover:text-red-800 transition-all transform hover:-translate-y-1 hover:shadow-lg font-semibold group min-w-[100px]"
                          >
                            <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination - Improved alignment */}
                {totalPages > 1 && (
                  <div className="bg-gradient-to-r from-orange-50/80 to-amber-50/80 backdrop-blur-sm border-t border-orange-200 px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-700">
                        Showing <span className="font-bold text-orange-700">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)}</span> of{' '}
                        <span className="font-bold text-orange-700">{filteredUsers.length}</span> users
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
                              className={`w-12 h-12 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center ${
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

          {/* Footer - Same as Departments page */}
          <div className="text-center mt-8 mb-6 animate-fade-in">
            <p className="text-white/80 text-sm font-medium drop-shadow-lg">
              <UsersIcon className="inline-block w-4 h-4 mr-2" />
              EduFlow User Management System
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

export default Users;