import * as ReviewConfig from '../src/config'

describe('ReviewConfig tests', () => {
  const DEF_CRITERIA: ReviewConfig.ReviewCriteria[] = ReviewConfig.DEF_CONFIG.reviewCriteria

  test('{}/null/undefined object in config.yml results in DEF_CONFIG', () => {
    expect(ReviewConfig.getCriteria({})).toBe(DEF_CRITERIA)
    expect(ReviewConfig.getCriteria(undefined)).toBe(DEF_CRITERIA)
    expect(ReviewConfig.getCriteria(null)).toBe(DEF_CRITERIA)
  })

  test('object with no reviewCriteria in config.yml results in DEF_CONFIG', () => {
    expect(ReviewConfig.getCriteria({ some: 'config' })).toBe(DEF_CRITERIA)
  })

  test('properly parses reviewCriteria from config.yml', () => {
    const expected: ReviewConfig.ReviewCriteria[] =
      [
        { name: 'some-to-review', regexp: 'some', teams: [ 'team1', 'team2' ] }
      ]
    expect(ReviewConfig.getCriteria({ reviewCriteria: expected })).toEqual(expected)
  })

  test('skips reviewCriteria without regexp from config.yml', () => {
    const expected: ReviewConfig.ReviewCriteria = { name: 'some-to-review', regexp: 'some' }
    const input: ReviewConfig.ReviewCriteria[] =
      [
        expected,
        { name: 'missing-regexp', teams: [ 'team' ] },
        { regexp: 'missing-name', teams: [ 'team' ] }
      ]
    expect(ReviewConfig.getCriteria({ reviewCriteria: input })).toEqual([ expected ])
  })
})
