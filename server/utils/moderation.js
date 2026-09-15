// Automated content moderation for submitted review text.
//
// Runs on review create/update as the first line of defense (PDF §E):
// spam / abuse is auto-flagged and pushed into the admin moderation queue
// instead of going straight to "kept", so a human can confirm.

const BYPASS_WORDS = ['not', 'no', 'never', "isn't", "aren't", "wasn't", 'avoid', 'skip']
const DIRTY_WORDS = [
  'spam',
  'scam',
  'fraud',
  'fake',
  'sucks',
  'terrible',
  'worst ever',
  'never go',
  'ripoff',
  'rip-off',
  'unprofessional',
  'filthy',
  'disgusting',
  'unhygienic',
  'unsafe',
]

// Negated mentions like "not a scam" are legitimate feedback — hyper-local
// phrase check that allows one short word (a/an/the/this/…) between the
// modifier and the keyword.
function isNegated(lowered, word) {
  const neg = new RegExp(
    `(?:${BYPASS_WORDS.join('|')})\\s+(?:an?|the|this|that|some|any|such|total|real|actual|big|classic)?\\s*\\b${word}\\b`,
    'i'
  )
  return neg.test(lowered)
}

// Thresholds borrowed from the review risk model (low/med/high).
// A single high-severity match, or repeated medium hits, escalate the review.
export function moderateText(text = '') {
  const lowered = String(text).toLowerCase()
  let high = 0
  let med = 0

  for (const word of DIRTY_WORDS) {
    const rx = new RegExp(`\\b${word}\\b`, 'g')
    const hits = lowered.match(rx)
    if (!hits) continue
    if (isNegated(lowered, word)) continue
    if (word === 'fraud' || word === 'scam' || word === 'fake' || word === 'unsafe' || word === 'rip-off' || word === 'ripoff') {
      high += hits.length
    } else {
      med += hits.length
    }
  }

  if (high >= 1 || med >= 2) {
    return {
      flagged: true,
      risk: high >= 1 ? 'high' : 'med',
      reason: high >= 1 ? 'Automated flag: possible fraud or safety claim' : 'Automated flag: repeated negative spam keywords',
    }
  }
  return { flagged: false, risk: 'low', reason: '' }
}