export const onlineStatus = (lastSeen) => {
  if (!lastSeen) return false
  return (Date.now() - new Date(lastSeen)) < 60000
}