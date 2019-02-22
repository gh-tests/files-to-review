# ![cipy rules](./assets/cipy_rules_small.png) Files To Review app

> A GitHub App built with [Probot](https://github.com/probot/probot), similar to GitHub's [Code Owners](https://help.github.com/en/articles/about-code-owners)
but offers more powerful expressions and tells teams which files they should review.

Workflow:

![legal-to-review flow](./assets/legal-to-review-flow.png?raw=true)

## Setup

### Default config

By default the app matches files against the following pattern:
```regexp
(licen(s|c)e)|(copyright)|(code.?of.?conduct)
```
![legal-should-review comment](./assets/comment.png?raw=true)

### Configuration description

You can configure several review criteria in `./github/config.yml`:
```yaml
reviewCriteria:
  - configName:
    reason: 'reason'
    regexp: 'pattern-to-search-for'
    teams:
      - 'optional-reviewers-team-name'

  ...
```
The `teams` parameter is optional. When provided it will add the team as a reviewer.
The `reason` parameter becomes optional when `teams` parameter is provided but it
takes precedence when the pull request comment header is created.

#### Example

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
would:
* comment which files should reviewed by the `Lawyers` team
* add `Lawyers` team to the _Reviewers_ list
* comment that `UI expert review is needed for stylesheets`

![both-modes](./assets/combined.png?raw=true)

## TODO

* Introduce a configuration option that allows contribution from junior members to be reviewed by their mentors.
* Act on the pull request updates.

## Contributing

If you have suggestions for how this app could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

Check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2019 Jacek Centkowski <geminica.programs@gmail.com>
