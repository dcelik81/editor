import { Observer, Notification } from './Observer';

/**
 * Concrete Observer (Adapter)
 *
 * This class bridges the gap between the Subject (NotificationCenter)
 * and the specific React component (NotificationPanel).
 *
 * It implements the generic Observer interface but internally calls
 * a specific callback provided by the component.
 */
export class NotificationPanelObserver implements Observer {
    private onUpdate: (notifications: Notification[]) => void;

    /**
     * @param onUpdate Helper callback to trigger React state updates
     */
    constructor(onUpdate: (notifications: Notification[]) => void) {
        this.onUpdate = onUpdate;
    }

    /**
     * Implements the Observer interface update method.
     * Delegates to the component's callback.
     */
    public update(notifications: Notification[]): void {
        this.onUpdate(notifications);
    }
}
