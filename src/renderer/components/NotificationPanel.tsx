import './NotificationPanel.css';
import React, { useEffect, useState } from 'react';
import {
    notificationCenter,
    Notification,
} from '../observer/NotificationCenter';

/**
 * Observer Pattern - Observer
 *
 * This component acts as an Observer.
 * It strictly subscribes to the shared Subject (NotificationCenter) on mount
 * and updates its local state whenever the Subject notifies of a change.
 */
const NotificationPanel: React.FC = () => {
    // Local state to store the list of notifications received from the Subject
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // 1. Define the observer callback (how we react to updates)
        const updateNotifications = (newNotifications: Notification[]) => {
            setNotifications(newNotifications);
        };

        // 2. SUBSCRIBE to the Subject
        // The subscribe method returns a cleanup function (unsubscribe)
        const unsubscribe = notificationCenter.register(updateNotifications);

        // 3. UNSUBSCRIBE on cleanup
        return () => {
            unsubscribe();
        };
    }, []);

    // If no notifications, render nothing
    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="notification-container">
            {notifications.map((note) => (
                <div
                    key={note.id}
                    className={`notification-toast notification-${note.level}`}
                    onClick={() => notificationCenter.remove(note.id)}
                    title="Click to dismiss"
                >
                    <div className="notification-toast-content">
                        {note.message}
                    </div>
                    <div className="notification-toast-time">
                        {note.timestamp.toLocaleTimeString('en-UK', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationPanel;
