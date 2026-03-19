import React from 'react';
import { User, Shield, Home, LogOut, ChevronRight, Settings, Download, Upload, RefreshCw } from 'lucide-react';

const Profile = ({ user, onLogout, tenants, bills, onRestoreData }) => {
  const handleExport = () => {
    const data = {
      tenants,
      bills,
      version: '1.0.4',
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kaito_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.tenants || data.bills) {
          if (window.confirm('Bạn có chắc chắn muốn ghi đè dữ liệu hiện tại bằng bản sao lưu này không?')) {
            onRestoreData(data.tenants || [], data.bills || []);
            alert('Khôi phục dữ liệu thành công!');
          }
        } else {
          alert('File không đúng định dạng lưu trữ của Kaito.');
        }
      } catch (err) {
        alert('Lỗi khi đọc file backup. Vui lòng kiểm tra lại.');
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreSample = () => {
    if (window.confirm('Hệ thống sẽ thêm dữ liệu khách thuê mẫu để bạn tham khảo. Tiếp tục?')) {
      const sampleTenants = [
        { id: 1710600000001, name: 'Nguyễn Văn Kaito', room: '101', phone: '0912 345 678', contractDate: '2024-01-10', occupation: 'Developer', deposit: '3000000' },
        { id: 1710600000002, name: 'Trần Thị Bông', room: '201', phone: '0988 776 655', contractDate: '2024-01-15', occupation: 'Kế toán', deposit: '3000000' },
        { id: 1710600000003, name: 'Lê Văn Nam', room: '305', phone: '0905 123 456', contractDate: '2024-02-01', occupation: 'Sinh viên', deposit: '1500000' }
      ];
      onRestoreData([...tenants, ...sampleTenants], bills);
    }
  };
  return (
    <div className="profile-container animate-slide-up">
      <header className="profile-header">
        <h1 className="profile-title">Cá nhân</h1>
        <p className="profile-subtitle">Thông tin tài khoản</p>
      </header>

      {/* Main Profile Card */}
      <div className="profile-card">
        <div className="avatar-section">
          <div className="avatar-wrapper">
            <div className="avatar-glow"></div>
            <div className="avatar-circle">
              <User size={40} className="avatar-icon" />
            </div>
            <div className="status-badge">
              <Shield size={10} className="status-icon" />
            </div>
          </div>
          <div className="user-meta">
            <h2 className="user-name">{user.name}</h2>
            <div className="role-chip">
              {user.role === 'admin' ? 'Quản trị viên' : 'Khách thuê'}
            </div>
          </div>
        </div>
      </div>

      {/* Info List */}
      <div className="info-list">
        <div className="list-header">Thông tin chi tiết</div>

        <div className="list-item">
          <div className="item-left">
            <div className="icon-box">
              <User size={16} />
            </div>
            <span className="item-label">Tên đăng nhập</span>
          </div>
          <span className="item-value">{user.username}</span>
        </div>

        {user.role === 'member' && (
          <div className="list-item">
            <div className="item-left">
              <div className="icon-box">
                <Home size={16} />
              </div>
              <span className="item-label">Số phòng</span>
            </div>
            <span className="item-value">Phòng {user.room}</span>
          </div>
        )}

        <div className="list-item">
          <div className="item-left">
            <div className="icon-box">
              <Shield size={16} />
            </div>
            <span className="item-label">Quyền hạn</span>
          </div>
          <div className="item-right">
            <span className="item-value" style={{ textTransform: 'capitalize' }}>{user.role}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="action-grid">

        <button onClick={onLogout} className="action-button logout">
          <div className="button-content">
            <div className="button-icon-box danger">
              <LogOut size={18} />
            </div>
            <span className="button-text">Đăng xuất khỏi hệ thống</span>
          </div>
        </button>
      </div>

      <style>{`
        .profile-container {
          padding-bottom: 40px;
          color: #f8fafc;
          font-family: 'Times New Roman', Times, serif;
        }

        .profile-header {
          margin-bottom: 24px;
        }

        .profile-title {
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 2px;
        }

        .profile-subtitle {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .profile-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          padding: 24px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }

        .avatar-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .avatar-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .avatar-glow {
          position: absolute;
          inset: -10px;
          background: rgba(249, 115, 22, 0.15);
          filter: blur(20px);
          border-radius: 50%;
        }

        .avatar-circle {
          position: relative;
          width: 72px;
          height: 72px;
          background: rgba(15, 23, 42, 0.6);
          border: 1.5px solid rgba(249, 115, 22, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-icon {
          color: #f97316;
        }

        .status-badge {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 22px;
          height: 22px;
          background: #10b981;
          border: 3px solid #0f172a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .user-meta {
          flex: 1;
        }

        .user-name {
          font-size: 20px;
          font-weight: 800;
          color: white;
          margin-bottom: 4px;
        }

        .role-chip {
          display: inline-flex;
          padding: 4px 12px;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 100px;
          font-size: 9px;
          font-weight: 800;
          color: #f97316;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .info-list {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          overflow: hidden;
          margin-bottom: 24px;
        }

        .list-header {
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .list-item {
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .list-item:last-child {
          border-bottom: none;
        }

        .item-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-box {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .item-label {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .item-value {
          font-size: 14px;
          font-weight: 700;
          color: white;
        }

        .item-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chevron {
          color: rgba(255, 255, 255, 0.1);
        }

        .action-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-button {
          width: 100%;
          padding: 18px 24px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-button:active {
          transform: scale(0.98);
          background: rgba(255, 255, 255, 0.06);
        }

        .button-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .button-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .button-icon-box.settings {
          background: rgba(99, 102, 241, 0.1);
          color: #818cf8;
        }

        .button-icon-box.danger {
          background: rgba(244, 63, 94, 0.1);
          color: #fb7185;
        }

        .button-text {
          font-weight: 700;
          color: #f1f5f9;
          font-size: 15px;
        }

        .action-button.logout {
          background: rgba(244, 63, 94, 0.03);
          border-color: rgba(244, 63, 94, 0.1);
        }

        .action-button.logout .button-text {
          color: #fb7185;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .animate-slide-up {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Profile;
