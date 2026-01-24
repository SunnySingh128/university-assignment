
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './authrization/login';
import Signup from './authrization/signup';
import Admin from './adminpages/admin';
import Forgotpassword from './authrization/forgotpassword';
import Student from './dashboard/student';
import Professor from './dashboard/professor';
import HOD from './dashboard/hod';
import Admindepartment from './adminpages/department';
import Adminusers from './adminpages/user';
import Depart from "./adminpages/AddDepart";
import ViewAssign from "./dashboard/studentassignment";
import Edit from "./adminpages/edit";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role;

    if (!allowedRoles.includes(userRole)) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    localStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }
};
function App() {
  
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><Student /></ProtectedRoute>} />
        <Route path="/professor" element={<ProtectedRoute allowedRoles={['professor']}><Professor /></ProtectedRoute>} />
        <Route path="/hod" element={<ProtectedRoute allowedRoles={['hod']}><HOD /></ProtectedRoute>} />
        <Route path="/admin/department" element={<ProtectedRoute allowedRoles={['admin']}><Admindepartment /></ProtectedRoute>} />
        <Route path="/admin/user" element={<ProtectedRoute allowedRoles={['admin']}><Adminusers /></ProtectedRoute>} />
        <Route path="/AddDepartment" element={<ProtectedRoute allowedRoles={['admin']}><Depart /></ProtectedRoute>} />
        <Route path="/studentassignments" element={<ViewAssign />} />
        <Route path="/edit-user/:id" element={<ProtectedRoute allowedRoles={['admin']}><Edit /></ProtectedRoute>} />
      </Routes>
    </Router>
    </>
  )
}

export default App
