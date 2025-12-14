import { Observer, Notification, NotificationLevel } from './Observer';

export { Notification, NotificationLevel };

interface NotificationSubject {
    attach(observer: Observer): void;
    detach(observer: Observer): void;
    notify(): void;
}

// Keeping this for backward compatibility if needed, but internally we use Observer interface
// or we can remove it if we are sure. The prompt asked to "Implement Observer Pattern properly".
// So I will prioritize the Observer interface usage.

class NotificationCenter implements NotificationSubject {
    // SINGLETON INSTANCE
    private static instance: NotificationCenter;

    // STATE: List of active notifications
    private notifications: Notification[] = [];

    // OBSERVERS: List of subscribers
    private observers: Observer[] = [];

    private constructor() {}

    // Public accessor for the Singleton instance
    public static getInstance(): NotificationCenter {
        if (!NotificationCenter.instance) {
            NotificationCenter.instance = new NotificationCenter();
        }
        return NotificationCenter.instance;
    }

    /**
     * ATTACH an observer to the Subject.
     */
    public attach(observer: Observer): void {
        const isExist = this.observers.includes(observer);
        if (isExist) {
            return; // Prevent duplicate attachment
        }
        this.observers.push(observer);
        // Immediately notify the new subscriber of current state
        observer.update(this.notifications);
    }

    /**
     * DETACH an observer from the Subject.
     */
    public detach(observer: Observer): void {
        this.observers = this.observers.filter((obs) => obs !== observer);
    }

    /**
     * NOTIFY all observers of the current state.
     */
    public notify(): void {
        this.observers.forEach((observer) =>
            observer.update(this.notifications),
        );
    }

    /**
     * Action to add a new notification.
     * Triggers a notify() call.
     */
    public push(message: string, level: NotificationLevel = 'info'): void {
        const newNotification: Notification = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            message,
            level,
            timestamp: new Date(),
        };

        this.notifications = [...this.notifications, newNotification];
        this.notify();

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            this.remove(newNotification.id);
        }, 5000);
    }

    /**
     * Action to remove a generic notification by ID.
     * Triggers a notify() call.
     */
    public remove(id: string): void {
        const initialLength = this.notifications.length;
        this.notifications = this.notifications.filter((n) => n.id !== id);

        // Only notify if something actually changed
        if (this.notifications.length !== initialLength) {
            this.notify();
        }
    }

    public clear(): void {
        this.notifications = [];
        this.notify();
    }
}

// Export a singleton instance for easy usage
export const notificationCenter = NotificationCenter.getInstance();
