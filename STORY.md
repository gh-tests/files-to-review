# Files To Review
aka `which files should I review`

A GitHub App built with [Probot](https://github.com/probot/probot) that listens on [pull request](https://developer.github.com/v3/activity/events/types/#pullrequestevent)
webhook event and tells teams which files they should review.


# Webhooks & Probot: what's all the fuss about?

Webhooks ([help](https://help.github.com/en/articles/about-webhooks) & [developer](https://developer.github.com/webhooks/)):
* notify external systems
* act on subscribed [events](https://developer.github.com/webhooks/#events) (can opt-in for [all](https://developer.github.com/webhooks/#wildcard-event))
* installed on an organization (owner) or a specific repository (admin)
* limits (20 per org/repo)

Probot a GitHub App framework ([docs](https://probot.github.io/docs/)):
* extend GitHub's functionality
* granular permissions
* built-in webhooks
* removes webhook validation and auth boilerplate
* Node.js


# Humble beginnings

Dev for devs IOW Why?

Files To Review is similar to GitHub's [Code Owners](https://help.github.com/en/articles/about-code-owners) but
* offers extended expressions
* displays a list of files to review

Default pattern
```regexp
(licen(s|c)e)|(copyright)|(code.?of.?conduct)
```
[picture]

Adding
```yaml
reviewCriteria:
  - legal:
    regexp: '(licen(s|c)e)|(copyright)|(code.?of.?conduct)'
    teams:
      - 'Lawyers'
  - ui-experts:
    reason: 'UI expert review is needed for stylesheets'
    regexp: '\.css$'
```

to your repository's `./github/config.yml`
[picture]

Full syntax available in [README.md](https://github.com/geminica-apps/files-to-review/blob/master/README.md#configuration-description).


# Behind the scenes
[diagram]

APIs called:
* [app.on](https://probot.github.io/api/latest/classes/application.html#on)
* [context.config](https://probot.github.io/api/latest/classes/context.html#config)
* [context.github.pullRequests.listFiles](http://octokit.github.io/rest.js/#api-Pulls-listFiles)
* [context.github.pullRequests.createReview](http://octokit.github.io/rest.js/#api-Pulls-createReview)
* [context.github.pullRequests.createReviewRequest](http://octokit.github.io/rest.js/#api-Pulls-createReviewRequest)


# Turn Files To Review into Pull Request Assistant
* juniors and mentors
* LFS locks guard
* automatically propose reviewers (blame/history)
* ChatOps
* insights
* ...


# Q&A