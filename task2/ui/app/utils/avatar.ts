const BACKGROUNDS = [
  'b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc',
  'ffdfbf', 'c1f4c5', 'f4c1c1', 'c1e4f4'
]

function getBg(seed: string) {
  const index = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % BACKGROUNDS.length
  return BACKGROUNDS[index]
}

export function getCollectionAvatar(seed: string) {
  const bg = getBg(seed)
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed)}&}&fontSize=36&fontWeight=700`
}

export function getEntityAvatar(seed: string) {
  const bg = getBg(seed)
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed)}`
}
