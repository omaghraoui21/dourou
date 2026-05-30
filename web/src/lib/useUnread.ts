'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser, getNotifications } from '@/lib/data'

/**
 * Compte les notifications non lues de l'utilisateur courant.
 *
 * Recharge a chaque changement de route (via le `key` du composant parent)
 * ou au montage. Fonctionne en mode demo (localStorage) comme en mode reel.
 */
export function useUnreadCount(): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const user = await getCurrentUser()
        if (!user) return
        const notifs = await getNotifications(user.id)
        if (active) setCount(notifs.filter((n) => !n.read).length)
      } catch {
        // silencieux : le badge est purement indicatif
      }
    }

    load()

    // Rafraichit quand l'onglet redevient actif (utile apres une action)
    function onVisible() {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      active = false
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return count
}
