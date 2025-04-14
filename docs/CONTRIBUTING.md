# Contributing

:+1: Thank you for taking the time to contribute! First, read our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Got a question?

Check if your question is addressed in our [wiki](https://github.com/rodekruis/IBF-system/wiki), [README](../README.md), and [existing issues](https://github.com/rodekruis/IBF-system/issues). Create an [issue](https://github.com/rodekruis/IBF-system/issues/new) with sufficient details and context so we can provide the best answer.

## Found a bug?

Create a [bug issue](https://github.com/rodekruis/IBF-system/issues/new?template=Bug.md). Provide steps to reproduce, error messages, screenshots, and expected solution to help us understand the problem.

## Change lifecycle

Any change goes through the following steps,

1. Create backlog item
2. Refine item requirements
3. Commit to sprint
4. [Create pull request with changes](https://github.com/rodekruis/IBF-system/compare)
5. Review changes
6. Merge pull request
7. Publish to test environment
8. Test the product for new and existing functionality
9. Publish to staging environment
10. Review with stakeholders
11. Publish to production environment

## Code style

We use [Prettier](https://prettier.io/) for TypeScript and JavaScript code.

We use [Black](https://github.com/psf/black) for Python code.

## Commit format

We use [Conventional Commits](https://conventionalcommits.org) with the following rules:

- should start with a **prefix** to indicate the
  [type of change](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#type)
- should have a **message** to briefly describe the change
- should end with **task id(s)** to link to the sprint backlog

```text
// syntax
<prefix>: <commit_message> <devops_item_id>
    |            |                |
    |            |                └──⫸ Azure DevOps item number. Format: AB#1234
    |            |
    |            └──⫸ Summary in present tense. Not capitalized. No period at the end.
    |
    └──⫸ build|ci|docs|feat|fix|perf|refactor|test

// examples
feat: added info-popups COVID-risk AB#1234
fix: changed login-function AB#2345
```

Prefix values `feat` and `fix` are reserved for new features and bug fixes.

Commits with `feat` or `fix` prefix will
[automatically](../.github/workflows/workflow.yml)

1. create a new version
2. update [CHANGELOG.md](../CHANGELOG.md)
3. release the new version to the test environment

## Create pull request

[Create a branch](https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-and-deleting-branches-within-your-repository)
from the [master](https://github.com/rodekruis/IBF-system/tree/master) branch.
The name of the branch should be concise and descriptive of the intended
changes.

```text
// syntax
<prefix>.<branch_name>
    |            |
    |            └──⫸ 2-4 keywords joined by underscore (_). Not capitalized.
    |
    └──⫸ build|ci|docs|feat|fix|perf|refactor|test

// examples
feat.covid_risk_popup_info
fix.login_function
```

The branch should be deleted after the pull request is merged.

## Code review

We follow [Google's Code Review Guidelines](https://google.github.io/eng-practices). We add a proof of review in the form of screenshots or output messages and logs.
