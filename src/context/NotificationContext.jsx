import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef
} from 'react'
import * as Notifications from 'expo-notifications'

const NotificationContext = createContext(undefined)


const TEMPLATES = [
  { title: 'Solicite um Help',   body: 'Inicie sua jornada com um clique!' },
  { title: 'Obrigado por usar',   body: 'Sua confiança nos motiva todo dia.' },
  { title: 'Novos serviços',      body: 'Confira as novidades disponíveis agora.' },
  { title: 'Promoções ativas',    body: 'Descontos especiais só para você.' },
  { title: 'Avalie nosso app',    body: 'Sua opinião faz toda a diferença.' },
  { title: 'Prestadores de Qualidade',        body: 'Estamos prontos para ajudar quando precisar.' },
]

export function NotificationProvider({ children }) {
  const [notificationList, setNotificationList] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const processedRef = useRef(new Set())
  const listRef = useRef(notificationList)

  
  useEffect(() => { listRef.current = notificationList }, [notificationList])


  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(async notif => {
      const id = notif.request.identifier
      if (processedRef.current.has(id)) return
      processedRef.current.add(id)

      const { content } = notif.request
      setNotificationList(prev => [...prev, content])
      setUnreadCount(prev => prev + 1)

      await Notifications.dismissNotificationAsync(id)
      await Notifications.cancelAllScheduledNotificationsAsync()
    })
    return () => sub.remove()
  }, [])

  // dispara uma template ALEATÓRIA, se ainda não estiver na lista
  const scheduleRandomNotification = async () => {
    // escolhe aleatoriamente
    const tpl = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
    // bloqueia se já apareceu
    const exists = listRef.current.some(n => n.title === tpl.title && n.body === tpl.body)
    if (exists) return

    await Notifications.cancelAllScheduledNotificationsAsync()
    await Notifications.scheduleNotificationAsync({
      content: tpl,
      trigger: { seconds: 1, repeats: false },
    })
  }

  const resetUnread = () => setUnreadCount(0)

  const clearAll = async () => {
    setNotificationList([])
    setUnreadCount(0)
    processedRef.current.clear()
    await Notifications.cancelAllScheduledNotificationsAsync()
  }

  return (
    <NotificationContext.Provider
      value={{
        notificationList,
        unreadCount,
        scheduleRandomNotification,
        resetUnread,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification deve ser usado dentro de NotificationProvider')
  return ctx
}
