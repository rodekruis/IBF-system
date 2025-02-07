# Contributing to IBF

:+1: Thank you for taking the time to contribute! Read our
[code of conduct](./CODE_OF_CONDUCT.md) before contributing.

## Got a Question or Problem?

[Post a question in the IBF Teams channel.](https://teams.microsoft.com/l/channel/19%3ab262590b1cc34ade9bbdb584f0765b31%40thread.skype/%255BRD%255D%2520Impact-based%2520forecasting?groupId=48e3c654-ac7d-4abc-9c70-ad637fb0a85f&tenantId=d3ab9790-6ae2-4bd8-aa5e-02864483e7c7)
Provide sufficient details and context so that others can understand and help.

## Found a Bug?

[Create a bug in the IBF backlog.](https://dev.azure.com/redcrossnl/IBF%20System/_backlogs/backlog)
Provide steps to reproduce, error messages and screenshots to help understand
the problem.

## Change Lifecycle

Any change goes through the following steps,

1. [Create backlog item](https://dev.azure.com/redcrossnl/IBF%20System/_backlogs/backlog)
2. Refine item requirements
3. Commit to sprint
4. [Create pull request with changes](https://github.com/rodekruis/IBF-system/compare)
5. Review changes
6. Merge pull request
7. Test for product stability
8. Publish to stage environments
9. Publish to production environments

We use [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) for
code change management.

## Code Style

We use [Prettier](https://prettier.io/) for TypeScript and JavaScript code.

We use [Black](https://github.com/psf/black) for Python code.

Code style is enforced by [pre-commit](../package.json#L44) and
[pre-push](../package.json#L45) git hooks and our
[GitHub Action workflow](../.github/workflows/workflow.yml).

## Commit Format

We use the [Conventional Commit](https://conventionalcommits.org/) format with
the following rules:

- should start with a **prefix** to indicate the
  [type of change](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#type)
- should have a **message** to briefly describe the change
- should end with **task id(s)** to link to the sprint backlog

```text
// syntax
<prefix>: <commit_message> <devops_item_id>​​​​​​​
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

## Create Pull Request

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

## Code Review

We follow
[Google's Engineering Practices documentation](https://google.github.io/eng-practices/).
Provide proof of review in the form of screenshots or output messages.

## Datamodel migrations

When making changes to the datamodel of the API-service (creating/editing any \*.entity.ts files), you need to create a migration script to take these changes into affect.

The process is

1. Make the changes in the \*.entity.ts file
2. Generate a migration-script with "docker-compose exec ibf-api-service npm run migration:generate <name-for-migration-script>"
3. Restart the ibf-api-service >> this will always run any new migration-scripts, so in this case the just generated migration-script
4. If more change required, then follow the above process as often as needed.
5. See also [TypeORM migration documentation](https://github.com/typeorm/typeorm/blob/master/docs/migrations.md)

NOTE: if you're making many datamodel changes at once, or are doing a lot of trial and error, you have another option.

1. In services/API-service/ormconfig.js set `synchronize` to `true` and restart ibf-api-service.
2. This will make sure that any changes you make to \*.entity.ts files are automatically updated in your database tables, which allows for quicker development/testing.
3. When you're done with all your changes, you will need to revert all changes temporarily to be able to create a migration script. There are multiple ways to do this, for example by stashing all your changes, or working with a new branch. Either way:
   - stashing all your changes (git stash)
   - let ibf-api-service restart, so that datamodel changes are reverted as well again
   - set `synchronize` back to `false` and restart ibf-api-service
   - get your stashed changes again (git stash pop)
   - generate migration-script (see above)
   - restart ibf-api-service (like above, to run the new migration-script)

## ! ! ! DO NOT ! ! !

1. DO NOT manually change the version number in `package.json`
2. DO NOT manually edit the [CHANGELOG.md](../CHANGELOG.md)
3. DO NOT edit any existing migration-scripts in migration-folder (./services/API-service/migration/)
