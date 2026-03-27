import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import { Home, User, MapPin, Clock, Bell, UserCircle } from 'lucide-react';

const Dashboard = ({ tenants = [], bills = [], notifications = [] }) => {
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const TOTAL_ROOMS = 20;
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
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

  // Floor configuration
  const floors = [
    { id: 1, label: 'Tầng 1', rooms: ['101', '102', '103', '104', '105', '106'] },
    { id: 2, label: 'Tầng 2', rooms: ['201', '202', '203', '204', '205', '206', '207'] },
    { id: 3, label: 'Tầng 3', rooms: ['301', '302', '303', '304', '305', '306', '307'] }
  ];

  // Room Status Data
  const occupiedRoomsCount = useMemo(() => new Set(tenants.map(t => t.room)).size, [tenants]);

  const roomStatusData = useMemo(() => [
    { name: 'Đang ở', value: occupiedRoomsCount, color: '#22c55e' },
    { name: 'Phòng trống', value: Math.max(0, TOTAL_ROOMS - occupiedRoomsCount), color: 'rgba(255, 255, 255, 0.05)' }
  ], [occupiedRoomsCount]);

  // Revenue Status Data
  const revenueData = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthBills = bills.filter(b => b.month === currentMonth && b.year === currentYear);

    const paid = monthBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.total, 0);
    const pending = monthBills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.total, 0);

    if (monthBills.length === 0) {
      return [
        { name: 'Đã thu', value: 0, color: '#f97316' },
        { name: 'Chưa thu', value: 0, color: '#f43f5e' }
      ];
    }

    return [
      { name: 'Đã thu', value: paid, color: '#f97316' },
      { name: 'Chưa thu', value: pending, color: '#f43f5e' }
    ];
  }, [bills]);

  // Only count PAID bills toward revenue (pending = not yet collected)
  const totalRevenue = revenueData.find(d => d.name === 'Đã thu')?.value || 0;
  const pendingRevenue = revenueData.find(d => d.name === 'Chưa thu')?.value || 0;

  const handleRoomClick = (roomNumber) => {
    const tenant = tenants.find(t => t.room === roomNumber);
    if (tenant) {
      navigate(`/tenants?room=${roomNumber}`);
    }
  };

  return (
    <div className="animate-slide-up pb-10 relative">
      <div className="flex-between items-center mb-6">
        <h1 className="text-3xl font-black text-gradient">Tổng quan</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/profile')}
            className="w-12 h-12 rounded-2xl bg-white-5 border-white-10 flex items-center justify-center text-primary shadow-black-40 active:scale-90 transition-all"
          >
            <UserCircle size={24} />
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="w-12 h-12 rounded-2xl bg-white-5 border-white-10 flex items-center justify-center text-primary relative shadow-black-40 active:scale-90 transition-all"
          >
            <Bell size={24} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end py-2 mb-4 space-y-0.5">
        <div className="text-[10px] font-bold text-white uppercase tracking-[0.2em] whitespace-nowrap opacity-60">
          Huế, {formatDateTime(currentTime)}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-white whitespace-nowrap">
          <MapPin size={10} className="text-primary" />
          <span> 04 Dương Thiệu Tước</span>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Revenue Card */}
        <div className="glass-card revenue-card !mb-0">
          <div className="flex-between mb-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Doanh thu tháng {new Date().getMonth() + 1}</h3>
            <span className="text-xl font-black text-white">{totalRevenue.toLocaleString()}đ</span>
          </div>
          {pendingRevenue > 0 && (
            <div className="flex-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted opacity-70">Chờ thu</span>
              <span className="text-[12px] font-bold" style={{ color: '#f59e0b' }}>+{pendingRevenue.toLocaleString()}đ</span>
            </div>
          )}
        </div>

        {/* Interactive Room Map */}
        <div className="glass-card">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Sơ đồ phòng (20 phòng)</h3>
          <div className="flex gap-6 mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-success">Đang thuê ({occupiedRoomsCount})</h3>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted">Trống ({TOTAL_ROOMS - occupiedRoomsCount})</h3>
          </div>
          <div className="space-y-8">
            {floors.map(floor => (
              <div key={floor.id}>
                <p className="glass-label text-[10px] uppercase mb-4">{floor.label}</p>
                <div className="room-grid">
                  {floor.rooms.map(roomNum => {
                    const tenant = tenants.find(t => t.room === roomNum);
                    const isOccupied = !!tenant;
                    return (
                      <button
                        key={roomNum}
                        onClick={() => handleRoomClick(roomNum)}
                        className={`room-btn ${isOccupied ? 'active' : ''}`}
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
