# ![cipy rules](./assets/cipy_rules_small.png) files-to-review app

> A GitHub App built with [Probot](https://github.com/probot/probot) that comments on a pull request
that certain files require review from a predefined team and requests review from that team when certain files
(e.g. LICENSE, etc.) are part of the pull request [pr]. The latter operation is performed only when teams are
configured. See the following diagram for details:

![legal-to-review flow](./assets/legal-to-review-flow.png?raw=true)

## Setup

### Default config

By default, the app works in `comment-on-pull-request` mode and matches pull request's files against the following
pattern:
```regexp
(licen(s|c)e)|(copyright)|(code.?of.?conduct)
```
as a result comment (similar to the one below) gets added to the pull request.

![legal-should-review comment](./assets/comment.png?raw=true)


### Configuration description

One can configure several review criterias in `./github/config.yml` according to the following structure:
```yaml
reviewCriteria:
  - configName:
    name: 'display-name'
    regexp: 'pattern-to-search-for'
    teams?:
      - 'optional-reviewers-team-name'

  ...
```
Note that `teams` parameter is optional and when it is provided given `review criteria` results in app performing
2 operations `comment-on-pull-request` and `request-review-to-team` that manifests itself commenting which files
need to be reviewed and adding team(s) to reviewers list.

#### Example

Setting the following configuration in `.github/config.yml`
```yaml
reviewCriteria:
  - legal:
    name: 'legal-to-review'
    regexp: '(licen(s|c)e)|(copyright)|(code.?of.?conduct)'
    teams:
      - 'Lawyers'
  - ui-experts:
    name: 'ui-experts-to-review'
    regexp: '\.css$'
```
results in the following operations being performed:
* comment indicating files to be reviewed by `legal-to-review` is added
* `Lawyers` team is added to the _Reviewers_ list
* comment indicating files to be reviewed by `ui-experts-to-review` is added

It looks similar to the following pull request:

![both-modes](./assets/combined.png?raw=true)

## TODO

Introduce the following feature(s):
* Add possibility to `request-review-to-team` based on PR author's team membership. This is especially handy when junior
  developer joins the organization and his contributions should be reviewed by someone more experiences (e.g `Mentors` team member).
* Consider acting on pull request updates.

## Contributing

If you have suggestions for how files-to-review could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2019 Jacek Centkowski <geminica.programs@gmail.com>
