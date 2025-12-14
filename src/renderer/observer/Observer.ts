/**
 * Observer Interface
 *
 * Defines the contract for objects that want to be notified
 * of changes in the Subject (NotificationCenter).
 */

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    message: string;
    level: NotificationLevel;
    timestamp: Date;
}

export interface Observer {
    update(notifications: Notification[]): void;
}
