import React from 'react';
import { 
  Building2, MapPin, CheckCircle2, Clock, 
  ChevronRight, LogOut, User, Sparkles, ArrowRight,
  Flame, Lock, Calendar, Shield, Home
} from 'lucide-react';

export const BRANCHES = [
  {
    id: 'bnb1',
    code: 'BNB',
    name: 'Cơ sở 1: BNB',
    fullName: 'Trọ BNB - 04 Dương Thiệu Tước',
    address: '04 Dương Thiệu Tước, TP. Huế',
    totalRooms: 18,
    status: 'active', // 'active' | 'not_started' | 'tbd'
    statusLabel: 'Đang hoạt động',
    estDate: 'Hiện tại',
    isLit: true,
    description: 'Cơ sở chính 18 phòng, đầy đủ hệ thống quản lý điện nước & hóa đơn.'
  },
  {
    id: 'tnd2',
    code: 'TND',
    name: 'Cơ sở 2: TND',
    fullName: 'Trọ TND - 29B Nguyễn Hữu Cảnh',
    address: '29B Nguyễn Hữu Cảnh, TP. Huế',
    totalRooms: 15,
    status: 'not_started',
    statusLabel: 'Chưa hoạt động',
    estDate: 'Est. 12/2026',
    isLit: false,
    description: 'Cơ sở 15 phòng, đang chuẩn bị hoàn thiện hệ thống & hạ tầng.'
  },
  {
    id: 'tbd3',
    code: 'TBD',
    name: 'Cơ sở 3: TBD',
    fullName: 'Cơ sở 3 (TBD)',
    address: 'Vị trí đang cập nhật',
    totalRooms: 20,
    status: 'tbd',
    statusLabel: 'TBD',
    estDate: 'Est. 12/2033',
    isLit: false,
    description: 'Dự án mở rộng chuỗi phòng trọ trong kế hoạch dài hạn.'
  },
  {
    id: 'tbd4',
    code: 'TBD',
    name: 'Cơ sở 4: TBD',
    fullName: 'Cơ sở 4 (TBD)',
    address: 'Vị trí đang cập nhật',
    totalRooms: 20,
    status: 'tbd',
    statusLabel: 'TBD',
    estDate: 'Est. 12/2036',
    isLit: false,
    description: 'Dự án mở rộng chuỗi phòng trọ trong kế hoạch dài hạn.'
  },
  {
    id: 'tbd5',
    code: 'TBD',
    name: 'Cơ sở 5: TBD',
    fullName: 'Cơ sở 5 (TBD)',
    address: 'Vị trí đang cập nhật',
    totalRooms: 20,
    status: 'tbd',
    statusLabel: 'TBD',
    estDate: 'Est. 12/2039',
    isLit: false,
    description: 'Dự án mở rộng chuỗi phòng trọ trong kế hoạch dài hạn.'
  },
  {
    id: 'tbd6',
    code: 'TBD',
    name: 'Cơ sở 6: TBD',
    fullName: 'Cơ sở 6 (TBD)',
    address: 'Vị trí đang cập nhật',
    totalRooms: 20,
    status: 'tbd',
    statusLabel: 'TBD',
    estDate: 'Est. 12/2042',
    isLit: false,
    description: 'Dự án mở rộng chuỗi phòng trọ trong kế hoạch dài hạn.'
  }
];

// Clean, Beautiful Building Icon with Clear Lighting Effect
const BuildingIllustration = ({ isLit }) => {
  return (
    <div 
      className="relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
      style={{
        background: isLit 
          ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.22), rgba(245, 158, 11, 0.08))' 
          : 'rgba(255, 255, 255, 0.03)',
        border: isLit ? '1.5px solid rgba(249, 115, 22, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isLit ? '0 0 20px -2px rgba(249, 115, 22, 0.35)' : 'none'
      }}
    >
      {/* Lit ambient glow */}
      {isLit && (
        <div 
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Clear vector house graphic */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="relative z-10">
        {/* Roof */}
        <path 
          d="M16 3.5L3 13.5H29L16 3.5Z" 
          fill={isLit ? '#ea580c' : '#1e293b'}
          stroke={isLit ? '#f97316' : '#475569'}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Chimney */}
        <path 
          d="M23 7V10.5H26V5.5H23V7Z" 
          fill={isLit ? '#c2410c' : '#0f172a'} 
          stroke={isLit ? '#ea580c' : '#334155'}
          strokeWidth="1"
        />
        {/* Main Walls */}
        <rect 
          x="6" y="13.5" width="20" height="15" rx="1.5" 
          fill={isLit ? '#0f172a' : '#090d16'} 
          stroke={isLit ? '#f97316' : '#334155'} 
          strokeWidth="1.5" 
        />
        {/* Left Window */}
        <rect 
          x="8.5" y="16.5" width="5" height="4.5" rx="0.8" 
          fill={isLit ? '#fef08a' : '#1e293b'} 
          stroke={isLit ? '#f59e0b' : '#334155'}
          strokeWidth="0.8"
          style={{
            filter: isLit ? 'drop-shadow(0 0 3px #fbbf24)' : 'none'
          }}
        />
        {/* Right Window */}
        <rect 
          x="18.5" y="16.5" width="5" height="4.5" rx="0.8" 
          fill={isLit ? '#fef08a' : '#1e293b'} 
          stroke={isLit ? '#f59e0b' : '#334155'}
          strokeWidth="0.8"
          style={{
            filter: isLit ? 'drop-shadow(0 0 3px #fbbf24)' : 'none'
          }}
        />
        {/* Doorway */}
        <path 
          d="M13.5 28.5V23C13.5 22.4477 13.9477 22 14.5 22H17.5C18.0523 22 18.5 22.4477 18.5 23V28.5H13.5Z" 
          fill={isLit ? '#fbbf24' : '#1e293b'} 
          stroke={isLit ? '#f59e0b' : '#334155'}
          strokeWidth="0.8"
          style={{
            filter: isLit ? 'drop-shadow(0 0 4px rgba(251,191,36,0.8))' : 'none'
          }}
        />
      </svg>
    </div>
  );
};

const Landing = ({ user, onSelectBranch, onLogout, tenants = [] }) => {
  return (
    <div className="animate-slide-up pb-16 pt-2 px-1">
      {/* Top Welcome Header */}
      <header className="mb-5 flex justify-between items-center">
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em] block mb-1">
            Hệ thống quản lý chuỗi trọ
          </span>
          <h1 className="text-2xl font-black text-gradient">Danh sách cơ sở</h1>
        </div>

        <button
          onClick={onLogout}
          title="Đăng xuất"
          className="w-10 h-10 rounded-2xl bg-white-5 border border-white-10 flex items-center justify-center text-rose-400 active:scale-95 transition-all shadow-black-40"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Admin Info Banner */}
      <div className="glass-card mb-5 p-4 flex items-center gap-3.5 border border-white-10">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 flex-shrink-0">
          <User size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white truncate">{user?.name || 'Quản lý Kaito'}</h2>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
              {user?.role === 'admin' ? 'Admin' : 'Member'}
            </span>
          </div>
          <p className="text-xs text-muted truncate mt-0.5">Chọn 1 trong 6 cơ sở bên dưới để quản lý</p>
        </div>
      </div>

      {/* 6 Facilities Banners List */}
      <div className="space-y-3.5">
        {BRANCHES.map((branch, index) => {
          const isActive = branch.status === 'active';
          const isNotStarted = branch.status === 'not_started';
          const isTbd = branch.status === 'tbd';

          return (
            <div
              key={branch.id}
              onClick={isActive ? () => onSelectBranch(branch.id) : undefined}
              className={`glass-card !mb-0 p-4 relative overflow-hidden transition-all duration-300 ${
                isActive 
                  ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]' 
                  : 'cursor-not-allowed opacity-70'
              }`}
              style={{
                border: isActive 
                  ? '1.5px solid rgba(249, 115, 22, 0.45)' 
                  : '1px solid rgba(255, 255, 255, 0.07)',
                background: isActive 
                  ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95))' 
                  : isNotStarted 
                    ? 'linear-gradient(145deg, rgba(20, 28, 45, 0.6), rgba(10, 15, 29, 0.75))'
                    : 'rgba(15, 23, 42, 0.45)',
                boxShadow: isActive 
                  ? '0 10px 30px -8px rgba(249, 115, 22, 0.25)' 
                  : 'none'
              }}
            >
              {/* Active Golden Ambient Glow */}
              {isActive && (
                <div 
                  style={{
                    position: 'absolute',
                    top: -20, right: -20,
                    width: '140px', height: '140px',
                    background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, rgba(245,158,11,0.05) 50%, transparent 80%)',
                    pointerEvents: 'none'
                  }}
                />
              )}

              {/* Status Header */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">
                  CƠ SỞ #{index + 1}
                </span>

                {/* Status Badge */}
                {isActive && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 900,
                      padding: '3px 9px',
                      borderRadius: '8px',
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#22c55e',
                      border: '1px solid rgba(34, 197, 94, 0.35)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      boxShadow: '0 0 12px rgba(34, 197, 94, 0.25)'
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Đang hoạt động
                  </span>
                )}

                {isNotStarted && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: '8px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: '#f59e0b',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      letterSpacing: '0.05em'
                    }}
                  >
                    <Clock size={11} />
                    {branch.estDate}
                  </span>
                )}

                {isTbd && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: '8px',
                      background: 'rgba(148, 163, 184, 0.08)',
                      color: '#94a3b8',
                      border: '1px solid rgba(148, 163, 184, 0.15)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      letterSpacing: '0.05em'
                    }}
                  >
                    <Calendar size={11} />
                    {branch.estDate}
                  </span>
                )}
              </div>

              {/* Main Content Row */}
              <div className="flex items-center gap-4">
                {/* Visual House Illustration */}
                <BuildingIllustration isLit={branch.isLit} />

                {/* Info Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-black text-white tracking-wide truncate mb-1">
                    {branch.name}
                  </h3>
                  <p className="text-xs text-muted truncate mb-2">
                    {branch.address}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                      🏢 {branch.totalRooms} phòng
                    </span>

                    {isActive ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        👥 {tenants.length} khách thuê
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10">
                        {isNotStarted ? '🛠️ Đang chuẩn bị' : '🔒 Chưa mở'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status indicator (Arrow for active, Lock for inactive) */}
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform"
                  style={{
                    background: isActive ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.02)',
                    color: isActive ? '#f97316' : '#475569',
                    border: isActive ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  {isActive ? <ChevronRight size={16} /> : <Lock size={13} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center">
        <p className="text-[10px] text-muted opacity-40 uppercase tracking-[0.2em] font-bold">
          Hệ thống quản lý chuỗi trọ • Kaito v2.0
        </p>
      </footer>
    </div>
  );
};

export default Landing;
