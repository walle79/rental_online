import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
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
  const [tenants, setTenants] = useState([]);
  const [bills, setBills] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMarkNotificationsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.isRead);
      for (const n of unreadNotifs) {
        await updateDoc(doc(db, 'notifications', n.id.toString()), { isRead: true });
      }
    } catch(err) { console.error('Error updating notifications:', err); }
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
    const unsubTenants = onSnapshot(collection(db, 'tenants'), (snapshot) => {
      const tenantsData = [];
      snapshot.forEach(doc => tenantsData.push({ id: doc.id, ...doc.data() }));
      setTenants(tenantsData);
    });

    const unsubBills = onSnapshot(collection(db, 'bills'), (snapshot) => {
      const billsData = [];
      snapshot.forEach(doc => billsData.push({ id: doc.id, ...doc.data() }));
      billsData.sort((a, b) => b.id - a.id);
      setBills(billsData);
    });

    const unsubNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const notifsData = [];
      snapshot.forEach(doc => notifsData.push({ id: doc.id, ...doc.data() }));
      notifsData.sort((a, b) => b.id - a.id);
      setNotifications(notifsData);
    });

    return () => {
      unsubTenants();
      unsubBills();
      unsubNotifications();
    };
  }, []);

  const handleAddTenant = async (tenant) => {
    try { await setDoc(doc(db, 'tenants', tenant.id.toString()), tenant); } catch(err) { console.error('Error adding tenant:', err); }
  };

  const handleRemoveTenant = async (tenantId) => {
    try { await deleteDoc(doc(db, 'tenants', tenantId.toString())); } catch(err) { console.error('Error removing tenant:', err); }
  };

  const handleUpdateTenant = async (tenantId, updatedData) => {
    try { await updateDoc(doc(db, 'tenants', tenantId.toString()), updatedData); } catch(err) { console.error('Error updating tenant:', err); }
  };

  const handleAddBill = async (bill) => {
    try { await setDoc(doc(db, 'bills', bill.id.toString()), bill); } catch(err) { console.error('Error adding bill:', err); }
  };

  const handleUpdateBill = async (billId, updatedData) => {
    try { await updateDoc(doc(db, 'bills', billId.toString()), updatedData); } catch(err) { console.error('Error updating bill:', err); }
  };

  const handleRestoreData = async (newTenants, newBills) => {
    if (window.confirm('Khôi phục sẽ ghi đè dữ liệu trên Database. Tiếp tục?')) {
      try {
        for (const t of newTenants) { await setDoc(doc(db, 'tenants', t.id.toString()), t); }
        for (const b of newBills) { await setDoc(doc(db, 'bills', b.id.toString()), b); }
        alert('Phục hồi dữ liệu lên Firebase thành công!');
      } catch (err) {
        console.error(err);
        alert('Lỗi khi tải dữ liệu lên Database!');
      }
    }
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
                <Route path="/tenants" element={<KaitoTenants tenants={tenants} onAddTenant={() => setIsModalOpen(true)} onRemoveTenant={handleRemoveTenant} onUpdateTenant={handleUpdateTenant} />} />
                <Route path="/billing" element={<Billing tenants={tenants} bills={bills} onAddBill={handleAddBill} onUpdateBill={handleUpdateBill} />} />
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
