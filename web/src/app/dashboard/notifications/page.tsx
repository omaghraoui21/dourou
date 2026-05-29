'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getCurrentUser,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/data'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { getTimeAgo } from '@/lib/utils'
import { Bell, CheckCircle, Clock, Play, Check } from 'lucide-react'
import type { Notification } from '@/lib/database.types'

const typeIcons: Record<string, typeof CheckCircle> = {
  payment_received: CheckCircle,
  payment_declared: Clock,
  reminder: Bell,
  round_started: Play,
}

const typeColors: Record<string, string> = {
  payment_received: 'text-green-400 bg-green-400/10',
  payment_declared: 'text-yellow-400 bg-yellow-400/10',
  reminder: 'text-blue-400 bg-blue-400/10',
  round_started: 'text-purple-400 bg-purple-400/10',
}

export default function NotificationsPage() {
  const router = useRouter()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/auth')
          return
        }
        setUserId(user.id)

        const data = await getNotifications(user.id)
        setNotifications(data)
      } catch (err) {
        console.error('Error fetching notifications:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    await markNotificationRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleMarkAllAsRead = async () => {
    if (!userId) return
    await markAllNotificationsRead(userId)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-400 mt-0.5">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
            <Check className="w-4 h-4" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          description="Nous vous informerons des mises a jour importantes"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Bell
            const colorClass = typeColors[notification.type] || 'text-slate-400 bg-slate-400/10'

            return (
              <Card
                key={notification.id}
                className={`p-4 ${!notification.read ? 'border-gold/20' : ''}`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notification.read ? 'font-semibold text-white' : 'text-slate-300'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    {notification.body && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {notification.body}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {getTimeAgo(notification.created_at)}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
