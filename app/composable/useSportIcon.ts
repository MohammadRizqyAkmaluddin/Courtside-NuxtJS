export const useSportIcon = () => {
  const sportIconMap: Record<number, string> = {
    1: 'football',
    2: 'football',
    3: 'football',
    4: 'badminton',
    5: 'padel',
    6: 'tennis',
    7: 'basketball',
    8: 'volley',
    9: 'golf',
    10: 'baseball',
    11: 'softball',
    12: 'pilates',
    13: 'yoga',
    14: 'shooting',
  }

  const getSportIcon = (sportTypeId?: number) => {
    return sportTypeId ? sportIconMap[sportTypeId] : null
  }

  return { getSportIcon }
}
