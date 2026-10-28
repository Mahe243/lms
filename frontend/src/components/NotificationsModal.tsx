import React from 'react';
import { X, Bell, CheckCheck, Clock, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';
import { Notification } from '../types';
import { api } from '../api';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onRefresh: () => void;
  onNavigate: (url: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onRefresh,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'revision': return <RotateCcw size={14} className="text-amber-500" />;
      case 'deadline': return <AlertCircle size={14} className="text-rose-500" />;
      case 'flashcard': return <Sparkles size={14} className="text-emerald-500" />;
      default: return <Clock size={14} className="text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-black/30 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center space-x-2">
            <Bell size={16} className="text-indigo-600" />
            <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">Notifications</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded"
              title="Mark all as read"
            >
              <CheckCheck size={14} />
            </button>
            <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 p-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">No new notifications</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 text-xs rounded-lg transition ${
                  !n.is_read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getIcon(n.notification_type)}
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">{n.title}</span>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-[10px] text-indigo-600 hover:underline"
                    >
                      Read
                    </button>
                  )}
                </div>
                <p className="mt-1 text-neutral-600 dark:text-neutral-400 leading-normal">{n.message}</p>
                {n.link_url && (
                  <button
                    onClick={() => {
                      onNavigate(n.link_url!);
                      onClose();
                    }}
                    className="mt-2 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline inline-block"
                  >
                    Open View →
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
