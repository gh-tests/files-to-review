import { Application, Context } from 'probot' // eslint-disable-line no-unused-vars
import { PullRequestsListFilesResponseItem, PullRequestsCreateReviewParams, PullRequestsCreateReviewRequestParams } from '@octokit/rest' // eslint-disable-line no-unused-vars

export = (app: Application) => {
  const DEF_PATTERN: string = '(licen(s|c)e)|(copyright)|(code.?of.?conduct)'

  app.on('pull_request.opened', async (context) => {
    context.log(`'PR:[${context.payload.pull_request.number}] has been created`)

    const files: PullRequestsListFilesResponseItem[] = await context.github.paginate(
      context.github.pullRequests.listFiles(
        context.repo({ number: context.payload.pull_request.number, per_page: 100 })),
      res => res.data
    )

    // read config from config.yaml
    const config = await context.config('config.yml',
      { legalFileRegExp: DEF_PATTERN,
        legalTeam: '' })
    app.log.debug('Config: %j', config)

    const pattern: RegExp = new RegExp(config.legalFileRegExp, 'i')
    const legalFiles: string[] = files.filter(file => isLegal(pattern, file.filename)).map(file => file.filename)
    if (legalFiles.length > 0) {
      // request review only when legal team is specified
      if (config.legalTeam.length > 0) {
        await requestReview(context, config.legalTeam)
      } else {
        await review(context, legalFiles)
      }
    }
  })

  app.on('pull_request.synchronized', async (context) => {
    context.log(`'PR:[${context.payload.pull_request.number} has been updated`)
    // TODO: next step would be to handle PR updates
  })

  function isLegal (pattern: RegExp, path: string): boolean {
    return pattern.test(path)
  }

  async function requestReview (context: Context, team: string) {
    context.log(`'Issue review request for PR:[${context.payload.pull_request.number}] for team: [${team}]'`)
    const reviewRequest: PullRequestsCreateReviewRequestParams = context.issue({ team_reviewers: [ team ] })
    await context.github.pullRequests.createReviewRequest(reviewRequest)
  }

  async function review (context: Context, legalFiles: string[]) {
    context.log(`'Comment that some files need legal review in PR:[${context.payload.pull_request.number}]'`)
    const body: string = 'The following files require legal review:' +
      legalFiles.reduce(function (acc: string, val: string) {
        return acc.concat('\n', val)
      }, '')
    let reviewComment: PullRequestsCreateReviewParams = context.issue({ body: body })
    reviewComment.event = 'COMMENT'
    await context.github.pullRequests.createReview(reviewComment)
  }
}
