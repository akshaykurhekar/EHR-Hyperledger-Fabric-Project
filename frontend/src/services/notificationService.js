// Notification service for managing notifications across the app

export const addNotification = (userId, notification) => {
  if (!userId) return
  
  const notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`) || '[]')
  notifications.push({
    id: Date.now().toString(),
    ...notification,
    read: false,
    createdAt: new Date().toISOString()
  })
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications))
}

export const notifyClaimSubmitted = (patientId, claimId, doctorId) => {
  // Notify doctor about new claim
  addNotification(doctorId, {
    type: 'claim',
    action: 'submitted',
    claimId,
    patientId,
    message: `New claim ${claimId} submitted by patient ${patientId} requires your verification`
  })
}

export const notifyClaimVerified = (claimId, patientId, agentId, verified) => {
  // Notify patient
  addNotification(patientId, {
    type: 'claim',
    action: verified ? 'verified' : 'rejected',
    claimId,
    message: `Your claim ${claimId} has been ${verified ? 'verified' : 'rejected'} by the doctor`
  })
  
  // Notify insurance agent
  if (agentId) {
    addNotification(agentId, {
      type: 'claim',
      action: 'verified',
      claimId,
      patientId,
      message: `Claim ${claimId} has been verified by doctor and is ready for review`
    })
  }
}

export const notifyClaimProcessed = (claimId, patientId, action, amount, reason) => {
  // Notify patient about claim approval/rejection
  addNotification(patientId, {
    type: 'claim',
    action,
    claimId,
    amount,
    reason,
    message: action === 'approved' 
      ? `Your claim ${claimId} has been approved for $${amount}`
      : `Your claim ${claimId} has been rejected: ${reason}`
  })
}

export const getNotifications = (userId) => {
  if (!userId) return []
  const notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`) || '[]')
  return notifications.filter(n => !n.read)
}

export const markNotificationAsRead = (userId, notificationId) => {
  if (!userId) return
  const notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`) || '[]')
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  )
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated))
}

export const markAllAsRead = (userId) => {
  if (!userId) return
  const notifications = JSON.parse(localStorage.getItem(`notifications_${userId}`) || '[]')
  const updated = notifications.map(n => ({ ...n, read: true }))
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated))
}

