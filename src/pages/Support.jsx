import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { 
  Headset, ChevronLeft, Plus, 
  CheckCircle2, AlertCircle, 
  X, User, Home, Calendar, MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Support Detail Modal (Billing Style Portal) ───────────────────────────────
const SupportDetailModal = ({ request, onClose, onUpdateStatus, userRole }) => {
  if (!request) return null;

  const isResolved = request.status === 'resolved';

  const handleResolve = () => {
    onUpdateStatus(request.id, { status: 'resolved' });
    onClose();
  };

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
      <div
        onClick={e => e.stopPropagation()}
        className="animate-slide-up"
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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 900, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 6px 0' }}>
              Chi tiết yêu cầu
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>
                Phòng {request.room}
              </h2>
              <span style={{
                fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '8px',
                background: isResolved ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                color: isResolved ? '#22c55e' : '#f59e0b',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                border: `1px solid ${isResolved ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`
              }}>
                {isResolved ? 'Đã xử lý' : 'Đang xử lý'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#f97316' }}>
              <MessageSquare size={16} />
              <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mô tả sự cố</span>
            </div>
            <p style={{ color: 'white', fontSize: '15px', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
              {request.description}
            </p>
          </div>
          
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8' }}>
                <Calendar size={14} />
                <span style={{ fontSize: '13px' }}>Ngày báo cáo: {request.date}</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8' }}>
                <User size={14} />
                <span style={{ fontSize: '13px' }}>Người gửi: {request.createdBy}</span>
             </div>
          </div>
        </div>

        {/* Actions - BILLING STYLE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {userRole === 'admin' && !isResolved && (
            <button
              onClick={handleResolve}
              style={{
                width: '100%', padding: '18px', borderRadius: '20px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none', color: 'white', fontWeight: 900,
                fontSize: '14px', cursor: 'pointer',
                boxShadow: '0 10px 25px -5px rgba(16,185,129,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}
            >
              <CheckCircle2 size={18} />
              Xác nhận đã giải quyết
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
    </div>,
    document.body
  );
};

// ─── Main Support Component ──────────────────────────────────────────────────
const Support = ({ user, tenants = [], supportRequests = [], onUpdateStatus, onAddRequest, onOpenSupportModal }) => {
  const navigate = useNavigate();
  const [viewingRequest, setViewingRequest] = useState(null);

  // Filter requests: Members only see their own room's requests, Admin sees all
  const filteredRequests = user.role === 'admin' 
    ? supportRequests 
    : supportRequests.filter(r => r.room === user.room);

  return (
    <div className="animate-slide-up pb-20">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Hỗ trợ</h1>
            <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-60">
              {filteredRequests.filter(r => r.status !== 'resolved').length} yêu cầu đang xử lý
            </p>
          </div>
        </div>
        <button 
          onClick={onOpenSupportModal}
          className="w-12 h-12 flex items-center justify-center rounded-2xl text-white shadow-xl shadow-primary/40 transition-all active:scale-90 border border-white/10"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </header>

      <div className="space-y-3">
        {filteredRequests.length > 0 ? (
          filteredRequests.map(request => {
            const isResolved = request.status === 'resolved';
            
            return (
              <button
                key={request.id} 
                onClick={() => setViewingRequest(request)}
                className="glass-card !m-0 transition-all active:scale-[0.98]"
                style={{
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '16px 20px',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                {/* Left Section: Icon + Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: '42px',
                    background: isResolved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: isResolved ? '#10b981' : '#f59e0b'
                  }}>
                    {isResolved ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 3px 0', color: 'white' }}>
                      Phòng {request.room} • {request.date}
                    </p>
                    <p className="truncate" style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, maxWidth: '200px' }}>
                      {request.description}
                    </p>
                  </div>
                </div>

                {/* Right Section: Status Badge */}
                <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '12px' }}>
                  <span style={{
                    fontSize: '9px', fontWeight: 900,
                    padding: '3px 9px', borderRadius: '6px',
                    background: isResolved ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                    color: isResolved ? '#10b981' : '#f59e0b',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    border: `1px solid ${isResolved ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`
                  }}>
                    {isResolved ? 'Đã xử lý' : 'Đang xử lý'}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[40px] bg-white/2">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-muted/20">
              <Headset size={32} />
            </div>
            <p className="text-muted font-bold italic opacity-50">Không có yêu cầu hỗ trợ nào</p>
          </div>
        )}
      </div>

      {/* Support Detail Modal (Portal) */}
      <SupportDetailModal 
        request={viewingRequest} 
        onClose={() => setViewingRequest(null)}
        onUpdateStatus={onUpdateStatus}
        userRole={user.role}
      />
    </div>
  );
};

export default Support;
