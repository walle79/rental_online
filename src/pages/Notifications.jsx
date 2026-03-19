import React, { useState } from 'react';
import { Bell, ChevronLeft, Info, AlertTriangle, CheckCircle2, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = ({ notifications = [], onMarkAllAsRead }) => {
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'info': return <Info size={18} className="text-blue-400" />;
      case 'warning': return <AlertTriangle size={18} className="text-amber-400" />;
      case 'success': return <CheckCircle2 size={18} className="text-emerald-400" />;
      default: return <Bell size={18} className="text-primary" />;
    }
  };

  return (
    <div className="animate-slide-up">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              onMarkAllAsRead();
              navigate(-1);
            }} 
            className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl text-muted"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Thông báo</h1>
            <p className="text-muted text-xs font-bold uppercase tracking-widest mt-1">
              Bạn có {notifications.filter(n => !n.isRead).length} tin mới
            </p>
          </div>
        </div>
        <button 
          onClick={onMarkAllAsRead}
          className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-3 py-2 rounded-xl border border-primary/20"
        >
          Đã đọc hết
        </button>
      </header>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div key={notification.id} className={`glass-card p-4 flex gap-4 ${!notification.isRead ? 'border-primary/30 bg-primary/5' : 'opacity-80'}`}>
              <div className="shrink-0 mt-1">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-bold text-sm ${!notification.isRead ? 'text-white' : 'text-muted'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-[10px] text-muted">{notification.time}</span>
                </div>
                <p className="text-xs text-muted leading-relaxed line-clamp-2">
                  {notification.message}
                </p>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 self-center" />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[40px]">
            <p className="text-muted font-bold italic opacity-50">Không có thông báo nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
