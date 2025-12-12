import React from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';

function Notifications({ notifications, onClearNotification, onClearAll }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col animate-slide-in">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                  {notifications.length}
                </span>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-4 hover:bg-gray-50 transition-colors relative group"
                    >
                      <button
                        onClick={() => onClearNotification(notif.id)}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0 animate-pulse"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-600 mb-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400">
                            {notif.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Notifications;