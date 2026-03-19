import React, { useState, useEffect } from 'react';
import { X, Save, User, Hash, Calendar, Phone, ShieldCheck, HeartPulse, Building2, Wallet, AlertCircle } from 'lucide-react';

const TenantModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    room: '',
    birthYear: '',
    phone: '',
    relativePhone: '',
    contractDate: new Date().toISOString().split('T')[0],
    occupation: '',
    deposit: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        room: '',
        birthYear: '',
        phone: '',
        relativePhone: '',
        contractDate: new Date().toISOString().split('T')[0],
        occupation: '',
        deposit: ''
      });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isValidRoom = (room) => {
    const roomNum = parseInt(room);
    if (isNaN(roomNum)) return false;
    
    // Tầng 1: 101-106
    if (roomNum >= 101 && roomNum <= 106) return true;
    // Tầng 2: 201-207
    if (roomNum >= 201 && roomNum <= 207) return true;
    // Tầng 3: 301-307
    if (roomNum >= 301 && roomNum <= 307) return true;
    
    return false;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isValidRoom(formData.room)) {
      setError(`SỐ PHÒNG ${formData.room} KHÔNG HỢP LỆ!`);
      return;
    }

    onSave({ ...formData, id: Date.now() });
    onClose();
  };

  const formatVND = (value) => {
    if (!value) return '';
    const number = value.toString().replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleDepositChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, deposit: rawValue });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-modal max-h-[90vh] overflow-y-auto !bg-[#0f172a] !border-rose-600/30 shadow-2xl">
        <div className="flex-between mb-8 sticky top-0 bg-[#0f172a]/95 backdrop-blur-md z-10 py-2">
          <div>
            <h2 className="text-2xl font-bold text-gradient">Khách thuê mới</h2>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Thông tin đăng ký phòng</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl text-muted hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="error-alert animate-shake !mb-10">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-lg">
              <X className="text-[#f43f5e]" size={28} strokeWidth={4} />
            </div>
            <div>
              <p className="text-[16px] font-black text-white leading-none tracking-tight uppercase">{error}</p>
              <p className="text-[11px] font-black text-white/90 mt-1 uppercase tracking-widest">VUI LÒNG KIỂM TRA LẠI SƠ ĐỒ</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-grid-2">
            <div className="form-group border-b border-white/5 pb-2">
              <label className="form-label !mb-1.5">Họ và tên</label>
              <div className="input-icon-wrapper">
                <User size={18} className="input-icon" />
                <input 
                  required 
                  className="form-input !bg-transparent"
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group border-b border-white/5 pb-2">
              <label className="form-label !mb-1.5">Năm sinh</label>
              <div className="input-icon-wrapper">
                <Calendar size={18} className="input-icon" />
                <input 
                  type="number"
                  className="form-input !bg-transparent"
                  placeholder="2000"
                  value={formData.birthYear}
                  onChange={e => setFormData({...formData, birthYear: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group border-b border-white/5 pb-2">
              <label className="form-label !mb-1.5">Số phòng</label>
              <div className="input-icon-wrapper">
                <Hash size={18} className={`input-icon ${error ? 'text-rose-500' : ''}`} />
                <input 
                  required 
                  className={`form-input !bg-transparent ${error ? 'text-rose-600 font-black' : ''}`}
                  placeholder="101"
                  value={formData.room}
                  onChange={e => {
                    setFormData({...formData, room: e.target.value});
                    if (error) setError('');
                  }}
                />
              </div>
            </div>
            <div className="form-group border-b border-white/5 pb-2">
              <label className="form-label !mb-1.5">Ngày thuê</label>
              <div className="input-icon-wrapper">
                <Calendar size={18} className="input-icon" />
                <input 
                  type="date"
                  required
                  className="form-input !bg-transparent"
                  value={formData.contractDate}
                  onChange={e => setFormData({...formData, contractDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group border-b border-white/5 pb-2">
              <label className="form-label !mb-1.5">SĐT liên hệ</label>
              <div className="input-icon-wrapper">
                <Phone size={18} className="input-icon" />
                <input 
                  type="tel"
                  className="form-input !bg-transparent"
                  placeholder="0912..."
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group border-b border-white/5 pb-2">
              <label className="form-label !mb-1.5">SĐT người thân</label>
              <div className="input-icon-wrapper">
                <HeartPulse size={18} className="input-icon" />
                <input 
                  type="tel"
                  className="form-input !bg-transparent"
                  placeholder="0988..."
                  value={formData.relativePhone}
                  onChange={e => setFormData({...formData, relativePhone: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="form-group border-b border-white/5 pb-2">
            <label className="form-label !mb-1.5">Trường học / Nghề nghiệp</label>
            <div className="input-icon-wrapper">
              <Building2 size={18} className="input-icon" />
              <input 
                className="form-input !bg-transparent"
                placeholder="VD: ĐH Công nghệ / Kỹ sư"
                value={formData.occupation}
                onChange={e => setFormData({...formData, occupation: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group border-b border-white/5 pb-2">
            <label className="form-label !mb-1.5">Số tiền đặt cọc</label>
            <div className="input-icon-wrapper">
              <Wallet size={18} className="input-icon" />
              <input 
                type="text"
                className="form-input !bg-transparent"
                style={{ paddingRight: '60px' }}
                placeholder="3.000.000"
                value={formatVND(formData.deposit)}
                onChange={handleDepositChange}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary pointer-events-none">VNĐ</span>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-5 mt-4 group overflow-hidden relative">
            <span className="flex items-center justify-center gap-2 group-active:scale-95 transition-transform z-10 relative font-black uppercase tracking-widest text-sm text-white">
              <Save size={20} /> Lưu thông tin khách thuê
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TenantModal;
