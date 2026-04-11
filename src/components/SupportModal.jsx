import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, MessageSquare, ChevronDown, Send, Search, Receipt, CheckCircle2, ChevronRight } from 'lucide-react';

const SupportModal = ({ isOpen, onClose, onSave, user, tenants = [] }) => {
  const [formData, setFormData] = useState({
    room: user?.role === 'admin' ? '' : (user?.room || ''),
    description: ''
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchRoom, setSearchRoom] = useState('');
  const dropdownRef = useRef(null);

  // Group tenants by room (Billing logic)
  const roomsData = useMemo(() => {
    const data = {};
    tenants.forEach(t => {
      if (!data[t.room]) data[t.room] = [];
      data[t.room].push(t.name);
    });
    
    // Support all rooms if needed, but primarily focus on rooms with tenants/activity
    const allRoomsList = [
      '101', '102', '103', '104', '105', '106',
      '201', '202', '203', '204', '205', '206', '207',
      '301', '302', '303', '304', '305', '306', '307'
    ];

    return allRoomsList.map(roomNum => ({
      room: roomNum,
      occupants: data[roomNum] || [],
    })).sort((a, b) => a.room.localeCompare(b.room, undefined, { numeric: true }));
  }, [tenants]);

  const filteredResults = useMemo(() => {
    if (!searchRoom.trim()) return [];
    return roomsData.filter(r =>
      r.room.toLowerCase().includes(searchRoom.toLowerCase()) ||
      r.occupants.some(name => name.toLowerCase().includes(searchRoom.toLowerCase()))
    ).slice(0, 5); // Limit results for clean UI
  }, [roomsData, searchRoom]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        room: user?.role === 'admin' ? '' : (user?.room || ''),
        description: ''
      });
      setSearchRoom('');
      setIsDropdownOpen(false);
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync room if user is member
  useEffect(() => {
    if (user?.role !== 'admin' && user?.room) {
      setFormData(prev => ({ ...prev, room: user.room }));
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSelectRoom = (roomNum) => {
    setFormData({ ...formData, room: roomNum });
    setIsDropdownOpen(false);
    setSearchRoom('');
  };

  const isValidRoom = roomsData.some(r => r.room === formData.room);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.room || !formData.description) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!isValidRoom && user.role === 'admin') {
      alert(`Phòng "${formData.room}" không tồn tại trong hệ thống. Vui lòng kiểm tra lại!`);
      return;
    }

    const newRequest = {
      ...formData,
      id: Date.now(),
      status: 'pending',
      date: new Date().toLocaleDateString('vi-VN'),
      timestamp: Date.now(),
      createdBy: user.name,
      userId: user.id || user.name 
    };

    onSave(newRequest);
    setFormData({
      room: user?.role === 'admin' ? '' : (user?.room || ''),
      description: ''
    });
    onClose();
  };

  return (
    <div className="modal-overlay !z-[9999]">
      <div className="modal-content animate-modal !h-fit !pb-10 !bg-[#0f172a] !border-orange-600/30 overflow-visible">
        {/* Header - Identical to TenantModal */}
        <div className="flex justify-between items-start mb-8 sticky top-0 bg-[#0f172a]/95 backdrop-blur-md z-10 py-2">
          <div>
            <h2 className="text-2xl font-bold text-gradient">Báo cáo sự cố</h2>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Trang hỗ trợ cư dân</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl text-muted hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Selection - 1:1 MATCHING BILLING SECTION */}
          <section style={{ position: 'relative', zIndex: isDropdownOpen ? 1000 : 50 }} ref={dropdownRef}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 className="form-label" style={{ margin: 0 }}>Số phòng</h2>
            </div>

            <button
              type="button"
              disabled={user.role !== 'admin' && user.room}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="glass-card"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                marginBottom: '0',
                border: isDropdownOpen ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ color: 'var(--primary)', transition: 'transform 0.3s' }} className={isDropdownOpen ? 'scale-110' : ''}>
                  <Receipt size={24} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '12px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                    CHỌN PHÒNG
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', opacity: 0.8, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {formData.room ? `PHÒNG ${formData.room}` : 'Bấm để nhập số phòng...'}
                    {isValidRoom && formData.room && <CheckCircle2 size={14} className="text-emerald-500" />}
                  </p>
                </div>
              </div>
              <ChevronDown 
                style={{ color: 'var(--primary)', transition: 'transform 0.3s', transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }} 
                size={24} 
              />
            </button>

            {/* Dropdown with Result Items - 1:1 MATCHING BILLING UI */}
            {isDropdownOpen && (
              <div className="dropdown-menu animate-slide-up" style={{
                position: 'absolute', top: 'calc(100% + 10px)', left: 0, right: 0, zIndex: 2000, padding: '16px',
                background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
              }}>
                {/* Search Bar */}
                <div className="search-wrapper" style={{ marginBottom: filteredResults.length > 0 ? '16px' : '0' }}>
                  <Search className="icon" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm số phòng hoặc tên khách..."
                    value={searchRoom}
                    onChange={(e) => setSearchRoom(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '12px 12px 12px 40px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Result Items - Only shown when typing */}
                {filteredResults.length > 0 && (
                  <div className="custom-scrollbar" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {filteredResults.map(roomInfo => (
                      <button
                        key={roomInfo.room}
                        type="button"
                        onClick={() => handleSelectRoom(roomInfo.room)}
                        style={{
                          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '14px', borderRadius: '12px', background: 'transparent',
                          border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                          textAlign: 'left', transition: 'all 0.2s'
                        }}
                        className="dropdown-item-hover group"
                      >
                        <div>
                          <p style={{ fontSize: '15px', fontWeight: '900', color: 'white', margin: '0 0 2px 0' }}>PHÒNG {roomInfo.room}</p>
                          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                            {roomInfo.occupants.length > 0 ? roomInfo.occupants.join(', ') : 'Phòng trống'}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {roomInfo.occupants.length > 0 && (
                            <span style={{
                              fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '8px',
                              background: 'rgba(249,115,22,0.15)', color: '#f97316',
                              textTransform: 'uppercase', letterSpacing: '0.1em',
                              border: '1px solid rgba(249,115,22,0.3)'
                            }}>
                              {roomInfo.occupants.length} người
                            </span>
                          )}
                          <ChevronRight size={18} style={{ color: '#f97316', opacity: 0.5 }} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {searchRoom && filteredResults.length === 0 && (
                  <p style={{ fontSize: '10px', color: '#f43f5e', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '12px', textAlign: 'center' }}>
                    Không tìm thấy kết quả
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Incident Description */}
          <div className="form-group border-b border-white/5 pb-4" style={{ position: 'relative', zIndex: 10 }}>
            <label className="form-label !mb-1.5">Mô tả sự cố</label>
            <div className="input-icon-wrapper flex items-start">
              <MessageSquare size={18} className="input-icon mt-4" />
              <textarea
                required
                rows={4}
                placeholder="Bạn đang gặp vấn đề gì? Hãy mô tả chi tiết tại đây..."
                className="form-input !bg-transparent resize-none h-32 py-4 pl-12"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary w-full py-5 group overflow-hidden relative">
            <span className="flex items-center justify-center gap-2 group-active:scale-95 transition-transform z-10 relative font-black uppercase tracking-widest text-sm text-white">
              <Send size={20} /> Gửi yêu cầu hỗ trợ
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupportModal;
