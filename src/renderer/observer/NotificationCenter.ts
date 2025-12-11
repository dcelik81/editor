/**
 * Observer Pattern - Subject
 * 
 * This class acts as the Subject in the Observer Pattern.
 * It maintains a list of observers (callbacks) and notifies them whenever
 * the state (list of notifications) changes.
 */

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    message: string;
    level: NotificationLevel;
    timestamp: Date;
}

// Observer type: a function that receives the updated list of notifications
export type NotificationObserver = (notifications: Notification[]) => void;

class NotificationCenter {
    // SINGLETON INSTANCE
    private static instance: NotificationCenter;

    // STATE: List of active notifications
    private notifications: Notification[] = [];

    // OBSERVERS: List of subscribers listening for updates
    private observers: NotificationObserver[] = [];

    private constructor() {}

    // Public accessor for the Singleton instance
    public static getInstance(): NotificationCenter {
        if (!NotificationCenter.instance) {
            NotificationCenter.instance = new NotificationCenter();
        }
        return NotificationCenter.instance;
    }

    /**
     * SUBSCRIBE to the Notification Center.
     * The observer will immediately receive the current state.
     * @param observer The callback function to be invoked on updates
     * @returns A cleanup function to unsubscribe
     */
    public subscribe(observer: NotificationObserver): () => void {
        this.observers.push(observer);
        // Immediately notify the new subscriber of current state
        observer(this.notifications);

        // Return unsubscribe function for convenience
        return () => this.unsubscribe(observer);
    }

    /**
     * UNSUBSCRIBE from the Notification Center.
     * @param observer The observer to remove
     */
    public unsubscribe(observer: NotificationObserver): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    /**
     * NOTIFY all observers of the current state.
     * This is the core method of the Observer Pattern.
     */
    private notify(): void {
        this.observers.forEach(observer => observer(this.notifications));
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
            timestamp: new Date()
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
        this.notifications = this.notifications.filter(n => n.id !== id);
        
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
