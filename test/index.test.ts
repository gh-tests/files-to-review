import nock from 'nock'

import myProbotApp from '../src'
import { Probot } from 'probot'

// Fixtures
import prWithLegalFiles from './fixtures/pull_request.legal_files.json'
import prWithNoLegalFiles from './fixtures/pull_request.ignored_files.json'
import prReviewRequestBody from './fixtures/pull_request.review_request.json'
import prOpened from './fixtures/pull_request.opened.json'
import contentFile from './fixtures/content_file.json'

const gitHubApiUrl: string = 'https://api.github.com'

nock.disableNetConnect()

describe('Legal-to-review rest flow app', () => {
  let probot: any

  beforeEach(() => {
    probot = new Probot({ id: 123, cert: 'test' })
    const app = probot.load(myProbotApp)
    app.app = () => 'test'
    nock.cleanAll()
  })

  test("sends review request to 'legal' group", async (done) => {
    testAccessToken()

    // PR has legal files
    const files = nock(gitHubApiUrl)
      .get('/repos/foo/bar/pulls/3/files')
      .query({ per_page: 100 })
      .reply(200, prWithLegalFiles)

    const config = nock(gitHubApiUrl)
      .get('/repos/foo/bar/contents/.github/config.yml')
      .reply(404)

    // 'legal' team review request should be performed
    const review = nock(gitHubApiUrl)
      .post('/repos/foo/bar/pulls/3/requested_reviewers', (body: any) => {
        expect(body).toMatchObject(prReviewRequestBody)
        return true
      })
      .reply(200)

    // Receive open PR event
    await probot.receive({ name: 'pull_request', payload: prOpened })

    verifyMocksWereHit(files, config, review)
    done()
  })

  test('does nothing when no legal files are modified', async (done) => {
    testAccessToken()

    // PR has not legal files
    const files = nock(gitHubApiUrl)
      .get('/repos/foo/bar/pulls/3/files')
      .query({ per_page: 100 })
      .reply(200, prWithNoLegalFiles)

    const config = nock(gitHubApiUrl)
      .get('/repos/foo/bar/contents/.github/config.yml')
      .reply(404)

    // 'legal' team review request shouldn't be performed
    nock(gitHubApiUrl)
      .post('/repos/foo/bar/pulls/3/requested_reviewers', (body: any) => {
        throw new Error("Shouldn't have been called")
      })
      .reply(200)

    // Receive open PR event
    await probot.receive({ name: 'pull_request', payload: prOpened })

    verifyMocksWereHit(files, config)
    done()
  })

  test('reads regexp from config.yml', async (done) => {
    testAccessToken()

    // PR has legal files
    const files = nock(gitHubApiUrl)
      .get('/repos/foo/bar/pulls/3/files')
      .query({ per_page: 100 })
      .reply(200, prWithNoLegalFiles)

    // return config.yml that has regexp that matches 'barfile.txt'
    contentFile.name = 'config.yml'
    contentFile.path = '.github/config.yml'
    contentFile.content = Buffer.from('legalFileRegExp: "barfile"').toString('base64')
    const config = nock(gitHubApiUrl)
      .get('/repos/foo/bar/contents/.github/config.yml')
      .reply(200, contentFile)

    // 'legal' team review request should be performed
    const review = nock(gitHubApiUrl)
      .post('/repos/foo/bar/pulls/3/requested_reviewers', (body: any) => {
        expect(body).toMatchObject(prReviewRequestBody)
        return true
      })
      .reply(200)

    // Receive open PR event
    await probot.receive({ name: 'pull_request', payload: prOpened })

    verifyMocksWereHit(files, config, review)
    done()
  })
})

function testAccessToken () {
  // Test that we correctly return a test token
  nock(gitHubApiUrl)
    .post('/app/installations/2/access_tokens')
    .reply(200, { token: 'test' })
}

function verifyMocksWereHit (...mocks: nock.Scope[]) {
  const pendingMocks: string[] = mocks.filter(mock => !mock.isDone())
    .map(mock => mock.pendingMocks()
      .reduce(function (acc, val) {
        return acc.concat('\n', val)
      }, ''))

  if (pendingMocks.length > 0) {
    throw new Error('The following mocks were expected but not hit:' + pendingMocks)
  }
}
