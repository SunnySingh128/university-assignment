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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/user`, {
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
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/user1`, {
          headers: { Authorization: `Bearer ${token}` },
          email:email,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 lg:p-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-700"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          <div className="flex items-center mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">All Users</h1>
          </div>
          <p className="text-gray-600 ml-16">Manage all system users</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Role
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none appearance-none bg-white cursor-pointer"
                >
                  {uniqueRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Department
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none appearance-none bg-white cursor-pointer"
                >
                  {uniqueDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {currentItems.length} of {filteredUsers.length} users
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <UsersIcon className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <div className="grid grid-cols-12 gap-4 font-semibold text-gray-700 text-sm">
                  <div className="col-span-2">Name</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-2">Department</div>
                  <div className="col-span-3 text-center">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {currentItems.map((user, index) => (
                 
                  <div
                    key={user._id || user.id}
                    className="px-6 py-4 hover:bg-blue-50 transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2">
                        <p className="font-medium text-gray-900">{user.name}</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-gray-700 text-sm">{user.email}</p>
                      </div>
                      <div className="col-span-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          user.role === 'Student' ? 'bg-green-100 text-green-800' :
                          user.role === 'Professor' ? 'bg-orange-100 text-orange-800' :
                          user.role === 'HOD' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-700">{user.department}</p>
                      </div>
                      <div className="col-span-3 flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(user._id || user.id)}
                          className="flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.email)}
                          className="flex items-center px-4 py-2 bg-white text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-all transform hover:-translate-y-0.5"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all ${
                              currentPage === i + 1
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }

        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </div>
  );
}

export default Users;