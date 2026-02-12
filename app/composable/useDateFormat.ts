export const useDateFormat = () => {
  const monthYear = (value?: string | Date | null) => {
    if (!value) return ''

    const date =
      typeof value === 'string' && value.length === 7
        ? new Date(`${value}-01`)
        : new Date(value)

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  const fullDate = (value?: string | Date | null) => {
    if (!value) return ''

    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value))
  }

  return { monthYear, fullDate }
}
