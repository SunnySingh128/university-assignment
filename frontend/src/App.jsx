
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
function App() {
  
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="/student" element={<Student />} />
        <Route path="/professor" element={<Professor />} />
        <Route path="/hod" element={<HOD />} />
        <Route path="/admin/department" element={<Admindepartment />} />
        <Route path="/admin/user" element={<Adminusers />} />
        <Route path="/AddDepartment" element={<Depart />} />
        <Route path="/studentassignments" element={<ViewAssign />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
