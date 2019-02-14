import nock from 'nock'

import myProbotApp from '../src'
import { Probot } from 'probot'

// Fixtures
import prWithLegalFiles from './fixtures/pull_request.legal_files.json'
import prWithNoLegalFiles from './fixtures/pull_request.ignored_files.json'
import prReviewRequestBody from './fixtures/pull_request.review_request.json'
import prOpened from './fixtures/pull_request.opened.json'

const gitHubApiUrl: string = 'https://api.github.com'

nock.disableNetConnect()

describe('Legal-to-review rest flow app', () => {
  let probot: any

  beforeEach(() => {
    probot = new Probot({ id: 123, cert: 'test' })
    const app = probot.load(myProbotApp)
    app.app = () => 'test'
  })

  test("sends review request to 'legal' group", async (done) => {
    testAccessToken()

    // PR has legal files
    const files = nock(gitHubApiUrl)
      .get('/repos/foo/bar/pulls/3/files')
      .query({ per_page: 100 })
      .reply(200, prWithLegalFiles)

    // 'legal' team review request should be performed
    const review = nock(gitHubApiUrl)
      .post('/repos/foo/bar/pulls/3/requested_reviewers', (body: any) => {
        expect(body).toMatchObject(prReviewRequestBody)
        return true
      })
      .reply(200)

    // Receive open PR event
    await probot.receive({ name: 'pull_request', payload: prOpened })

    // check if both endpoints were called
    if (!files.isDone()) {
      throw new Error('PR files were not requested')
    }
    if (!review.isDone()) {
      throw new Error('PR legal review was not requested')
    }
    done()
  })

  test('does nothing when no legal files are modified', async (done) => {
    testAccessToken()

    // PR has not legal files
    const files = nock(gitHubApiUrl)
      .get('/repos/foo/bar/pulls/3/files')
      .query({ per_page: 100 })
      .reply(200, prWithNoLegalFiles)

    // 'legal' team review request shouldn't be performed
    nock(gitHubApiUrl)
      .post('/repos/foo/bar/pulls/3/requested_reviewers', (body: any) => {
        throw new Error("Shouldn't have been called")
      })
      .reply(200)

    // Receive open PR event
    await probot.receive({ name: 'pull_request', payload: prOpened })

    // verify endpoints were reached
    if (!files.isDone()) {
      throw Error('PR files endpoint was not reached')
    }
    done()
  })
})

function testAccessToken () {
  // Test that we correctly return a test token
  nock(gitHubApiUrl)
    .post('/app/installations/2/access_tokens')
    .reply(200, { token: 'test' })
}
