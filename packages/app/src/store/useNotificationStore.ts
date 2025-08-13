import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notification {
  id: string
  type: 'cart' | 'order' | 'promotion' | 'system' | 'general'
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: Date
  expiresAt?: Date
  priority: 'low' | 'medium' | 'high'
  actionType?: 'navigate' | 'external' | 'none'
  actionUrl?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  cartItemCount: number
  badges: {
    cart: number
    orders: number
    promotions: number
    system: number
  }
}

interface NotificationActions {
  // Core notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearExpired: () => void
  clearAll: () => void

  // Badge management
  updateCartBadge: (count: number) => void
  updateOrdersBadge: (count: number) => void
  updatePromotionsBadge: (count: number) => void
  updateSystemBadge: (count: number) => void

  // Utility functions
  getUnreadByType: (type: Notification['type']) => Notification[]
  getTotalUnreadCount: () => number
}

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      unreadCount: 0,
      cartItemCount: 0,
      badges: {
        cart: 0,
        orders: 0,
        promotions: 0,
        system: 0,
      },

      // Actions
      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
        }

        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }))
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          const wasUnread = notification && !notification.read

          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
          }
        })
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
          unreadCount: state.notifications.find((n) => n.id === id && !n.read)
            ? state.unreadCount - 1
            : state.unreadCount,
        }))
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }))
      },

      clearExpired: () => {
        const now = new Date()
        set((state) => {
          const validNotifications = state.notifications.filter(
            (n) => !n.expiresAt || n.expiresAt > now
          )
          const expiredUnreadCount = state.notifications.filter(
            (n) => n.expiresAt && n.expiresAt <= now && !n.read
          ).length

          return {
            notifications: validNotifications,
            unreadCount: state.unreadCount - expiredUnreadCount,
          }
        })
      },

      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
        })
      },

      // Badge management
      updateCartBadge: (count) => {
        set((state) => ({
          cartItemCount: count,
          badges: { ...state.badges, cart: count },
        }))
      },

      updateOrdersBadge: (count) => {
        set((state) => ({
          badges: { ...state.badges, orders: count },
        }))
      },

      updatePromotionsBadge: (count) => {
        set((state) => ({
          badges: { ...state.badges, promotions: count },
        }))
      },

      updateSystemBadge: (count) => {
        set((state) => ({
          badges: { ...state.badges, system: count },
        }))
      },

      // Utility functions
      getUnreadByType: (type) => {
        return get().notifications.filter((n) => n.type === type && !n.read)
      },

      getTotalUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length
      },
    }),
    {
      name: 'notification-store',
      // Only persist notifications and badges, not computed values
      partialize: (state) => ({
        notifications: state.notifications,
        badges: state.badges,
        cartItemCount: state.cartItemCount,
      }),
    }
  )
)
