import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useLocation } from 'react-router-dom';
import {
  Search, UserPlus, Briefcase, Phone,
  Calendar, HeartPulse, Timer, User, Wallet, UserMinus,
  AlertTriangle, DollarSign
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
                  <div className="flex-1 min-w-0 ml-3 max-w-full">
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

                <div className="mx-4 mb-6 bg-white/[0.02] rounded-2xl border border-white/5 p-4 flex flex-col space-y-[14px]">
                  {/* Thời gian ở */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Timer size={16} className="text-primary shrink-0 opacity-80" />
                      <span className="text-[13px] text-muted font-medium">Thời gian ở</span>
                    </div>
                    <span className="text-[14px] font-bold text-white">{calculateDuration(tenant.contractDate)}</span>
                  </div>

                  {/* Ngày thuê */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-primary shrink-0 opacity-80" />
                      <span className="text-[13px] text-muted font-medium">Ngày thuê</span>
                    </div>
                    <span className="text-[14px] font-bold text-white">
                      {tenant.contractDate ? tenant.contractDate.split('-').reverse().join('/') : '---'}
                    </span>
                  </div>

                  {/* SĐT */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-primary shrink-0 opacity-80" />
                      <span className="text-[13px] text-muted font-medium">SĐT</span>
                    </div>
                    <span className="text-[14px] font-bold text-white">{tenant.phone || '---'}</span>
                  </div>

                  {/* SĐT NT */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <HeartPulse size={16} className="text-primary shrink-0 opacity-80" />
                      <span className="text-[13px] text-muted font-medium">SĐT NT</span>
                    </div>
                    <span className="text-[14px] font-bold text-white">{tenant.relativePhone || '---'}</span>
                  </div>

                  {/* Giá phòng */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <DollarSign size={16} className="text-primary shrink-0 opacity-80" />
                      <span className="text-[13px] text-muted font-medium">Giá phòng</span>
                    </div>
                    <span className="text-[14px] font-bold text-white">
                      {tenant.roomPrice ? Number(tenant.roomPrice).toLocaleString() + 'đ' : 'Mặc định'}
                    </span>
                  </div>

                  {/* Tiền cọc */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Wallet size={16} className="text-primary shrink-0 opacity-80" />
                      <span className="text-[13px] text-muted font-medium">Tiền cọc</span>
                    </div>
                    <span className="text-[14px] font-bold text-primary">
                      {tenant.deposit ? Number(tenant.deposit).toLocaleString() + 'đ' : '---'}
                    </span>
                  </div>
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
