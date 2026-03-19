import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ReceiptText, 
  BarChart3, Plus, Search, UserPlus, UserCircle, Bell
} from 'lucide-react';
import KaitoTenants from './pages/KaitoTenants';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import MemberDashboard from './pages/MemberDashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import TenantModal from './components/TenantModal';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
      contentArea.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

// Dashboard previously defined here - now external

const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`}>
      {isActive && <div className="nav-glow" />}
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </Link>
  );
};

const AppContent = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kaito_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [tenants, setTenants] = useState(() => {
    const saved = localStorage.getItem('kaito_tenants');
    return saved ? JSON.parse(saved) : [];
  });
  const [bills, setBills] = useState(() => {
    const saved = localStorage.getItem('kaito_bills');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Hóa đơn tháng 3', message: 'Hệ thống đã tự động tạo hóa đơn cho phòng 201.', time: '10 phút trước', type: 'info', isRead: false },
    { id: 2, title: 'Báo cáo doanh thu', message: 'Doanh thu tháng này tăng 15% so với tháng trước.', time: '2 giờ trước', type: 'success', isRead: false },
    { id: 3, title: 'Cảnh báo thiết bị', message: 'Đồng hồ điện phòng 104 có dấu hiệu bất thường.', time: '1 ngày trước', type: 'warning', isRead: true }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMarkNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('kaito_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kaito_user');
  };

  useEffect(() => {
    localStorage.setItem('kaito_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('kaito_bills', JSON.stringify(bills));
  }, [bills]);

  const handleAddTenant = (tenant) => {
    setTenants([...tenants, tenant]);
  };

  const handleRemoveTenant = (tenantId) => {
    setTenants(prev => prev.filter(t => t.id !== tenantId));
  };

  const handleRestoreData = (newTenants, newBills) => {
    setTenants(newTenants);
    setBills(newBills);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <div className="iphone-frame">
        <main className="content-area">
          <Routes>
            {user.role === 'admin' ? (
              <>
                <Route path="/" element={<Dashboard tenants={tenants} bills={bills} notifications={notifications} />} />
                <Route path="/notifications" element={<Notifications notifications={notifications} onMarkAllAsRead={handleMarkNotificationsRead} />} />
                <Route path="/tenants" element={<KaitoTenants tenants={tenants} onAddTenant={() => setIsModalOpen(true)} onRemoveTenant={handleRemoveTenant} />} />
                <Route path="/billing" element={<Billing tenants={tenants} bills={bills} setBills={setBills} />} />
                <Route path="/reports" element={<Reports bills={bills} />} />
                <Route path="/profile" element={<Profile user={user} onLogout={handleLogout} tenants={tenants} bills={bills} onRestoreData={handleRestoreData} />} />
              </>
            ) : (
              <>
                <Route path="/" element={<MemberDashboard user={user} tenants={tenants} bills={bills} notifications={notifications} />} />
                <Route path="/notifications" element={<Notifications notifications={notifications} onMarkAllAsRead={handleMarkNotificationsRead} />} />
                <Route path="/profile" element={<Profile user={user} onLogout={handleLogout} tenants={tenants} bills={bills} onRestoreData={handleRestoreData} />} />
              </>
            )}
          </Routes>
        </main>

        <nav className="bottom-nav">
          <NavItem to="/" icon={LayoutDashboard} label="Trang chủ" />
          
          {user.role === 'admin' ? (
            <>
              <NavItem to="/tenants" icon={Users} label="Khách thuê" />
              <div className="add-btn-container">
                <button className="add-btn" onClick={() => setIsModalOpen(true)}>
                  <Plus size={32} />
                </button>
              </div>
              <NavItem to="/billing" icon={ReceiptText} label="Hóa đơn" />
              <NavItem to="/reports" icon={BarChart3} label="Thống kê" />
            </>
          ) : (
            <>
              <NavItem to="/notifications" icon={Bell} label="Tin nhắn" />
            </>
          )}
        </nav>

        <TenantModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleAddTenant} 
        />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
