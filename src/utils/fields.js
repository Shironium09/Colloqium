/**
 * Computer Science & Technology academic field taxonomies and classifiers.
 */

export const CS_FIELDS = [
  {
    id: 'ai-ml',
    label: 'AI & Machine Learning',
    shortLabel: 'AI & ML',
    patterns: [
      /\bmachine learning\b/i,
      /\bdeep learning\b/i,
      /\bartificial intelligence\b/i,
      /\bneural\b/i,
      /\bnlp\b/i,
      /\bnatural language\b/i,
      /\bllm\b/i,
      /\brobotics\b/i,
      /\bintelligent\b/i,
      /\bcybernetics\b/i,
      /\bcognitive\b/i,
    ],
  },
  {
    id: 'security',
    label: 'Cybersecurity & Privacy',
    shortLabel: 'Cybersecurity',
    patterns: [
      /\bsecurity\b/i,
      /\bcyber\b/i,
      /\bcryptograph/i,
      /\bprivacy\b/i,
      /\bforensics\b/i,
      /\bblockchain\b/i,
      /\bmalware\b/i,
      /\binformation security\b/i,
    ],
  },
  {
    id: 'software-eng',
    label: 'Software Engineering',
    shortLabel: 'Software Eng',
    patterns: [
      /\bsoftware\b/i,
      /\bprogramming\b/i,
      /\bagile\b/i,
      /\bdevops\b/i,
      /\btesting\b/i,
      /\bcode\b/i,
      /\bsoftware architecture\b/i,
    ],
  },
  {
    id: 'networks-iot',
    label: 'Networks & Cloud / IoT',
    shortLabel: 'Networks & IoT',
    patterns: [
      /\bnetwork/i,
      /\btelecommunication/i,
      /\bwireless\b/i,
      /\biot\b/i,
      /\binternet of things\b/i,
      /\bcloud\b/i,
      /\b5g\b/i,
      /\b6g\b/i,
      /\bdistributed\b/i,
      /\bsensor/i,
      /\bedge computing\b/i,
      /\bbroadband\b/i,
    ],
  },
  {
    id: 'data-science',
    label: 'Data Science & Big Data',
    shortLabel: 'Data Science',
    patterns: [
      /\bdata science\b/i,
      /\bbig data\b/i,
      /\bdatabase/i,
      /\bdata mining\b/i,
      /\banalytics\b/i,
      /\bdata analysis\b/i,
      /\bdata engineering\b/i,
      /\bknowledge discovery\b/i,
    ],
  },
  {
    id: 'vision-graphics',
    label: 'Computer Vision & Graphics',
    shortLabel: 'Vision & Graphics',
    patterns: [
      /\bcomputer vision\b/i,
      /\bimage processing\b/i,
      /\bpattern recognition\b/i,
      /\bgraphics\b/i,
      /\bmultimedia\b/i,
      /\bvirtual reality\b/i,
      /\baugmented reality\b/i,
      /\bvisual computing\b/i,
    ],
  },
  {
    id: 'systems-hardware',
    label: 'Systems & Hardware',
    shortLabel: 'Systems & HW',
    patterns: [
      /\bembedded\b/i,
      /\bhardware\b/i,
      /\bvlsi\b/i,
      /\barchitecture\b/i,
      /\bparallel\b/i,
      /\bcircuits\b/i,
      /\bmicroelectronics\b/i,
      /\bsemiconductor\b/i,
      /\bhpc\b/i,
      /\bhigh performance computing\b/i,
    ],
  },
  {
    id: 'theory-algorithms',
    label: 'Theory & Algorithms',
    shortLabel: 'Theory & Algo',
    patterns: [
      /\balgorithm/i,
      /\btheoretical computer science\b/i,
      /\bdiscrete math/i,
      /\bautomata\b/i,
      /\bcomputational complexity\b/i,
      /\bquantum computing\b/i,
    ],
  },
  {
    id: 'info-systems',
    label: 'Information Systems & IT',
    shortLabel: 'Info Systems',
    patterns: [
      /\binformation systems\b/i,
      /\binformation technology\b/i,
      /\binformatics\b/i,
      /\bhealth informatics\b/i,
      /\be-learning\b/i,
      /\be-health\b/i,
      /\bhuman-computer\b/i,
      /\bhci\b/i,
    ],
  },
]

const fieldCache = new WeakMap()

/**
 * Returns matching field objects for a given conference.
 */
export function getConferenceFields(conf) {
  if (!conf) return []
  if (fieldCache.has(conf)) return fieldCache.get(conf)

  const text = `${conf.acronym || ''} ${conf.name || ''} ${conf.description || ''}`
  const matches = CS_FIELDS.filter((f) => f.patterns.some((p) => p.test(text)))

  fieldCache.set(conf, matches)
  return matches
}
