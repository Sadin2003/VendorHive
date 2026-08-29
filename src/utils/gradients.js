const GRADS = [
  'linear-gradient(135deg,#3c6b4f 0%,#5d8a6f 55%,#8fae97 100%)',
  'linear-gradient(135deg,#294637 0%,#4c7662 60%,#7aa58a 100%)',
  'linear-gradient(135deg,#5f5344 0%,#9a8264 60%,#c6ab84 100%)',
  'linear-gradient(135deg,#4878a8 0%,#6fa3c9 100%)',
  'linear-gradient(135deg,#a35a3c 0%,#d9a878 100%)',
  'linear-gradient(135deg,#6d5a8f 0%,#a98fd0 100%)',
  'linear-gradient(135deg,#3f6b5a 0%,#62a18a 100%)',
  'linear-gradient(135deg,#8a6a3c 0%,#d0b078 100%)',
  'linear-gradient(135deg,#b0563f 0%,#d98a6a 100%)',
  'linear-gradient(135deg,#33617c 0%,#5f9bbf 100%)',
]

const TONES = ['#3c6b4f', '#4878a8', '#a87248', '#6d5a8f', '#b0563f', '#3f6b5a', '#8a6a3c', '#5f5344']

export function hashStr(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

export function gradientFor(str = '') {
  return GRADS[hashStr(str) % GRADS.length]
}

export function toneFor(str = '') {
  return TONES[hashStr(str) % TONES.length]
}

export function initials(name = '') {
  const words = String(name).trim().split(/[\s-]+/).filter(Boolean)
  if (!words.length) return 'VH'
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}