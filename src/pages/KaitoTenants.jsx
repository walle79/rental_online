import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  Search, UserPlus, Users, Zap, Droplet,
  Calendar, Timer, User, Wallet, UserMinus,
  AlertTriangle, DollarSign, Edit3, Check, X, Wind
} from 'lucide-react';
import { DEFAULT_PRICES, mergePrices, calculateRoomPrice } from '../utils/roomPrice';

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

const TenantEditableRow = ({ icon: Icon, iconColor, label, value, type = 'text', onSave, suffix = '' }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const formatDisplay = (val) => {
    if (val === undefined || val === null || val === '') return '---';
    if (type === 'number') return Number(val).toLocaleString() + suffix;
    if (type === 'date' && val) return val.split('-').reverse().join('/');
    return val + suffix;
  };

  const handleSave = () => {
    let finalValue = draft;
    if (type === 'number') {
      const cleaned = draft !== undefined && draft !== null ? draft.toString().replace(/\D/g, '') : '';
      finalValue = cleaned === '' ? 0 : Number(cleaned);
    }
    onSave(finalValue);
    setEditing(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="flex items-center gap-3">
        {Icon && (
          <Icon
            size={16}
            className="shrink-0 opacity-80"
            style={{ color: iconColor || 'var(--primary)' }}
          />
        )}
        <span className="text-[13px] text-muted font-medium">{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {editing ? (
          <>
            <input
              type={type === 'number' ? 'text' : type}
              value={type === 'number' ? (draft !== undefined && draft !== null && draft !== '' ? Number(draft).toLocaleString() : '') : (draft ?? '')}
              onChange={e => {
                let val = e.target.value;
                if (type === 'number') val = val.replace(/\D/g, '');
                setDraft(val);
              }}
              autoFocus
              style={{
                background: 'rgba(255,255,255,0.08)', border: '1.5px solid #f97316',
                borderRadius: '8px', color: 'white', padding: '4px 8px',
                fontSize: '13px', fontWeight: 700, width: type === 'date' ? '130px' : '110px', textAlign: 'right', outline: 'none'
              }}
            />
            <button
              onClick={handleSave}
              style={{ background: '#22c55e', border: 'none', borderRadius: '6px', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Check size={14} color="white" strokeWidth={3} />
            </button>
            <button
              onClick={() => { setDraft(value); setEditing(false); }}
              style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={14} color="#94a3b8" />
            </button>
          </>
        ) : (
          <>
            <span className={`text-[14px] font-bold ${label === 'Tiền cọc' ? 'text-primary' : 'text-white'}`}>
              {formatDisplay(value)}
            </span>
            <button
              onClick={() => { setDraft(value); setEditing(true); }}
              style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Edit3 size={12} color="#f97316" strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const EditableTenantName = ({ name, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  useEffect(() => {
    setDraft(name);
  }, [name]);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== name) {
      onSave(trimmed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') { setDraft(name); setEditing(false); }
  };

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1, minWidth: 0, width: '100%' }}>
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1.5px solid #f97316',
            borderRadius: '8px',
            color: 'white',
            padding: '4px 8px',
            fontSize: '13px',
            fontWeight: 700,
            flex: 1,
            minWidth: 0,
            width: '100%',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <button
          type="button"
          onClick={handleSave}
          title="Lưu"
          style={{ background: '#22c55e', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <Check size={13} color="white" strokeWidth={3} />
        </button>
        <button
          type="button"
          onClick={() => { setDraft(name); setEditing(false); }}
          title="Hủy"
          style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <X size={13} color="#94a3b8" />
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0, overflow: 'hidden' }}>
      <h3 
        style={{ 
          fontSize: '15px', 
          fontWeight: 700, 
          color: 'white', 
          margin: 0, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          flex: 1,
          minWidth: 0
        }}
        title={name}
      >
        {name || '---'}
      </h3>
      <button
        type="button"
        onClick={() => { setDraft(name); setEditing(true); }}
        title="Chỉnh sửa tên"
        style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
      >
        <Edit3 size={12} color="#f97316" strokeWidth={2.5} />
      </button>
    </div>
  );
};

const KaitoTenants = ({ tenants = [], onAddTenant, onRemoveTenant, onUpdateTenant }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRoom = queryParams.get('room') || '';

  const [searchTerm, setSearchTerm] = useState(initialRoom);
  const [deletingTenant, setDeletingTenant] = useState(null);
  const [configPrices, setConfigPrices] = useState(DEFAULT_PRICES);

  const handleUpdateField = (tenantId, field, newValue) => {
    onUpdateTenant(tenantId, { [field]: newValue });
  };

  const guestCountOf = (tenant) => (Number(tenant.guestCount) > 0 ? Number(tenant.guestCount) : 1);

  const persistRoomPrice = (tenant, { guestCount, hasAircon }) => {
    const nextGuests = guestCount ?? guestCountOf(tenant);
    const nextAircon = hasAircon ?? !!tenant.hasAircon;
    const roomPrice = calculateRoomPrice({ guestCount: nextGuests, hasAircon: nextAircon, prices: configPrices });
    onUpdateTenant(tenant.id, { guestCount: nextGuests, hasAircon: nextAircon, roomPrice });
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'prices'), (snap) => {
      setConfigPrices(snap.exists() ? mergePrices(snap.data()) : DEFAULT_PRICES);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (initialRoom) {
      setSearchTerm(initialRoom);
    }
  }, [initialRoom]);

  const calculateDuration = (startDateStr) => {
    if (!startDateStr) return '0 ngày';
    const start = new Date(startDateStr);
    const end = new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (start > end) {
      return '0 ngày';
    }
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

  const totalGuests = tenants.reduce((sum, t) => sum + guestCountOf(t), 0);
  const displayGuests = displayTenants.reduce((sum, t) => sum + guestCountOf(t), 0);

  return (
    <div className="animate-slide-up pb-20">
      <header className="mb-6 flex-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gradient">Khách thuê</h1>
          <p className="text-muted text-[11px] font-bold uppercase tracking-wider mt-1">
            {s ? `Kết quả: ${displayGuests} người đang cư trú` : `${totalGuests} người đang cư trú`}
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
          const uniqueKey = `tenant_${tenant.id || tenant.room || idx}`;

          return (
            <div key={uniqueKey} className="glass-card !mb-0 relative group !pb-0 overflow-hidden flex flex-col !p-4">
              <div className="p-0"> {/* Outer padding handled by glass-card */}
                <div className="tenant-header mb-4 relative z-10" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
                  <div
                    className="tenant-avatar shrink-0 border border-white/5 flex items-center justify-center bg-white/5"
                    style={{
                      width: '44px', height: '44px',
                      minWidth: '44px', minHeight: '44px',
                      maxWidth: '44px', maxHeight: '44px',
                      borderRadius: '14px'
                    }}
                  >
                    <User size={22} className="text-white/60" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, width: '100%', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%', minWidth: 0 }}>
                      <EditableTenantName
                        name={tenant.name || ''}
                        onSave={(val) => handleUpdateField(tenant.id, 'name', val)}
                      />
                      <div className="room-badge whitespace-nowrap" style={{ flexShrink: 0 }}>
                        PHÒNG {tenant.room || '---'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted font-bold uppercase tracking-wider mt-1">
                      <Users size={12} className="opacity-70 text-primary shrink-0" />
                      <span className="truncate">{tenant.guestCount ? `${tenant.guestCount} khách thuê` : '1 khách thuê'}</span>
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
                  <TenantEditableRow 
                    icon={Calendar} 
                    label="Ngày thuê" 
                    value={tenant.contractDate} 
                    type="date" 
                    onSave={(val) => handleUpdateField(tenant.id, 'contractDate', val)} 
                  />

                  {/* Số khách thuê */}
                  <TenantEditableRow 
                    icon={Users} 
                    label="Số khách thuê" 
                    value={tenant.guestCount !== undefined && tenant.guestCount !== null ? tenant.guestCount : 1} 
                    type="number" 
                    suffix=" người"
                    onSave={(val) => persistRoomPrice(tenant, { guestCount: Number(val) || 1 })} 
                  />

                  {/* Chỉ số Điện */}
                  <TenantEditableRow 
                    icon={Zap} 
                    iconColor="#fbbf24"
                    label="Chỉ số Điện" 
                    value={tenant.elecIndex ?? tenant.initialElec} 
                    type="number" 
                    suffix=" kWh"
                    onSave={(val) => {
                      const num = Number(val) || 0;
                      onUpdateTenant(tenant.id, { elecIndex: num, initialElec: num });
                    }} 
                  />

                  {/* Chỉ số Nước */}
                  <TenantEditableRow 
                    icon={Droplet} 
                    iconColor="#60a5fa"
                    label="Chỉ số Nước" 
                    value={tenant.waterIndex ?? tenant.initialWater} 
                    type="number" 
                    suffix=" m³"
                    onSave={(val) => {
                      const num = Number(val) || 0;
                      onUpdateTenant(tenant.id, { waterIndex: num, initialWater: num });
                    }} 
                  />

                  {/* Điều hòa */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="flex items-center gap-3">
                      <Wind size={16} className="shrink-0 opacity-80" style={{ color: '#38bdf8' }} />
                      <span className="text-[13px] text-muted font-medium">Điều hòa</span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <span className="text-[12px] font-bold" style={{ color: tenant.hasAircon ? '#38bdf8' : '#64748b' }}>
                        {tenant.hasAircon ? 'Có' : 'Không'}
                      </span>
                      <input
                        type="checkbox"
                        checked={!!tenant.hasAircon}
                        onChange={(e) => persistRoomPrice(tenant, { hasAircon: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#f97316', cursor: 'pointer' }}
                      />
                    </label>
                  </div>

                  {/* Giá phòng — tính từ settings + số người + điều hòa */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="flex items-center gap-3">
                      <DollarSign size={16} className="text-primary shrink-0 opacity-80" />
                      <span className="text-[13px] text-muted font-medium">Giá phòng</span>
                    </div>
                    <span className="text-[14px] font-bold text-white">
                      {calculateRoomPrice({
                        guestCount: guestCountOf(tenant),
                        hasAircon: !!tenant.hasAircon,
                        prices: configPrices
                      }).toLocaleString()}đ
                    </span>
                  </div>

                  {/* Tiền cọc */}
                  <TenantEditableRow 
                    icon={Wallet} 
                    label="Tiền cọc" 
                    value={tenant.deposit} 
                    type="number" 
                    suffix="đ"
                    onSave={(val) => handleUpdateField(tenant.id, 'deposit', val)} 
                  />
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
