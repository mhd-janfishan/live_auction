import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { router } from '@inertiajs/react';

export default function NotificationPanel({ auth }) {
    const [notifications, setNotifications] = useState([]);
    const [showPanel, setShowPanel] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Listen for new notifications
        if (window.Echo && auth.user) {
            window.Echo.private(`App.Models.User.${auth.user.id}`)
                .notification((notification) => {
                    setNotifications(prev => [notification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                });
        }

        // Fetch existing notifications
        fetch('/notifications')
            .then(response => response.json())
            .then(data => {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            })
            .catch(error => {
                console.error('Error fetching notifications:', error);
            });

        return () => {
            if (window.Echo && auth.user) {
                window.Echo.leave(`App.Models.User.${auth.user.id}`);
            }
        };
    }, [auth.user]);

    const markAsRead = async (id) => {
        try {
            router.post(`/notifications/${id}/mark-as-read`, {}, {
                preserveState: true,
                onSuccess: () => {
                    setNotifications(prev =>
                        prev.map(notification =>
                            notification.id === id
                                ? { ...notification, read_at: new Date().toISOString() }
                                : notification
                        )
                    );
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            router.post('/notifications/mark-all-as-read', {}, {
                preserveState: true,
                onSuccess: () => {
                    setNotifications(prev =>
                        prev.map(notification => ({
                            ...notification,
                            read_at: notification.read_at || new Date().toISOString()
                        }))
                    );
                    setUnreadCount(0);
                }
            });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    return (
        <div className="relative">
            {/* Notification Bell Icon */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {showPanel && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                                        !notification.read_at ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => {
                                        if (!notification.read_at) {
                                            markAsRead(notification.id);
                                        }
                                        if (notification.data.product_id) {
                                            window.location.href = route('user.auctions.show', notification.data.product_id);
                                        }
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-800">
                                            {notification.data.message}
                                        </p>
                                        <span className="text-xs text-gray-500">
                                            {format(new Date(notification.created_at), 'MMM d, HH:mm')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        New bid: ${Number(notification.data.amount).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
