import React, { useState } from 'react';
import { LogIn, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

const BrandIcon = ({ size = 48 }) => (
  <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.4))' }}>
      <path
        d="M30 20 H65 C80 20 80 45 65 45 H35 M65 45 C85 45 85 85 65 85 H30 V20"
        fill="none"
        stroke="white"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M35 85 V65 L50 52 L65 65 V85 H35Z"
        fill="white"
      />
      <rect x="47" y="70" width="6" height="6" fill="#0a1224" rx="1" />
    </svg>
  </div>
);

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (username === 'kaito' && password === '10062024') {
      onLogin({ username: 'kaito', role: 'admin', name: 'Quản lý Kaito' });
    } else if (username === 'bong' && password === '123456') {
      onLogin({ username: 'bong', role: 'member', name: 'Bông', room: '201' });
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác');
    }
  };

  return (
    <div className="login-container">
      <div className="bg-glow-top"></div>
      <div className="bg-glow-bottom"></div>

      <div className="login-content animate-slide-up">
        {/* Compact Branding */}
        <div className="branding-section">
          <div className="icon-wrapper">
            <div className="icon-glow"></div>
            <BrandIcon size={48} />
          </div>
          <h1 className="brand-title">Nhà Trọ Online</h1>
          <p className="brand-slogan">Hệ thống quản lý nhà trọ thông minh</p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="card-header">
            <h2 className="card-title">Đăng nhập</h2>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="input-label">Tên đăng nhập</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="login-input"
                  placeholder="Username..."
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label className="input-label">Mật khẩu</label>
              </div>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-eye"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-badge animate-shake">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="submit-section">
              <button type="submit" className="login-button">
                <span>Đăng Nhập</span>
                <LogIn size={20} />
              </button>
            </div>
          </form>

          <div className="card-footer">
            <p className="footer-text">
              Chưa có tài khoản? <span className="signup-link">Đăng ký ngay</span>
            </p>
            <p className="version-tag">v1.0.4</p>
          </div>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          background: #0a1224;
          font-family: 'Times New Roman', Times, serif;
          position: relative;
          padding: 40px 24px;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }

        /* Desktop specific centering */
        @media (min-height: 700px) {
          .login-container {
            justify-content: center;
            padding: 24px;
          }
        }

        .bg-glow-top {
          position: fixed;
          top: -10%;
          left: -10%;
          width: 500px;
          height: 500px;
          background: rgba(249, 115, 22, 0.1);
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }

        .bg-glow-bottom {
          position: fixed;
          bottom: -10%;
          right: -10%;
          width: 500px;
          height: 500px;
          background: rgba(251, 191, 36, 0.05);
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }

        .login-content {
          width: 100%;
          max-width: 360px;
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.3s ease;
        }

        .branding-section {
          text-align: center;
          margin-bottom: 32px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .icon-wrapper {
          position: relative;
          margin-bottom: 12px;
        }

        .icon-glow {
          position: absolute;
          inset: 0;
          background: rgba(249, 115, 22, 0.2);
          filter: blur(24px);
          border-radius: 50%;
        }

        .brand-title {
          font-size: 32px;
          font-weight: 900;
          color: white;
          margin-bottom: 4px;
          letter-spacing: -0.02em;
        }

        .brand-slogan {
          font-size: 9px;
          font-weight: 800;
          color: rgba(249, 115, 22, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          opacity: 0.9;
        }

        .login-card {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 40px;
          padding: 32px;
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.5);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (min-width: 400px) {
          .login-card {
            padding: 40px;
          }
        }

        .card-header {
          margin-bottom: 24px;
        }

        .card-title {
          font-size: 22px;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 4px;
        }

        .input-label {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .forgot-link {
          font-size: 9px;
          font-weight: 700;
          color: #f97316;
          font-style: italic;
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .forgot-link:hover {
          opacity: 0.8;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #f97316;
          opacity: 0.6;
          transition: opacity 0.3s ease, color 0.3s ease;
        }

        .login-input {
          width: 100%;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 18px;
          padding: 18px 20px 18px 56px;
          color: white;
          font-size: 15px;
          font-weight: 700;
          outline: none;
          transition: all 0.3s ease;
        }

        .login-input:focus {
          background: #0f172a;
          border-color: rgba(249, 115, 22, 0.5);
          box-shadow: 0 0 25px rgba(249, 115, 22, 0.15);
        }

        .input-wrapper:focus-within .input-icon {
          opacity: 1;
        }

        .toggle-eye {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toggle-eye:hover {
          color: white;
        }

        .error-badge {
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.2);
          border-radius: 16px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #f43f5e;
          font-size: 11px;
          font-weight: 700;
        }

        .login-button {
          width: 100%;
          padding: 18px;
          border-radius: 20px;
          background: linear-gradient(135deg, #f97316, #fbbf24);
          color: white;
          font-weight: 900;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 15px 30px -5px rgba(249, 115, 22, 0.4);
          transition: all 0.3s ease;
        }

        .login-button:active {
          transform: scale(0.97);
          box-shadow: 0 5px 15px -5px rgba(249, 115, 22, 0.4);
        }

        .card-footer {
          margin-top: 32px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .footer-text {
          font-size: 12px;
          color: #64748b;
        }

        .signup-link {
          color: #f97316;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .signup-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        .version-tag {
          font-size: 9px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.1);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-top: 8px;
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .animate-slide-up {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default Login;
