//import "./App.css";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import useRole from "./hooks/useRole";
import OfficerDashboard from "./pages/OfficerDashboard";

const RoleGuard = ({ children, required }) => {
  const { role } = useRole();
  if (!role) return <Navigate to="/" replace />;
  if (role !== required) return "Access denied";
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/customer" element={
            <RoleGuard required="customer">
                <CustomerDashboard />
            </RoleGuard>
        } />*/}
          <Route
            path="/officer"
            element={
              //<RoleGuard required="officer">
              <OfficerDashboard />
              //</RoleGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
