export function parseCommunityDescription(
  community: any,
  helpers: {
    formatCurrency: (n: number) => string
  }
): string {
  if (!community?.description) return ''

  let desc: string = community.description

  const dataMap: Record<string, string | number | undefined> = {
    'community.max_slot': community.max_slot,
    'community.level.level': community.level?.level,
    'formatCurrency(community.membership_fee)': helpers.formatCurrency(community.membership_fee)
  }

  desc = desc.replace(/{{\s*(.*?)\s*}}/g, (_match: string, expr: string): string => {
    return String(dataMap[expr] ?? '-')
  })

  return desc
}