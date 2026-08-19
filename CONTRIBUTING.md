# Contributing to westures-core

Thanks for contributing to westures-core. Contributions to the gesture engine,
tests, documentation, and examples are welcome.

## Development Setup

This project uses npm and is [tested in CI](./.github/workflows/node.js.yml) across a matrix of recent Node versions.

Install dependencies with:

```sh
npm clean-install --ignore-scripts
```

## Common commands

Run the same checks used by CI before opening a pull request:

```bash
npm run build
npm run lint
npm test
npm run test:coverage
```

Additional useful commands:

```bash
npm run build:debug
npm run lint:fix
```

## Development Workflow

- Keep changes focused and update tests when behavior changes.
- Update `CHANGELOG.md` for notable user-facing, maintenance, or security changes.
- Open a pull request using the repository's pull request template.

The source is in `src/`, tests are in `test/`, and `index.js` is the package
entry point. The `dist/` directory contains build output; regenerate it with
`npm run build` rather than editing it directly.

Follow the existing JavaScript style. ESLint enforces the project conventions,
including two-space indentation, single quotes, semicolons, and trailing commas
in multiline constructs.

## Pull Requests

Before opening a pull request, run the build, linter, and relevant tests. Give
the pull request a clear description, explain any behavioral changes, and use
the provided pull request template to identify its type. Keep unrelated
formatting or refactoring changes out of the pull request.

For bugs, include a regression test when practical. For user-facing API or
behavior changes, update the README and JSDoc documentation as appropriate.

## Reporting Issues

When reporting a bug, include the Node.js version, browser and version when
relevant, a minimal reproduction, expected behavior, and actual behavior.

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE).

## Release process

For a package release, use the following workflow so you publish from the same
source commit you tag (with build artifacts generated locally), while only
pushing the tag after `npm publish` succeeds.

1. Create a release preparation branch from `main`.
2. Update `package.json`, `package-lock.json`, and `CHANGELOG.md` for the new version.
3. Commit the release preparation changes and open a pull request.
4. Merge the pull request into `main`.
5. Check out the merged `main` commit locally.
6. Verify the working tree is clean.
7. Create the release tag locally for that commit, but do not push it yet.
8. Check what will be published with `npm pack --dry-run`.
9. Sanity-check the built bundle in `dist/index.js`.
10. Publish the package to npm from the tagged commit.
11. Push the tag.
12. Create the GitHub release from the pushed tag.

Example commands for `1.3.1`:

```bash
git switch --create release/1.3.1
git add package.json package-lock.json CHANGELOG.md
git commit --message "Prepare for 1.3.1 release"
gh pr create
# merge the PR, then sync your local main to the merged commit
git switch main
git pull --ff-only origin main
git status --short  # must produce no output
git tag --annotate v1.3.1 --message "Release 1.3.1"
npm pack --dry-run  # also builds, via 'prepare' script
ls -lh dist/index.js
npm publish
git push origin v1.3.1
gh release create v1.3.1 --title "v1.3.1"
```

If you want GitHub release notes to match the changelog closely, paste the
`1.3.1` section of `CHANGELOG.md` into the release notes when creating the
release.
