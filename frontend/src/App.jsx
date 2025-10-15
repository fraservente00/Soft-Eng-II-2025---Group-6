import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useRole from './hooks/useRole';

// Pages (implemented below)
import RoleSelectPage from './pages/RoleSelectPage';
import DeskSelectPage from './pages/DeskSelectPage';

// Temporary placeholder until Flavia's dashboard is ready
const OfficierDashboardPlaceholder = () => (
    <div style={{ padding: 24 }}>
        <h2>Dashboard</h2>
        <p>You are in <b>officier</b> mode. The final dashboard will be mounted here.</p>
    </div>
);

// Guard that requires a role (and optionally a specific one)
const RoleGuard = ({ children, required }) => {
    const { role } = useRole();

    // If no role at all, force the role selection step
    if (!role) return <Navigate to="/role" replace />;

    // If a specific role is required, enforce it
    if (required && role !== required) return <Navigate to="/role" replace />;

    return <>{children}</>;
};

// Guard that requires "officier" role AND a selected desk in localStorage
const OfficierDeskGuard = ({ children }) => {
    const { role } = useRole();
    const selectedDesk = (() => {
        try { return JSON.parse(localStorage.getItem('selectedDesk') || 'null'); }
        catch { return null; }
    })();

    if (role !== 'officier') return <Navigate to="/role" replace />;
    if (!selectedDesk) return <Navigate to="/desk" replace />;

    return <>{children}</>;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Always start from the role selection page */}
                <Route path="/" element={<Navigate to="/role" replace />} />

                {/* 1) Role selection */}
                <Route path="/role" element={<RoleSelectPage />} />

                {/* 2) Desk selection — only allowed for officier */}
                <Route
                    path="/desk"
                    element={
                        <RoleGuard required="officier">
                            <DeskSelectPage />
                        </RoleGuard>
                    }
                />

                {/* 3) Dashboard (Flavia) — requires officier + selected desk */}
                <Route
                    path="/dashboard"
                    element={
                        <OfficierDeskGuard>
                            <OfficierDashboardPlaceholder />
                            {/* Replace with the real dashboard when available */}
                            {/* <OfficerDashboard /> */}
                        </OfficierDeskGuard>
                    }
                />

                {/* Customer: once Era ships the ticket selection page, route here */}
                <Route path="/customer" element={<Navigate to="/customer/tickets" replace />} />
                {/* Optional temporary placeholder to avoid 404:
        <Route path="/customer/tickets" element={<div style={{padding:24}}>Customer ticket selection (by Era)</div>} />
        */}

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/role" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
