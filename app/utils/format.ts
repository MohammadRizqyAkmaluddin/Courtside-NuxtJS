export const formatNumber = (num: any): string => {
  return num.toLocaleString('id-ID')
}

export const formatTime = (time: any) => {
  const [hour, minute] = time.split(':')
  const ampm = Number(hour) >= 12 ? 'PM' : 'AM'

  return `${hour}:${minute} ${ampm}`
}

export const formatTime3 = (time: string) => {
  const [hour, minute] = time.split(':')

  return `${hour}:${minute}`
}

export const formatTime2 = (time: string) => {
  const date = new Date(time)

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}
export const formatTime4 = (time: string): string => {
  return time.slice(0, 5)
}

export const formatBookingDate = (dateStr: string) => {
  const date = new Date(dateStr)

  // reset jam biar perbandingan tanggal akurat
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  // cek hari ini
  if (targetDate.getTime() === today.getTime()) {
    return 'Today'
  }

  // cek besok
  if (targetDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  }

  // format default
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export const formatDateDplus = (dateStr: string) => {
  const today = new Date()
  const targetDate = new Date(dateStr)

  // reset jam biar akurat (00:00:00)
  today.setHours(0, 0, 0, 0)
  targetDate.setHours(0, 0, 0, 0)

  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'D-Day'
  if (diffDays > 0) return `D+${diffDays}`
  return `D${diffDays}` // contoh: D-1
}

export const formatDate = (dateStr: any) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}
export const formatDate2 = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export const formatDatePlusOneMonth = (dateStr: string) => {
  const date = new Date(dateStr)
  date.setMonth(date.getMonth() + 1)

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}