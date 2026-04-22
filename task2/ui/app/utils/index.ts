export function formatDate(dateString: string, locale: string = "en") {
  if (!dateString) return ''
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(dateString))
}

export function titleToHue(title: string): number {
  let hash = 0
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}
