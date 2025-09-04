import React, { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import type { Notification as NotificationType } from '../contexts/NotificationContext';
import { XIcon } from './icons/XIcon';

const notificationStyles = {
    info: 'bg-info text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-black',
    error: 'bg-error text-white',
};

const Notification: React.FC<{ notification: NotificationType, onRemove: (id: number) => void }> = ({ notification, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(notification.id);
        }, 5000); // Auto-dismiss after 5 seconds
        return () => clearTimeout(timer);
    }, [notification.id, onRemove]);

    return (
        <div className={`relative w-full max-w-sm rounded-md shadow-lg p-4 pr-10 ${notificationStyles[notification.type]}`}>
            <p className="font-semibold">{notification.message}</p>
            <button 
                onClick={() => onRemove(notification.id)}
                className="absolute top-1/2 right-2 -translate-y-1/2 p-1 rounded-full hover:bg-black/20"
            >
                <XIcon className="h-4 w-4" />
            </button>
        </div>
    );
};


export const NotificationContainer: React.FC = () => {
    const { notifications, removeNotification } = useNotifications();

    return (
        <div className="fixed bottom-5 right-5 z-50 space-y-3">
            {notifications.map(n => (
                <Notification key={n.id} notification={n} onRemove={removeNotification} />
            ))}
        </div>
    );
};
