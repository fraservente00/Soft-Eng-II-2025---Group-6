import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const RoleGuard = ({ children, required }) => {
    const { role } = useRole();
    if (!role) return <Navigate to="/" replace />;
    if (role !== required) return "Access denied";
    return <>{children}</>;
};

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/customer" element={
            <RoleGuard required="customer">
                <CustomerDashboard />
            </RoleGuard>
        } />
        <Route path="/officer" element={
            <RoleGuard required="officer">
                <OfficerDashboard />
            </RoleGuard>
        } /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
