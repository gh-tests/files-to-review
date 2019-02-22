const DEF_PATTERN: string = '(licen(s|c)e)|(copyright)|(code.?of.?conduct)'
export const LEGAL_TO_REVIEW: ReviewCriteria = { reason: '`Legal` expert review is needed for', regexp: DEF_PATTERN }
export const DEF_CONFIG = { reviewCriteria: [ LEGAL_TO_REVIEW ] }

export interface ReviewCriteria {
  reason?: string
  regexp?: string
  teams?: string[]
}

interface ReviewConfig {
  reviewCriteria?: ReviewCriteria[]
}

export function getCriteria (config: ReviewConfig | any): ReviewCriteria[] {
  if (config === undefined || config === null || (<ReviewConfig>config).reviewCriteria === undefined) {
    return DEF_CONFIG.reviewCriteria
  }
  return config.reviewCriteria.filter(isConfig) as ReviewCriteria[]
}

function isConfig (config: ReviewCriteria | any): config is ReviewCriteria {
  return (<ReviewCriteria>config).regexp !== undefined &&
    ((<ReviewCriteria>config).reason !== undefined || (<ReviewCriteria>config).teams !== undefined)
}
