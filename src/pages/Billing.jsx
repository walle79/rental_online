import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  Droplet, Zap, Receipt, History,
  ChevronRight, Camera, CheckCircle2, AlertCircle, Trash2,
  ChevronDown, Search, X, Edit3, Save, Building2, Calendar,
  User, DollarSign, ArrowLeft, Filter
} from 'lucide-react';

// ─── Invoice Detail Modal (Portal) ─────────────────────────────────────────────
const EditableRow = ({ label, value, unit, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = () => {
    onSave(Number(draft));
    setEditing(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '8px' }}>
      <span style={{ fontSize: '13px', color: '#94a3b8', flex: 1, whiteSpace: 'nowrap' }}>{label}</span>
      {editing ? (
        <>
          <input
            type="text"
            value={draft ? Number(draft).toLocaleString() : ''}
            onChange={e => setDraft(e.target.value.replace(/\D/g, ''))}
            autoFocus
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1.5px solid #f97316',
              borderRadius: '10px', color: 'white', padding: '6px 10px',
              fontSize: '14px', fontWeight: 700, width: '115px', textAlign: 'right', outline: 'none'
            }}
          />
          {unit && <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '2px' }}>{unit}</span>}
          <button
            onClick={handleSave}
            style={{ background: '#22c55e', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </button>
        </>
      ) : (
        <>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{Number(value).toLocaleString()}{unit ? ` ${unit}` : 'đ'}</span>
          <button
            onClick={() => { setDraft(value); setEditing(true); }}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </button>
        </>
      )}
    </div>
  );
};

// Inner modal content — only mounted when bill is non-null
const InvoiceModalContent = ({ bill, onClose, onUpdateStatus, onSave, prices }) => {
  const elecPrice = bill.electricity?.price ?? prices?.electricity ?? 3500;
  const waterPrice = bill.water?.price ?? prices?.water ?? 15000;

  // Local state for live edits (initializes from a guaranteed non-null bill)
  const [localBill, setLocalBill] = useState(bill);

  const isPaid = localBill.status === 'paid';
  const extraServicesTotal = (localBill.extraServices || []).reduce((sum, s) => sum + s.cost, 0);
  const rentCost = localBill.total - (localBill.electricity?.cost || 0) - (localBill.water?.cost || 0) - extraServicesTotal;

  const updateAndSave = (updated) => {
    setLocalBill(updated);
    onSave(updated);
  };

  const handleRentChange = (newRent) => {
    updateAndSave({ ...localBill, total: newRent + (localBill.electricity?.cost || 0) + (localBill.water?.cost || 0) + extraServicesTotal });
  };

  const handleElecChange = (newKwh) => {
    const newCost = newKwh * elecPrice;
    updateAndSave({ ...localBill, electricity: { current: newKwh, price: elecPrice, cost: newCost }, total: rentCost + newCost + (localBill.water?.cost || 0) + extraServicesTotal });
  };

  const handleWaterChange = (newM3) => {
    const newCost = newM3 * waterPrice;
    updateAndSave({ ...localBill, water: { current: newM3, price: waterPrice, cost: newCost }, total: rentCost + (localBill.electricity?.cost || 0) + newCost + extraServicesTotal });
  };

  const handleExtraServiceChange = (id, newCost) => {
    const newExtraServices = (localBill.extraServices || []).map(s => s.id === id ? { ...s, cost: newCost } : s);
    const newExtraTotal = newExtraServices.reduce((sum, s) => sum + s.cost, 0);
    updateAndSave({ ...localBill, extraServices: newExtraServices, total: rentCost + (localBill.electricity?.cost || 0) + (localBill.water?.cost || 0) + newExtraTotal });
  };

  const handleToggleStatus = () => {
    const newStatus = isPaid ? 'pending' : 'paid';
    onUpdateStatus(localBill.id, newStatus);
    onClose();
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        backgroundColor: '#0f172a',
        width: '100%', maxWidth: '430px',
        borderRadius: '40px 40px 0 0',
        padding: '32px 24px 48px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderTop: '2px solid #f97316'
      }}
    >
      {/* Header with inline status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 900, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 6px 0' }}>
            Chi tiết hóa đơn
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>
              Phòng {localBill.room}
            </h2>
            <span style={{
              fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '8px',
              background: isPaid ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
              color: isPaid ? '#22c55e' : '#f59e0b',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              border: `1px solid ${isPaid ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`
            }}>
              {isPaid ? 'Đã thu' : 'Chưa thu'}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
            {localBill.tenantName} • Th{localBill.month}/{localBill.year}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Editable Rows */}
      <div style={{ marginBottom: '28px' }}>
        <EditableRow label="Tiền phòng" value={rentCost} onSave={handleRentChange} />
        <EditableRow label="Điện" value={localBill.electricity?.current ?? 0} unit="kWh" onSave={handleElecChange} />
        <EditableRow label="Nước" value={localBill.water?.current ?? 0} unit="m³" onSave={handleWaterChange} />

        {(localBill.extraServices || []).map(service => (
          <EditableRow 
            key={service.id} 
            label={service.name} 
            value={service.cost} 
            onSave={(newCost) => handleExtraServiceChange(service.id, newCost)} 
          />
        ))}

        <div style={{ padding: '8px 0 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ fontSize: '12px', color: '#475569' }}>→ Chi phí điện ({localBill.electricity?.current ?? 0} × {elecPrice.toLocaleString()}đ)</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{(localBill.electricity?.cost || 0).toLocaleString()}đ</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ fontSize: '12px', color: '#475569' }}>→ Chi phí nước ({localBill.water?.current ?? 0} × {waterPrice.toLocaleString()}đ)</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{(localBill.water?.cost || 0).toLocaleString()}đ</span>
          </div>
        </div>

        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>TỔNG CỘNG</span>
          <span style={{ fontSize: '26px', fontWeight: 900, color: '#f97316' }}>{localBill.total.toLocaleString()}đ</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!isPaid && (
          <button
            onClick={handleToggleStatus}
            style={{
              width: '100%', padding: '18px', borderRadius: '20px',
              background: 'linear-gradient(135deg, #f97316, #fbbf24)',
              border: 'none', color: 'white', fontWeight: 900,
              fontSize: '14px', cursor: 'pointer',
              boxShadow: '0 10px 25px -5px rgba(249,115,22,0.4)'
            }}
          >
            ✓  Xác nhận đã thu tiền
          </button>
        )}
        {isPaid && (
          <button
            onClick={handleToggleStatus}
            style={{
              width: '100%', padding: '14px', borderRadius: '16px',
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
              color: '#f59e0b', fontWeight: 700, fontSize: '12px', cursor: 'pointer'
            }}
          >
            Đánh dấu lại là chưa thu
          </button>
        )}
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '16px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#94a3b8', fontWeight: 700, fontSize: '13px', cursor: 'pointer'
          }}
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

// Outer wrapper: guard that only mounts InvoiceModalContent when bill is non-null
const InvoiceDetailModal = ({ bill, onClose, onUpdateStatus, onSave, prices }) => {
  if (!bill) return null;
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 999999,
        backdropFilter: 'blur(12px)'
      }}
      onClick={onClose}
    >
      <InvoiceModalContent bill={bill} onClose={onClose} onUpdateStatus={onUpdateStatus} onSave={onSave} prices={prices} />
    </div>,
    document.body
  );
};

// ─── Main Billing Component ──────────────────────────────────────────────────────
const Billing = ({ tenants = [], bills = [], onAddBill, onUpdateBill }) => {
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [viewingBill, setViewingBill] = useState(null);
  const [currentReadings, setCurrentReadings] = useState({
    electricity: '',
    water: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [extraServices, setExtraServices] = useState([]);

  const [configPrices, setConfigPrices] = useState({
    electricity: 5000,
    water: 15000,
    room: 3000000
  });
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [showPriceSettings, setShowPriceSettings] = useState(false);
  const [isSavingPrices, setIsSavingPrices] = useState(false);
  const [draftPrices, setDraftPrices] = useState({ electricity: '', water: '', room: '' });

  useEffect(() => {
    if (showPriceSettings) {
      setDraftPrices({
        electricity: configPrices.electricity?.toString() || '',
        water: configPrices.water?.toString() || '',
        room: configPrices.room?.toString() || ''
      });
    }
  }, [showPriceSettings, configPrices]);

  const handleDraftChange = (field, value) => {
    const numStr = value.replace(/\D/g, '');
    const cleaned = numStr ? parseInt(numStr, 10).toString() : '';
    setDraftPrices(prev => ({ ...prev, [field]: cleaned }));
  };

  const formatPriceDisplay = (valStr) => {
    if (!valStr) return '';
    return Number(valStr).toLocaleString('de-DE');
  };

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const docRef = doc(db, 'config', 'prices');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfigPrices(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setLoadingPrices(false);
      }
    };
    fetchPrices();
  }, []);

  const handleSavePricesToDB = async () => {
    setIsSavingPrices(true);
    try {
      const newConfig = {
        electricity: Number(draftPrices.electricity) || 0,
        water: Number(draftPrices.water) || 0,
        room: Number(draftPrices.room) || 0
      };
      await setDoc(doc(db, 'config', 'prices'), newConfig);
      setConfigPrices(newConfig);
      alert('Đã lưu cấu hình giá mới vào Database thành công!');
      setShowPriceSettings(false);
    } catch (error) {
      console.error("Error saving prices:", error);
      alert('Lỗi khi lưu cấu hình giá, vui lòng kiểm tra lại kết nối!');
    } finally {
      setIsSavingPrices(false);
    }
  };

  const [searchRoom, setSearchRoom] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filters for history
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const roomsData = useMemo(() => {
    const rooms = {};
    tenants.forEach(t => {
      if (!rooms[t.room]) {
        rooms[t.room] = { room: t.room, primaryTenant: t, occupants: [] };
      }
      rooms[t.room].occupants.push(t.name);
    });
    return Object.values(rooms).sort((a, b) => a.room.localeCompare(b.room, undefined, { numeric: true }));
  }, [tenants]);

  const filteredRooms = roomsData.filter(r =>
    r.room.toLowerCase().includes(searchRoom.toLowerCase()) ||
    r.occupants.some(name => name.toLowerCase().includes(searchRoom.toLowerCase()))
  );

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!selectedTenant) return;

    const elecUsage = Number(currentReadings.electricity);
    const waterUsage = Number(currentReadings.water);

    const elecCost = elecUsage * configPrices.electricity;
    const waterCost = waterUsage * configPrices.water;
    const roomCost = selectedTenant.roomPrice ? Number(selectedTenant.roomPrice) : configPrices.room;
    
    const validExtraServices = extraServices
      .filter(s => s.name.trim() !== '' && (Number(s.cost) || 0) > 0)
      .map(s => ({ ...s, cost: Number(s.cost) }));
    const extraServicesTotal = validExtraServices.reduce((sum, s) => sum + s.cost, 0);

    const total = roomCost + elecCost + waterCost + extraServicesTotal;

    const newBill = {
      id: Date.now(),
      tenantId: selectedTenant.id,
      tenantName: selectedTenant.name,
      room: selectedTenant.room,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      electricity: { current: elecUsage, price: configPrices.electricity, cost: elecCost },
      water: { current: waterUsage, price: configPrices.water, cost: waterCost },
      extraServices: validExtraServices,
      total: total,
      status: 'pending',
      date: currentReadings.date
    };

    onAddBill(newBill);
    setSelectedTenant(null);
    setCurrentReadings({ electricity: '', water: '', date: new Date().toISOString().split('T')[0] });
    setExtraServices([]);
  };

  const handleUpdateStatus = (billId, newStatus) => {
    onUpdateBill(billId, { status: newStatus });
    if (viewingBill?.id === billId) {
      setViewingBill(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleSaveBill = (updatedBill) => {
    onUpdateBill(updatedBill.id, updatedBill);
  };

  // Available months for filter
  const availableMonths = useMemo(() => {
    const months = new Set(bills.map(b => `${b.year}-${String(b.month).padStart(2, '0')}`));
    return [...months].sort().reverse();
  }, [bills]);

  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      const monthMatch = !filterMonth || `${b.year}-${String(b.month).padStart(2, '0')}` === filterMonth;
      const statusMatch = filterStatus === 'all' || b.status === filterStatus;
      return monthMatch && statusMatch;
    });
  }, [bills, filterMonth, filterStatus]);

  return (
    <div className="animate-slide-up pb-20">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gradient">Hóa đơn</h1>
        <p className="text-muted">Tính tiền & Quản lý hóa đơn</p>
      </header>

      {!selectedTenant ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Create invoice section */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 className="form-label" style={{ margin: 0 }}>Tạo hóa đơn mới</h2>
              <button
                onClick={() => setShowPriceSettings(!showPriceSettings)}
                style={{ background: 'none', border: 'none', color: '#f97316', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>⚙️</span> Cài đặt giá
              </button>
            </div>

            {showPriceSettings && (
              <div className="glass-card animate-slide-up" style={{ padding: '20px', marginBottom: '20px', border: '1px solid rgba(249, 115, 22, 0.4)' }}>
                <p style={{ fontSize: '12px', color: '#f97316', fontWeight: 'bold', marginBottom: '16px', marginTop: 0, letterSpacing: '0.05em' }}>CẤU HÌNH ĐƠN GIÁ (LƯU DB)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Điện (đ/kWh)</label>
                    <input
                      type="text" value={formatPriceDisplay(draftPrices.electricity)}
                      onChange={e => handleDraftChange('electricity', e.target.value)}
                      placeholder="0"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 10px', color: 'white', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Nước (đ/m³)</label>
                    <input
                      type="text" value={formatPriceDisplay(draftPrices.water)}
                      onChange={e => handleDraftChange('water', e.target.value)}
                      placeholder="0"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 10px', color: 'white', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSavePricesToDB}
                  disabled={isSavingPrices}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #f97316, #fbbf24)', color: 'white', fontWeight: 'bold', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', opacity: isSavingPrices ? 0.7 : 1, transition: 'all 0.2s' }}
                >
                  {isSavingPrices ? 'Đang lưu...' : 'Lưu cập nhật vào Firebase'}
                </button>
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="glass-card"
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px',
                  marginBottom: '0',
                  border: isDropdownOpen ? '1px solid var(--primary)' : '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ color: 'var(--primary)' }}>
                    <Receipt size={24} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '12px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Chọn phòng</p>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', opacity: 0.8, margin: 0 }}>Bấm để xem danh sách...</p>
                  </div>
                </div>
                <ChevronDown style={{ color: 'var(--primary)', transition: 'transform 0.3s', transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }} size={24} />
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu" style={{
                  position: 'absolute', top: 'calc(100% + 10px)', left: 0, right: 0, zIndex: 100, padding: '16px'
                }}>
                  <div className="search-wrapper" style={{ marginBottom: '16px' }}>
                    <Search className="icon" size={16} />
                    <input
                      type="text"
                      placeholder="Tìm số phòng hoặc tên khách..."
                      value={searchRoom}
                      onChange={(e) => setSearchRoom(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="custom-scrollbar" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {filteredRooms.map(roomInfo => (
                      <button
                        key={roomInfo.room}
                        onClick={() => { setSelectedTenant(roomInfo.primaryTenant); setIsDropdownOpen(false); }}
                        className="dropdown-item"
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                      >
                        <div>
                          <p style={{ fontSize: '15px', fontWeight: '900', color: 'white', margin: '0 0 4px 0' }}>PHÒNG {roomInfo.room}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{roomInfo.occupants.join(', ')}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="room-badge">{roomInfo.occupants.length} người</span>
                          <ChevronRight size={16} style={{ color: 'var(--primary)' }} />
                        </div>
                      </button>
                    ))}
                    {tenants.length === 0 && (
                      <div style={{ padding: '40px 0', textAlign: 'center', opacity: 0.5 }}>
                        <p className="form-label">Chưa có dữ liệu</p>
                      </div>
                    )}
                    {tenants.length > 0 && filteredRooms.length === 0 && (
                      <div style={{ padding: '40px 0', textAlign: 'center' }}>
                        <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Không tìm thấy phòng!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* History section */}
          <section>
            {/* Header row: "Lịch sử gần đây" + filters */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '16px' }}>
              <h2 className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Lịch sử gần đây</h2>
              <div style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                {/* Month Filter */}
                <select
                  value={filterMonth}
                  onChange={e => setFilterMonth(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: filterMonth ? '#f97316' : '#94a3b8',
                    fontSize: '11px', fontWeight: 700,
                    padding: '6px 10px',
                    outline: 'none', cursor: 'pointer',
                    maxWidth: '100px'
                  }}
                >
                  <option value="">Tháng</option>
                  {availableMonths.map(ym => {
                    const [y, m] = ym.split('-');
                    return <option key={ym} value={ym}>Th{parseInt(m)}/{y}</option>;
                  })}
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  style={{
                    background: filterStatus === 'paid' ? 'rgba(34,197,94,0.1)' : filterStatus === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${filterStatus === 'paid' ? 'rgba(34,197,94,0.3)' : filterStatus === 'pending' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '10px',
                    color: filterStatus === 'paid' ? '#22c55e' : filterStatus === 'pending' ? '#f59e0b' : '#94a3b8',
                    fontSize: '11px', fontWeight: 700,
                    padding: '6px 10px',
                    outline: 'none', cursor: 'pointer',
                    maxWidth: '90px'
                  }}
                >
                  <option value="all">Status</option>
                  <option value="paid">Đã thu</option>
                  <option value="pending">Chưa thu</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredBills.map(bill => {
                const isPaid = bill.status === 'paid';
                return (
                  <button
                    key={bill.id}
                    onClick={() => setViewingBill(bill)}
                    className="glass-card"
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: '0', padding: '16px 20px',
                      width: '100%', textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        minWidth: '42px',
                        background: isPaid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: isPaid ? '#22c55e' : '#f59e0b'
                      }}>
                        {isPaid ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      </div>
                      <div>
                        <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 3px 0', color: 'white' }}>
                          Phòng {bill.room} • Th{bill.month} {bill.year}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{bill.tenantName}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '12px' }}>
                      <p style={{ fontWeight: 900, fontSize: '14px', margin: '0 0 5px 0', color: isPaid ? 'white' : 'white' }}>
                        {bill.total.toLocaleString()}đ
                      </p>
                      <span style={{
                        fontSize: '9px', fontWeight: 900,
                        padding: '3px 9px', borderRadius: '6px',
                        background: isPaid ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                        color: isPaid ? '#22c55e' : '#f59e0b',
                        textTransform: 'uppercase', letterSpacing: '0.1em'
                      }}>
                        {isPaid ? 'Đã thu' : 'Chưa thu'}
                      </span>
                    </div>
                  </button>
                );
              })}
              {filteredBills.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '14px', padding: '32px 0' }}>
                  {bills.length === 0 ? 'Chưa có hóa đơn nào' : 'Không có hóa đơn phù hợp với bộ lọc'}
                </p>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="animate-slide-up">
          <button
            onClick={() => { setSelectedTenant(null); setExtraServices([]); }}
            className="text-primary text-xs font-bold mb-6 flex items-center gap-1 uppercase tracking-widest"
          >
            ← Hủy chọn phòng
          </button>

          <div className="glass-card !mb-0 p-6">
            <h2 className="text-xl font-bold mb-1">Tính tiền Phòng {selectedTenant.room}</h2>
            <p className="text-muted text-sm mb-4">{selectedTenant.name}</p>

            <div className="mb-6 p-4 rounded-xl bg-white-5 border border-white-10 flex justify-between items-center">
              <span className="text-xs font-bold text-muted uppercase tracking-widest">Giá phòng áp dụng</span>
              <span className="text-sm font-black text-primary">
                {selectedTenant.roomPrice ? Number(selectedTenant.roomPrice).toLocaleString() + 'đ' : configPrices.room.toLocaleString() + 'đ (Mặc định)'}
              </span>
            </div>

            <form onSubmit={handleCalculate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted flex items-center gap-1 uppercase">
                    <Zap size={10} className="text-amber-400" /> Số điện tiêu thụ (kWh)
                  </label>
                  <input
                    type="number" required
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-4 text-white font-bold text-lg focus:border-primary outline-none"
                    placeholder="VD: 30"
                    value={currentReadings.electricity}
                    onChange={e => setCurrentReadings({ ...currentReadings, electricity: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted flex items-center gap-1 uppercase">
                    <Droplet size={10} className="text-blue-400" /> Số nước tiêu thụ (m³)
                  </label>
                  <input
                    type="number" required
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-4 text-white font-bold text-lg focus:border-primary outline-none"
                    placeholder="VD: 2"
                    value={currentReadings.water}
                    onChange={e => setCurrentReadings({ ...currentReadings, water: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted flex items-center gap-1 uppercase">
                  <Camera size={10} /> Ảnh chụp chứng minh
                </label>
                <div className="border border-white/10 rounded-2xl p-6 text-center bg-white/5 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-muted">
                    <Camera size={20} />
                  </div>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Bấm để tải ảnh</p>
                </div>
              </div>

              {(() => {
                const previewElecUsage = Number(currentReadings.electricity) || 0;
                const previewWaterUsage = Number(currentReadings.water) || 0;
                const previewExtraServices = extraServices.filter(s => s.name.trim() !== '' && (Number(s.cost) || 0) > 0);
                
                if (previewElecUsage > 0 || previewWaterUsage > 0 || extraServices.length > 0) {
                  const previewElecCost = previewElecUsage * configPrices.electricity;
                  const previewWaterCost = previewWaterUsage * configPrices.water;
                  const previewRoomCost = selectedTenant.roomPrice ? Number(selectedTenant.roomPrice) : configPrices.room;
                  const previewExtraCost = previewExtraServices.reduce((sum, s) => sum + Number(s.cost), 0);
                  const previewTotal = previewRoomCost + previewElecCost + previewWaterCost + previewExtraCost;

                  return (
                    <div style={{ marginTop: '24px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#94a3b8', flex: 1, whiteSpace: 'nowrap' }}>Tiền phòng</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{previewRoomCost.toLocaleString()}đ</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#94a3b8', flex: 1, whiteSpace: 'nowrap' }}>Điện {previewElecUsage > 0 && `(${previewElecUsage} kWh)`}</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{previewElecCost.toLocaleString()}đ</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#94a3b8', flex: 1, whiteSpace: 'nowrap' }}>Nước {previewWaterUsage > 0 && `(${previewWaterUsage} m³)`}</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{previewWaterCost.toLocaleString()}đ</span>
                      </div>

                      {extraServices.map((service, index) => (
                        <div key={service.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '8px' }} className="animate-slide-up">
                          {service.isSaved ? (
                            <>
                              <span style={{ fontSize: '13px', color: '#94a3b8', flex: 1, whiteSpace: 'nowrap' }}>{service.name}</span>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{Number(service.cost).toLocaleString()}đ</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newServices = [...extraServices];
                                  newServices[index].isSaved = false;
                                  setExtraServices(newServices);
                                }}
                                style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setExtraServices(extraServices.filter(s => s.id !== service.id))}
                                style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <input
                                type="text"
                                placeholder="Tên DV (VD: Rác...)"
                                value={service.name}
                                onChange={e => {
                                  const newServices = [...extraServices];
                                  newServices[index].name = e.target.value;
                                  setExtraServices(newServices);
                                }}
                                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '13px', outline: 'none' }}
                              />
                              <input
                                type="text"
                                placeholder="Phí (đ)"
                                value={service.cost ? Number(service.cost).toLocaleString() : ''}
                                onChange={e => {
                                  const rawValue = e.target.value.replace(/\D/g, '');
                                  const newServices = [...extraServices];
                                  newServices[index].cost = rawValue;
                                  setExtraServices(newServices);
                                }}
                                style={{ width: '90px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '13px', textAlign: 'right', outline: 'none' }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!service.name.trim() || !service.cost) return alert('Vui lòng nhập tên và phí dịch vụ!');
                                  const newServices = [...extraServices];
                                  newServices[index].isSaved = true;
                                  setExtraServices(newServices);
                                }}
                                style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => setExtraServices(extraServices.filter(s => s.id !== service.id))}
                                style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      ))}

                      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#94a3b8', flex: 1, whiteSpace: 'nowrap', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}>Dịch vụ bổ sung</span>
                        <button
                          type="button"
                          onClick={() => setExtraServices([...extraServices, { id: Date.now() + Math.random(), name: '', cost: '', isSaved: false }])}
                          style={{ background: 'none', border: 'none', color: '#f97316', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.05em' }}
                        >
                          + Thêm dịch vụ
                        </button>
                      </div>

                      <div style={{ padding: '8px 0 0 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                          <span style={{ fontSize: '12px', color: '#475569' }}>→ Chi phí điện ({previewElecUsage} × {configPrices.electricity.toLocaleString()}đ)</span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{previewElecCost.toLocaleString()}đ</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                          <span style={{ fontSize: '12px', color: '#475569' }}>→ Chi phí nước ({previewWaterUsage} × {configPrices.water.toLocaleString()}đ)</span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{previewWaterCost.toLocaleString()}đ</span>
                        </div>
                      </div>

                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>TỔNG CỘNG</span>
                        <span style={{ fontSize: '26px', fontWeight: 900, color: '#f97316' }}>{previewTotal.toLocaleString()}đ</span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <button type="submit" className="btn-primary w-full py-5 rounded-2xl shadow-lg mt-4">
                Tạo hóa đơn
              </button>
            </form>
          </div>
        </div>
      )}

      <InvoiceDetailModal
        bill={viewingBill}
        onClose={() => setViewingBill(null)}
        onUpdateStatus={handleUpdateStatus}
        onSave={handleSaveBill}
        prices={configPrices}
      />
    </div>
  );
};

export default Billing;
