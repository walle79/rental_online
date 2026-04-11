import React, { useMemo } from 'react';
import { MapPin, Headset, User, Receipt, Zap, Droplet, Clock, CheckCircle2, AlertCircle, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MemberDashboard = ({ user, tenants, bills, supportRequests = [] }) => {
  const navigate = useNavigate();
  const tenant = tenants.find(t => t.room === user.room);
  const myBills = bills.filter(b => b.tenantId === tenant?.id || b.room === user.room);
  const unresolvedCount = supportRequests.filter(r => r.room === user.room && r.status !== 'resolved').length;

  const calculateDuration = (startDateStr) => {
    if (!startDateStr) return 'N/A';
    const start = new Date(startDateStr);
    const end = new Date();
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    let days = end.getDate() - start.getDate();
    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }
    return months <= 0 ? `${days} ngày` : days > 0 ? `${months} th ${days} ng` : `${months} tháng`;
  };

  return (
    <div className="animate-slide-up pb-10 relative">
      <header className="mb-10">
        <div className="flex-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient leading-tight">Chào {user.name}</h1>
            <p className="text-muted font-bold tracking-widest uppercase text-[10px] mt-1">Phòng của bạn: {user.room}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/profile')}
              className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-primary transition-all shadow-lg shadow-black/40 active:scale-95 border border-white/10"
            >
              <UserCircle size={24} />
            </button>
            <button 
              onClick={() => navigate('/support')}
              className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-primary transition-all shadow-lg shadow-black/40 relative active:scale-95 border border-white/10"
            >
              <Headset size={24} />
              {unresolvedCount > 0 && <span className="notification-badge">{unresolvedCount}</span>}
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-end py-6 space-y-1 border-y border-white/5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-white/90 whitespace-nowrap">
            <MapPin size={12} className="text-primary" />
            <span>04 Dương Thiệu Tước • Huế</span>
          </div>
        </div>
      </header>

      <div className="grid gap-6">
        {/* Room Status Card */}
        <div className="glass-card border-l-4 border-emerald-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <User size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Thông tin cư trú</h3>
              <p className="text-xs text-muted">Trạng thái: Đang thuê</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-muted uppercase mb-1">Thời gian ở</p>
              <p className="font-bold text-white">{calculateDuration(tenant?.contractDate)}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-muted uppercase mb-1">Ngày vào</p>
              <p className="font-bold text-white">{tenant?.contractDate || '---'}</p>
            </div>
          </div>
        </div>

        {/* Bill Summary */}
        <div className="space-y-4">
          <div className="flex-between px-1">
            <h3 className="text-[10px] font-bold uppercase text-muted tracking-widest">Lịch sử hóa đơn</h3>
            <span className="text-[10px] font-bold text-primary uppercase">Xem tất cả</span>
          </div>
          
          {myBills.length > 0 ? (
            myBills.map(bill => (
              <div key={bill.id} className="glass-card !mb-0 p-5 flex-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bill.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {bill.status === 'paid' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Tháng {bill.month}/{bill.year}</h4>
                    <p className="text-[11px] text-muted">{bill.status === 'paid' ? 'Đã hoàn thành' : 'Chưa thanh toán'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-white text-lg">{bill.total.toLocaleString()}đ</p>
                  <p className="text-[10px] font-bold uppercase text-primary tracking-tighter">Chi tiết →</p>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card text-center py-10 opacity-60">
              <p className="text-muted italic text-sm font-bold">Chưa có dữ liệu hóa đơn</p>
            </div>
          )}
        </div>

        {/* Support Quick Action */}
        <div className="glass-card bg-primary/5 border-dashed border-primary/20 flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Clock className="text-primary" size={24} />
            <div>
              <p className="font-bold text-white text-sm">Gặp vấn đề?</p>
              <p className="text-[11px] text-muted">Liên hệ quản lý ngay</p>
            </div>
          </div>
          <button className="bg-primary text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl">
             CHAT
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
