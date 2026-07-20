export const formatNumber = (num: any): string => {
  return num.toLocaleString('id-ID')
}

export const formatTime = (time: any) => {
  const [hour, minute] = time.split(':')
  const ampm = Number(hour) >= 12 ? 'PM' : 'AM'

  return `${hour}:${minute} ${ampm}`
}

export const formatTime3 = (time: any) => {
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

export const formatDaysAgo = (dateStr: string | Date): string => {
  const parsedDate = typeof dateStr === 'string'
    ? (() => {
        const match = dateStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)

        if (!match) {
          const fallbackDate = new Date(dateStr)
          return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate
        }

        const [, year, month, day] = match
        return new Date(Number(year), Number(month) - 1, Number(day))
      })()
    : dateStr

  if (!parsedDate || Number.isNaN(parsedDate.getTime())) return 'Today'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(parsedDate)
  targetDate.setHours(0, 0, 0, 0)

  const diffTime = today.getTime() - targetDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  return `${diffDays} days ago`
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

export const formatAge = (dateStr: string): number => {
  const birthDate = new Date(dateStr)
  const today = new Date()

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  const dayDiff = today.getDate() - birthDate.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1
  }

  return age
}

export function formatChatTime(dateString: string): string {
  const inputDate = new Date(dateString)
  const now = new Date()

  // reset time biar bandingin hari doang
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfInput = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate()
  )

  const diffMs = startOfToday.getTime() - startOfInput.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  // SAME DAY
  if (diffDays === 0) {
    const hours = inputDate.getHours().toString().padStart(2, '0')
    const minutes = inputDate.getMinutes().toString().padStart(2, '0')
    return `${hours}.${minutes}`
  }

  // YESTERDAY
  if (diffDays === 1) {
    return 'Yesterday'
  }

  // WITHIN 7 DAYS
  if (diffDays <= 7) {
    return inputDate.toLocaleDateString('en-US', { weekday: 'long' })
  }

  // MORE THAN 7 DAYS
  const day = inputDate.getDate().toString().padStart(2, '0')
  const month = (inputDate.getMonth() + 1).toString().padStart(2, '0')
  const year = inputDate.getFullYear().toString().slice(-2)

  return `${day}/${month}/${year}`
}