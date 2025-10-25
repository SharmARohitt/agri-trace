import { useState, useEffect } from 'react'
import { CheckCircle, Info, AlertCircle, X } from 'lucide-react'

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Listen for blockchain events (in a real app, this would use WebSockets or Server-Sent Events)
    const checkForNewFarmers = () => {
      // Simulate checking for new farmer registrations
      // In production, this would listen to blockchain events
      const lastCheck = localStorage.getItem('lastFarmerCheck')
      const now = Date.now()
      
      if (!lastCheck || now - parseInt(lastCheck) > 60000) { // Check every minute
        // Simulate finding a new farmer
        if (Math.random() > 0.8) { // 20% chance of new farmer
          addNotification({
            id: Date.now(),
            type: 'success',
            title: 'New Farmer Registered!',
            message: 'A new farmer has joined the AgriTrace network.',
            action: {
              text: 'View Directory',
              href: '/farmers'
            }
          })
        }
        localStorage.setItem('lastFarmerCheck', now.toString())
      }
    }

    const interval = setInterval(checkForNewFarmers, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const addNotification = (notification) => {
    setNotifications(prev => [...prev, notification])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id)
    }, 5000)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm w-full border rounded-lg p-4 shadow-lg transition-all duration-300 ${getBackgroundColor(notification.type)}`}
        >
          <div className="flex items-start space-x-3">
            {getIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              {notification.action && (
                <div className="mt-2">
                  <a
                    href={notification.action.href}
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    {notification.action.text} →
                  </a>
                </div>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationSystem