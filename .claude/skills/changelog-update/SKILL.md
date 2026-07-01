---
name: changelog-update
description: Use this skill when you need to update the CHANGELOG
---

# Changelog Update

## When to Use
Use this skill when you need to update the CHANGELOG.md.

## What is the CHANGELOG.md
Some repos may have a changelog, some will not. It is a file named CHANGELOG.md in the root of the repo.


## What to do if there is no CHANGELOG.md
If you came to this skill from another skill, just skip that step—do not attempt to create or update a changelog if one does not exist.

If you are trying to perform this skill because the user explicitly asked you to, inform them that there is no CHANGELOG.md and ask if they would like you to create one. Then ask if you should search the git history to retroactively create a changelog from the git commit history, or just initialize the changelog as if this was the first commit. I often do this at the end of the "alpha" phase of a project—even though there may be 100 commits, we just treat the current one as "init".

## Do I update the package.json version too?
**No**—do **NOT** update the package.json version.

The `.github/workflow/publish.yml` will automatically increment the patch version of the repo when it is published, so **DO NOT** update the version manually.


## What version number do I use?
Assume the current change (next push to master/main) will be a patch version unless told otherwise, and add a changelog entry for the next patch version. For example, if the current package.json version is `1.4.14`, you should create a new changelog entry for `1.4.15`, but **do not** increment it in the `package.json`—it will be done automatically.

If you believe that the change should be a minor or major version update, tell the user. They will need to quickly cancel the "publish" workflow on github.com (because it will increment the patch version by default) and then manually re-run the workflow, specifying a minor or major version bump as needed.

## How do I edit the changelog
Follow the conventions of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

### Example entry (Keep a Changelog format)

```
## [1.4.15] - 2026-05-01
### Added
- Support for new authentication method

### Fixed
- Corrected typo in user settings page
```