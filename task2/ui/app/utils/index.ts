export function formatDate(dateString: string, locale: string = "en") {
  if (!dateString) return ''
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(dateString))
}
