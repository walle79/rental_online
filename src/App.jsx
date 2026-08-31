import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { 
  LayoutDashboard, Users, ReceiptText, 
  BarChart3, Plus, Search, UserPlus, UserCircle, Headset
} from 'lucide-react';
import KaitoTenants from './pages/KaitoTenants';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Dashboard from './pages/Dashboard';
import Support from './pages/Support';
import MemberDashboard from './pages/MemberDashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Landing, { BRANCHES } from './pages/Landing';
import TenantModal from './components/TenantModal';
import SupportModal from './components/SupportModal';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
      contentArea.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

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
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kaito_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedBranch, setSelectedBranch] = useState(() => {
    return localStorage.getItem('kaito_selected_branch') || null;
  });
  const [tenants, setTenants] = useState([]);
  const [bills, setBills] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const currentBranchId = selectedBranch || 'bnb1';
  const currentBranchObj = BRANCHES.find(b => b.id === currentBranchId) || BRANCHES[0];
  const isCurrentActive = currentBranchObj.status === 'active';

  // Branch-specific data filtering (legacy records without branchId default to 'bnb1')
  const branchTenants = isCurrentActive 
    ? tenants.filter(t => (t.branchId || 'bnb1') === currentBranchId)
    : tenants.filter(t => t.branchId === currentBranchId);

  const branchBills = isCurrentActive 
    ? bills.filter(b => (b.branchId || 'bnb1') === currentBranchId)
    : bills.filter(b => b.branchId === currentBranchId);

  const branchSupportRequests = isCurrentActive 
    ? supportRequests.filter(s => (s.branchId || 'bnb1') === currentBranchId)
    : supportRequests.filter(s => s.branchId === currentBranchId);

  const handleUpdateSupportRequest = async (requestId, updatedData) => {
    try {
      await updateDoc(doc(db, 'support_requests', requestId.toString()), updatedData);
    } catch(err) { console.error('Error updating support request:', err); }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('kaito_user', JSON.stringify(userData));
    // Reset branch selection on fresh login to display landing page first
    setSelectedBranch(null);
    localStorage.removeItem('kaito_selected_branch');
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedBranch(null);
    localStorage.removeItem('kaito_user');
    localStorage.removeItem('kaito_selected_branch');
    navigate('/');
  };

  const handleSelectBranch = (branchId) => {
    setSelectedBranch(branchId);
    localStorage.setItem('kaito_selected_branch', branchId);
    navigate('/');
  };

  const handleBackToLanding = () => {
    setSelectedBranch(null);
    localStorage.removeItem('kaito_selected_branch');
    navigate('/');
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

    const unsubSupport = onSnapshot(collection(db, 'support_requests'), (snapshot) => {
      const supportData = [];
      snapshot.forEach(doc => supportData.push({ id: doc.id, ...doc.data() }));
      supportData.sort((a, b) => b.id - a.id);
      setSupportRequests(supportData);
    });

    return () => {
      unsubTenants();
      unsubBills();
      unsubSupport();
    };
  }, []);

  const handleAddTenant = async (tenant) => {
    try { 
      const newTenant = { ...tenant, branchId: currentBranchId };
      await setDoc(doc(db, 'tenants', tenant.id.toString()), newTenant); 
    } catch(err) { console.error('Error adding tenant:', err); }
  };

  const handleRemoveTenant = async (tenantId) => {
    try { await deleteDoc(doc(db, 'tenants', tenantId.toString())); } catch(err) { console.error('Error removing tenant:', err); }
  };

  const handleUpdateTenant = async (tenantId, updatedData) => {
    try { await updateDoc(doc(db, 'tenants', tenantId.toString()), updatedData); } catch(err) { console.error('Error updating tenant:', err); }
  };

  const handleAddBill = async (bill) => {
    try { 
      const newBill = { ...bill, branchId: currentBranchId };
      await setDoc(doc(db, 'bills', bill.id.toString()), newBill); 
    } catch(err) { console.error('Error adding bill:', err); }
  };

  const handleUpdateBill = async (billId, updatedData) => {
    try { await updateDoc(doc(db, 'bills', billId.toString()), updatedData); } catch(err) { console.error('Error updating bill:', err); }
  };

  const handleAddSupportRequest = async (request) => {
    try { 
      const newRequest = { ...request, branchId: currentBranchId };
      await setDoc(doc(db, 'support_requests', request.id.toString()), newRequest); 
    } catch(err) { console.error('Error adding support request:', err); }
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

  // If user is admin and hasn't picked a facility, show Landing page
  if (user.role === 'admin' && !selectedBranch) {
    return (
      <div className="app-shell">
        <div className="iphone-frame">
          <main className="content-area">
            <Landing 
              user={user} 
              onSelectBranch={handleSelectBranch} 
              onLogout={handleLogout} 
              tenants={branchTenants} 
            />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="iphone-frame">
        <main className="content-area">
          <Routes>
            {user.role === 'admin' ? (
              <>
                <Route 
                  path="/" 
                  element={
                    <Dashboard 
                      tenants={branchTenants} 
                      bills={branchBills} 
                      supportRequests={branchSupportRequests} 
                      currentBranch={currentBranchId}
                      onSwitchBranch={handleSelectBranch}
                      onBackToLanding={handleBackToLanding}
                    />
                  } 
                />
                <Route path="/support" element={<Support user={user} tenants={branchTenants} supportRequests={branchSupportRequests} onUpdateStatus={handleUpdateSupportRequest} onAddRequest={handleAddSupportRequest} onOpenSupportModal={() => setIsSupportModalOpen(true)} />} />
                <Route path="/tenants" element={<KaitoTenants tenants={branchTenants} onAddTenant={() => { if (!isCurrentActive) { alert(`Cơ sở ${currentBranchObj.name} chưa đi vào hoạt động, không thể thêm khách!`); return; } setIsModalOpen(true); }} onRemoveTenant={handleRemoveTenant} onUpdateTenant={handleUpdateTenant} />} />
                <Route path="/billing" element={<Billing tenants={branchTenants} bills={branchBills} onAddBill={handleAddBill} onUpdateBill={handleUpdateBill} />} />
                <Route path="/reports" element={<Reports bills={branchBills} currentBranch={currentBranchId} />} />
                <Route path="/profile" element={<Profile user={user} onLogout={handleLogout} tenants={tenants} bills={bills} onRestoreData={handleRestoreData} currentBranch={currentBranchId} onBackToLanding={handleBackToLanding} />} />
              </>
            ) : (
              <>
                <Route path="/" element={<MemberDashboard user={user} tenants={tenants} bills={bills} supportRequests={supportRequests} />} />
                <Route path="/support" element={<Support user={user} tenants={tenants} supportRequests={supportRequests} onAddRequest={handleAddSupportRequest} onOpenSupportModal={() => setIsSupportModalOpen(true)} />} />
                <Route path="/profile" element={<Profile user={user} onLogout={handleLogout} tenants={tenants} bills={bills} onRestoreData={handleRestoreData} currentBranch={currentBranchId} onBackToLanding={handleBackToLanding} />} />
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
                <button 
                  className="add-btn" 
                  onClick={() => {
                    if (!isCurrentActive) {
                      alert(`Cơ sở ${currentBranchObj.name} chưa đi vào hoạt động, không thể thêm khách thuê!`);
                      return;
                    }
                    setIsModalOpen(true);
                  }}
                  title={!isCurrentActive ? 'Cơ sở chưa hoạt động' : 'Thêm khách thuê'}
                >
                  <Plus size={32} />
                </button>
              </div>
              <NavItem to="/billing" icon={ReceiptText} label="Hóa đơn" />
              <NavItem to="/reports" icon={BarChart3} label="Thống kê" />
            </>
          ) : (
            <>
              <NavItem to="/support" icon={Headset} label="Hỗ trợ" />
            </>
          )}
        </nav>

        <TenantModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleAddTenant} 
        />

        <SupportModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
          onSave={handleAddSupportRequest}
          user={user}
          tenants={tenants}
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
