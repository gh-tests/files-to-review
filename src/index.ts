import { Application, Context } from 'probot' // eslint-disable-line no-unused-vars
import { PullRequestsListFilesResponseItem, PullRequestsCreateReviewParams, PullRequestsCreateReviewRequestParams } from '@octokit/rest' // eslint-disable-line no-unused-vars
import * as ReviewConfig from './config'

export = (app: Application) => {
  app.on('pull_request.opened', async (context) => {
    context.log(`PR:[${context.payload.pull_request.number}] has been created`)

    // TODO: current implementation is synchronous consider
    // rewriting it so that it is asynchronous to save GitHub resources

    // read config from config.yaml
    const config: any = await context.config('config.yml', ReviewConfig.DEF_CONFIG)
    const validCriteria: ReviewConfig.ReviewCriteria[] = ReviewConfig.getCriteria(config)
    if (validCriteria.length === 0) {
      context.log('No valid criteria were defined %j in %s. Skipping action.',
        config.reviewCriteria, context.payload.repository.full_name)
      return
    }

    const files: PullRequestsListFilesResponseItem[] = await context.github.paginate(
      context.github.pullRequests.listFiles(
        context.repo({ number: context.payload.pull_request.number, per_page: 100 })),
      res => res.data
    )

    for (let config of validCriteria) {
      app.log.info('config: %j', config)
      if (!config.regexp) {
        app.log.info('Regexp is not defined in %j', config)
        continue
      }
      const pattern: RegExp = new RegExp(config.regexp, 'i')
      const legalFiles: string[] = files.filter(file => isLegal(pattern, file.filename)).map(file => file.filename)
      if (legalFiles.length > 0) {
        await review(context, config.reason || '', legalFiles, config.teams)
        // request review only when teams are specified
        if (config.teams && config.teams.length > 0) {
          await requestReview(context, config.teams)
        }
      }
    }
  })

  app.on('pull_request.synchronized', async (context) => {
    context.log(`PR:[${context.payload.pull_request.number}] has been updated`)
    // TODO: next step would be to handle PR updates
  })

  function isLegal (pattern: RegExp, path: string): boolean {
    return pattern.test(path)
  }

  async function requestReview (context: Context, teams: string[]) {
    context.log(`Issue review request for PR:[${context.payload.pull_request.number}] for team: [${teams}]`)
    // TODO: consider checking if team exists and in case it doesn't comment on PR
    const reviewRequest: PullRequestsCreateReviewRequestParams = context.issue({ team_reviewers: teams })
    await context.github.pullRequests.createReviewRequest(reviewRequest)
  }

  async function review (context: Context, reason: string, reviewFiles: string[], teams?: string[]) {
    context.log(`Comment that some files need review in PR:[${context.payload.pull_request.number}]`)
    const body: string = ((reason && reason.length > 0) || !teams
      ? `${reason}:`
      : '`' + teams.join('`, `') + '` review is needed for:') +
      reviewFiles.reduce(function (acc: string, val: string) {
        return acc.concat('\n* ', val)
      }, '')
    let reviewComment: PullRequestsCreateReviewParams = context.issue({ body: body })
    reviewComment.event = 'COMMENT'
    await context.github.pullRequests.createReview(reviewComment)
  }
}
