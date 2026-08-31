import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, User, MapPin, Clock, Headset, UserCircle, Building2, Calendar, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import { BRANCHES } from './Landing';

const Dashboard = ({ tenants = [], bills = [], supportRequests = [], currentBranch = 'bnb1', onSwitchBranch, onBackToLanding }) => {
  const navigate = useNavigate();
  const unresolvedCount = supportRequests.filter(r => r.status !== 'resolved').length;
  
  const branchInfo = useMemo(() => {
    return BRANCHES.find(b => b.id === currentBranch) || BRANCHES[0];
  }, [currentBranch]);

  const isActive = branchInfo.status === 'active';
  const TOTAL_ROOMS = branchInfo.totalRooms || 18;
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${d}/${m}/${y} ${h}:${min}`;
  };

  // Dynamic floors based on total rooms
  const floors = useMemo(() => {
    if (branchInfo.id === 'bnb1') {
      return [
        { id: 1, label: 'Tầng 1', rooms: ['101', '102', '103', '104', '105', '106'] },
        { id: 2, label: 'Tầng 2', rooms: ['201', '202', '203', '204', '205', '206'] },
        { id: 3, label: 'Tầng 3', rooms: ['301', '302', '303', '304', '305', '306'] }
      ];
    }
    if (branchInfo.id === 'tnd2') {
      return [
        { id: 1, label: 'Tầng 1 (Dự kiến)', rooms: ['101', '102', '103', '104', '105'] },
        { id: 2, label: 'Tầng 2 (Dự kiến)', rooms: ['201', '202', '203', '204', '205'] },
        { id: 3, label: 'Tầng 3 (Dự kiến)', rooms: ['301', '302', '303', '304', '305'] }
      ];
    }
    // TBD 3-6 (20 rooms across 4 floors)
    return [
      { id: 1, label: 'Tầng 1 (Quy hoạch)', rooms: ['101', '102', '103', '104', '105'] },
      { id: 2, label: 'Tầng 2 (Quy hoạch)', rooms: ['201', '202', '203', '204', '205'] },
      { id: 3, label: 'Tầng 3 (Quy hoạch)', rooms: ['301', '302', '303', '304', '305'] },
      { id: 4, label: 'Tầng 4 (Quy hoạch)', rooms: ['401', '402', '403', '404', '405'] }
    ];
  }, [branchInfo]);

  // Room Status Data
  const occupiedRoomsCount = useMemo(() => {
    if (!isActive) return 0;
    return new Set(tenants.map(t => t.room)).size;
  }, [tenants, isActive]);

  // Revenue Status Data
  const revenueData = useMemo(() => {
    if (!isActive) return [{ name: 'Đã thu', value: 0 }, { name: 'Chưa thu', value: 0 }];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthBills = bills.filter(b => b.month === currentMonth && b.year === currentYear);

    const paid = monthBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.total, 0);
    const pending = monthBills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.total, 0);

    return [
      { name: 'Đã thu', value: paid },
      { name: 'Chưa thu', value: pending }
    ];
  }, [bills, isActive]);

  const totalRevenue = revenueData.find(d => d.name === 'Đã thu')?.value || 0;
  const pendingRevenue = revenueData.find(d => d.name === 'Chưa thu')?.value || 0;

  const handleRoomClick = (roomNumber) => {
    if (!isActive) return;
    const tenant = tenants.find(t => t.room === roomNumber);
    if (tenant) {
      navigate(`/tenants?room=${roomNumber}`);
    }
  };

  return (
    <div className="animate-slide-up pb-10 relative">
      <div className="flex-between items-center mb-6">
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-1">
            {branchInfo.code} • {branchInfo.name}
          </span>
          <h1 className="text-3xl font-black text-gradient">
            {isActive ? 'Tổng quan' : branchInfo.code}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/profile')}
            className="w-12 h-12 rounded-2xl bg-white-5 border-white-10 flex items-center justify-center text-primary shadow-black-40 active:scale-90 transition-all"
            title="Cá nhân"
          >
            <UserCircle size={24} />
          </button>
          <button
            onClick={() => navigate('/support')}
            className="w-12 h-12 rounded-2xl bg-white-5 border-white-10 flex items-center justify-center text-primary relative shadow-black-40 active:scale-90 transition-all"
            title="Hỗ trợ"
          >
            <Headset size={24} />
            {unresolvedCount > 0 && <span className="notification-badge">{unresolvedCount}</span>}
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end py-2 mb-4 space-y-0.5">
        <div className="text-[10px] font-bold text-white uppercase tracking-[0.2em] whitespace-nowrap opacity-60">
          Huế, {formatDateTime(currentTime)}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-white whitespace-nowrap">
          <MapPin size={10} className="text-primary" />
          <span>{branchInfo.address}</span>
        </div>
      </div>

      {/* Inactive / TBD Banner */}
      {!isActive && (
        <div 
          className="glass-card mb-6 p-5 relative overflow-hidden" 
          style={{ 
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
            border: branchInfo.status === 'not_started' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)'
          }}
        >
          <div className="flex items-start gap-3.5 mb-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: branchInfo.status === 'not_started' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                color: branchInfo.status === 'not_started' ? '#f59e0b' : '#94a3b8',
                border: branchInfo.status === 'not_started' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)'
              }}
            >
              {branchInfo.status === 'not_started' ? <Clock size={24} /> : <Lock size={22} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-base font-black text-white">{branchInfo.fullName}</h2>
                <span 
                  className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                  style={{
                    background: branchInfo.status === 'not_started' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.15)',
                    color: branchInfo.status === 'not_started' ? '#f59e0b' : '#94a3b8',
                    border: branchInfo.status === 'not_started' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)'
                  }}
                >
                  {branchInfo.estDate}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {branchInfo.description} Cơ sở chưa đi vào hoạt động chính thức. Các tính năng thêm khách thuê, lập hóa đơn đang tạm khóa.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
            {onSwitchBranch && (
              <button
                type="button"
                onClick={() => onSwitchBranch('bnb1')}
                className="w-full py-3 px-4 rounded-xl flex items-center justify-between text-xs font-black text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  boxShadow: '0 4px 15px rgba(249, 115, 22, 0.35)'
                }}
              >
                <span>Chuyển sang Cơ sở 1: BNB (Đang hoạt động)</span>
                <ArrowRight size={14} />
              </button>
            )}

            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <ArrowLeft size={14} />
                <span>Quay lại danh sách 6 cơ sở</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {/* Revenue Card */}
        <div className="glass-card revenue-card !mb-0">
          <div className="flex-between mb-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">
              Doanh thu tháng {new Date().getMonth() + 1}
            </h3>
            <span className="text-xl font-black" style={{ color: isActive ? '#22c55e' : '#94a3b8' }}>
              {isActive ? `${totalRevenue.toLocaleString()}đ` : '0đ'}
            </span>
          </div>
          {isActive && pendingRevenue > 0 && (
            <div className="flex-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted opacity-70">Chờ thu</span>
              <span className="text-[12px] font-bold" style={{ color: '#f59e0b' }}>+{pendingRevenue.toLocaleString()}đ</span>
            </div>
          )}
          {!isActive && (
            <span className="text-[10px] text-muted opacity-75 font-semibold">Chưa phát sinh doanh thu</span>
          )}
        </div>

        {/* Interactive Room Map */}
        <div className="glass-card">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
            Sơ đồ phòng ({TOTAL_ROOMS} phòng {!isActive ? 'dự kiến' : ''})
          </h3>
          <div className="flex gap-6 mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-success">
              Đang thuê ({occupiedRoomsCount})
            </h3>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted">
              {!isActive ? `Chưa bàn giao (${TOTAL_ROOMS})` : `Trống (${TOTAL_ROOMS - occupiedRoomsCount})`}
            </h3>
          </div>
          <div className="space-y-8">
            {floors.map(floor => (
              <div key={floor.id}>
                <p className="glass-label text-[10px] uppercase mb-4">{floor.label}</p>
                <div className="room-grid">
                  {floor.rooms.map(roomNum => {
                    const tenant = isActive ? tenants.find(t => t.room === roomNum) : null;
                    const isOccupied = !!tenant;
                    return (
                      <button
                        key={roomNum}
                        onClick={() => handleRoomClick(roomNum)}
                        disabled={!isActive}
                        className={`room-btn ${isOccupied ? 'active' : ''}`}
                        style={!isActive ? { opacity: 0.35, cursor: 'not-allowed' } : {}}
                      >
                        <span className="room-label">{roomNum}</span>
                        {isOccupied ? <User size={10} /> : <Home size={10} opacity={0.3} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
