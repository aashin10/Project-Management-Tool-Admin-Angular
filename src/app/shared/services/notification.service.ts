import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly STORAGE_KEY = 'app_notifications';
  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    this.loadNotificationsFromStorage();
  }

  // Add a new notification
  addNotification(type: 'success' | 'error' | 'warning' | 'info', message: string, title: string = ''): void {
    const notification: NotificationItem = {
      id: this.generateId(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    };

    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [notification, ...currentNotifications];

    // Keep only the last 50 notifications
    const trimmedNotifications = updatedNotifications.slice(0, 50);

    this.notificationsSubject.next(trimmedNotifications);
    this.saveNotificationsToStorage(trimmedNotifications);
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );

    this.notificationsSubject.next(updatedNotifications);
    this.saveNotificationsToStorage(updatedNotifications);
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      read: true
    }));

    this.notificationsSubject.next(updatedNotifications);
    this.saveNotificationsToStorage(updatedNotifications);
  }

  // Remove a specific notification
  removeNotification(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(notification =>
      notification.id !== notificationId
    );

    this.notificationsSubject.next(updatedNotifications);
    this.saveNotificationsToStorage(updatedNotifications);
  }

  // Clear all notifications
  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
    this.saveNotificationsToStorage([]);
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notificationsSubject.value.filter(notification => !notification.read).length;
  }

  // Get all notifications
  getNotifications(): NotificationItem[] {
    return this.notificationsSubject.value;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadNotificationsFromStorage(): void {
    try {
      // Check if localStorage is available (not in SSR)
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsedNotifications = JSON.parse(stored);
          // Convert timestamp strings back to Date objects
          const notificationsWithDates = parsedNotifications.map((notification: any) => ({
            ...notification,
            timestamp: new Date(notification.timestamp)
          }));
          this.notificationsSubject.next(notificationsWithDates);
        }
      }
    } catch (error) {
      this.notificationsSubject.next([]);
    }
  }

  private saveNotificationsToStorage(notifications: NotificationItem[]): void {
    try {
      // Check if localStorage is available (not in SSR)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
      }
    } catch (error) {
    }
  }
}