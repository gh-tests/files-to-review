# legal-to-review app

> A GitHub App built with [Probot](https://github.com/probot/probot) that either comments on pull request
that certain files require review from legal team or requests review from legal team when certain file(s)
(e.g. LICENSE, etc.) is submitted with pull request [pr]. See the following diagram for details:

![legal-to-review flow](./assets/legal-to-review-flow.png?raw=true)

## Setup

By default app works in `comment-on-pull-request` mode and matches pull request's files against the following
pattern:
```regexp
(licen(s|c)e)|(copyright)|(code.?of.?conduct)
```
Pattern can be modified by storing value under `legalFileRegExp` parameter of repository's `.github/config.yml`
file. Here is an example on how to match only `foo` file modifications (note that patterns are compiled in
case insensitve mode):
```yaml
legalFileRegExp: foo
```

One can switch app to `request-review-to-legal-team` mode by storing legal team name under `legalTeam` parameter
of repository's `.github/config.yml` file. Example on how to configure that `lawyers` team members should
receive review request when legal files are modified:
```yaml
legalTeam: lawyers
```

_Note that both options can be combined in single `.github/config.yml` file._

## Contributing

If you have suggestions for how legal-to-review could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2019 Jacek Centkowski <geminica.programs@gmail.com>
