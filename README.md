# files-to-review app

> A GitHub App built with [Probot](https://github.com/probot/probot) that either comments on pull request
that certain files require review from predefined team or requests review from that team when certain file(s)
(e.g. LICENSE, etc.) is submitted with pull request [pr]. See the following diagram for details:

![legal-to-review flow](./assets/legal-to-review-flow.png?raw=true)

## Setup

### Default config

By default app works in `comment-on-pull-request` mode and matches pull request's files against the following
pattern:
```regexp
(licen(s|c)e)|(copyright)|(code.?of.?conduct)
```
as a result comment (similar to the one below) gets added to the pull request.

![legal-should-review comment](./assets/comment.png?raw=true)


### Configuration description

One can configure several review criteria in `./github/config.yml` accroding to the following structure:
```yaml
reviewCriteria:
  - configName:
    name: 'display-name'
    regexp: 'pattern-to-search-for'
    teams?:
      - 'optional-reviewers-team-name'

  ...
```
Note that `teams` parameters is optional and when it is provided given `review criteria` results in app working
in `request-review-to-team` mode that manifests itself in adding team(s) to reviewers list similarly to
the picture below:

![review-request to legal](./assets/review-request.png?raw=true)

### Example

Setting the following configuration in `.github/config.yml` turns on `request-review-to-team` for `legal`
when corresponding files are modified (e.g. *LICENSE*) and `comment-on-pull-request` for `ui-experts` when UI files
are modified:
```yaml
reviewCriteria:
  - legal:
    name: 'legal-to-review'
    regexp: '(licen(s|c)e)|(copyright)|(code.?of.?conduct)'
    teams:
      - 'legal'
  - ui-experts:
    name: 'ui-experts-to-review'
    regexp: '\.css$'
```
and results in actions similar to the following pull request

![both-modes](./assets/combined.png?raw=true)

## Contributing

If you have suggestions for how legal-to-review could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2019 Jacek Centkowski <geminica.programs@gmail.com>
