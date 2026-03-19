import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useLocation } from 'react-router-dom';
import {
  Search, UserPlus, Briefcase, Phone,
  Calendar, HeartPulse, Timer, User, Wallet, UserMinus,
  AlertTriangle
} from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 24px',
        zIndex: 999999,
        backdropFilter: 'blur(12px)'
      }}
    >
      <div
        style={{
          backgroundColor: '#1e293b',
          width: '100%', maxWidth: '340px',
          borderRadius: '32px', padding: '32px 24px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.8)'
        }}
      >
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          backgroundColor: '#f43f5e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', margin: '0 auto 24px',
          boxShadow: '0 10px 20px rgba(244,63,94,0.4)'
        }}>
          <AlertTriangle size={36} />
        </div>
        <h3 style={{ fontSize: '22px', fontWeight: 900, color: 'white', marginBottom: '8px' }}>{title}</h3>
        <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '32px', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={onConfirm}
            style={{
              width: '100%', padding: '14px',
              borderRadius: '16px',
              backgroundColor: '#f43f5e',
              color: 'white', fontWeight: 900,
              fontSize: '12px', letterSpacing: '0.1em',
              textTransform: 'uppercase', border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 16px rgba(244,63,94,0.35)'
            }}
          >
            Xác nhận xóa
          </button>
          <button
            onClick={onCancel}
            style={{
              width: '100%', padding: '14px',
              borderRadius: '16px',
              backgroundColor: 'rgba(100,116,139,0.3)',
              color: '#e2e8f0', fontWeight: 700,
              fontSize: '12px', letterSpacing: '0.1em',
              textTransform: 'uppercase', border: 'none', cursor: 'pointer'
            }}
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const KaitoTenants = ({ tenants = [], onAddTenant, onRemoveTenant }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRoom = queryParams.get('room') || '';

  const [searchTerm, setSearchTerm] = useState(initialRoom);
  const [deletingTenant, setDeletingTenant] = useState(null);

  useEffect(() => {
    if (initialRoom) {
      setSearchTerm(initialRoom);
    }
  }, [initialRoom]);

  const calculateDuration = (startDateStr) => {
    if (!startDateStr) return '0 ngày';
    const start = new Date(startDateStr);
    const end = new Date();
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    let days = end.getDate() - start.getDate();
    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }
    return months <= 0 ? `${days} ngày` : (days > 0 ? `${months} tháng ${days} ngày` : `${months} tháng`);
  };

  const s = (searchTerm || '').toLowerCase().trim();
  const displayTenants = (s === '' 
    ? [...tenants] 
    : tenants.filter(t => {
        const tName = String(t.name || '').toLowerCase();
        const tRoom = String(t.room || '').toLowerCase();
        return tName.includes(s) || tRoom.includes(s);
      })
  ).sort((a, b) => {
    const rA = parseInt(String(a.room).replace(/\D/g, '')) || 0;
    const rB = parseInt(String(b.room).replace(/\D/g, '')) || 0;
    return rA - rB;
  });

  return (
    <div className="animate-slide-up pb-20">
      <header className="mb-6 flex-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gradient">Khách thuê</h1>
          <p className="text-muted text-[11px] font-bold uppercase tracking-wider mt-1">
            {s ? `Kết quả: ${displayTenants.length}` : `${tenants.length} người đang cư trú`}
          </p>
        </div>
        <button
          onClick={onAddTenant}
          className="w-12 h-12 rounded-2xl bg-white-5 border-white-10 flex items-center justify-center text-primary shadow-black-40 active:scale-90 transition-all"
        >
          <UserPlus size={24} />
        </button>
      </header>

      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Tên khách hoặc số phòng..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="search-clear">XÓA</button>
        )}
      </div>

      <div className="space-y-4">
        {displayTenants.map((tenant, idx) => {
          const uniqueKey = `tenant_${tenant.id || 'no_id'}_${tenant.room}_${idx}_${Math.random().toString(36).substr(2, 9)}`;
          
          return (
            <div key={uniqueKey} className="glass-card !mb-0 relative group !pb-0 overflow-hidden flex flex-col">
              <div className="p-0"> {/* Outer padding handled by glass-card */}
                <div className="tenant-header mb-5 relative z-10">
                  <div 
                    className="tenant-avatar shrink-0 border border-white/5 flex items-center justify-center bg-white/5"
                    style={{ 
                      width: '48px', height: '48px', 
                      minWidth: '48px', minHeight: '48px',
                      maxWidth: '48px', maxHeight: '48px',
                      borderRadius: '16px'
                    }}
                  >
                    <User size={24} className="text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0 ml-4 max-w-full">
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="text-[17px] font-bold text-white truncate pr-2">{tenant.name || '---'}</h3>
                      <div className="room-badge whitespace-nowrap shrink-0">PHÒNG {tenant.room || '---'}</div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted font-bold uppercase tracking-wider mt-1.5">
                      <Briefcase size={12} className="opacity-70" />
                      <span className="truncate">{tenant.occupation || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>

                {/* INCREASED GAP-Y TO 7 FOR MORE BREATHING ROOM */}
                <div className="grid grid-cols-2 gap-y-7 gap-x-6 py-6 border-t border-white-5">
                  <div className="flex items-center gap-2.5">
                    <Timer size={14} className="text-primary" />
                    <span className="text-[13px] font-bold text-white/90">{calculateDuration(tenant.contractDate)}</span>
                  </div>
                  <div className="flex items-center gap-2.5 justify-end">
                    <Calendar size={14} className="text-primary" />
                    <span className="text-[13px] font-bold text-white/90">{tenant.contractDate || '---'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={14} className="text-primary" />
                    <span className="text-[13px] font-bold text-white/90">{tenant.phone || '---'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 justify-end">
                    <HeartPulse size={14} className="text-accent" />
                    <span className="text-[13px] font-bold text-rose-300">NT: {tenant.relativePhone || '---'}</span>
                  </div>
                </div>

                <div className="flex-between py-5 border-t border-white-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-primary">
                      <Wallet size={16} />
                    </div>
                    <span className="text-xs font-black uppercase text-muted tracking-widest">Tiền cọc</span>
                  </div>
                  <span className="text-lg font-black text-primary">
                    {tenant.deposit ? Number(tenant.deposit).toLocaleString() + 'đ' : '---'}
                  </span>
                </div>
              </div>

              {/* SEPARATE ROW FOR REMOVE ACTION - USING btn-danger CLASS */}
              <div className="border-t border-white-5 relative z-20">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeletingTenant(tenant);
                  }}
                  className="w-full btn-danger !p-5 !rounded-none !shadow-none !bg-[#f43f5e] hover:!bg-[#e11d48] active:scale-100 font-black text-[11px] uppercase tracking-[0.25em]"
                >
                  <UserMinus size={18} strokeWidth={3} />
                  Xóa khách thuê này
                </button>
              </div>
            </div>
          );
        })}

        {displayTenants.length === 0 && (
          <div className="py-20 text-center opacity-50">
            <Search size={40} className="mx-auto mb-4 text-muted" />
            <p className="text-sm font-bold">Không tìm thấy dữ liệu phù hợp</p>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!deletingTenant}
        title="Xác nhận xóa"
        message={`Dữ liệu khách thuê ${deletingTenant?.name} ở phòng ${deletingTenant?.room} sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?`}
        onConfirm={() => {
          onRemoveTenant(deletingTenant.id);
          setDeletingTenant(null);
        }}
        onCancel={() => setDeletingTenant(null)}
      />
    </div>
  );
};

export default KaitoTenants;
