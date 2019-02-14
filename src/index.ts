import { Application, Context } from 'probot' // eslint-disable-line no-unused-vars
import { PullRequestsListFilesResponseItem } from '@octokit/rest' // eslint-disable-line no-unused-vars

export = (app: Application) => {
  const pattern: RegExp = new RegExp('(licen(s|c)e)|(copyright)|(code.?of.?conduct)', 'i')

  app.on('pull_request.opened', async (context) => {
    context.log(`'PR:[${context.payload.pull_request.number}] has been created`)

    const files: PullRequestsListFilesResponseItem[] = await context.github.paginate(
      context.github.pullRequests.listFiles(
        context.issue({ number: context.payload.pull_request.number, per_page: 100 })),
      res => res.data
    )

    for (let file of files) {
      if (isLegal(file.filename)) {
        await requestReview(context)
        break
      }
    }
  })

  app.on('pull_request.synchronized', async (context) => {
    context.log(`'PR:[${context.payload.pull_request.number} has been updated`)
    // TODO: next step would be to handle PR updates
  })

  function isLegal (path: string): boolean {
    return pattern.test(path)
  }

  async function requestReview (context: Context) {
    context.log(`'PR:[${context.payload.pull_request.number}] contains files that need to be reviewed by legal team'`)
    const reviewRequest = context.issue({ team_reviewers: [ 'legal' ] })
    await context.github.pullRequests.createReviewRequest(reviewRequest)
  }
}
