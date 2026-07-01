---
name: task-release
description: Release a task after the PR has been approved
---

# Release a Task

## When to Use
Use this skill after the PR has been approved and you were asked to release a task.

## Task files
The task file is located at `/tasks/*` in the format `{4 digit task number}-{task slug}.md`. The user should have attached the task file to the prompt, but if they only provided a task number, you should be able to find it. For example, the task might be named `0001-update-readme.md`. If they ask you to "release task 1" or "release the update readme task", that is the file they are referring to.

#### Task Directory & Media Files
All files related to the task—including screenshots, videos, gifs, logs, one-off scripts, and other artifacts—should be stored in a directory within `/tasks` with the same name as the task (without the `.md` extension). For example, if the task file is at `/tasks/0002-my-task.md` the task directory will be `/tasks/0002-my-task`, this may or may not exist and it may or may not have files in it.



## Steps

## Step 0a: Branch Verification
Verify you are on the correct branch for the task. The branch will be named `task/{4 digit task number}-{task slug}_{description_slug}`. If you are not on the correct branch, switch to it before proceeding.

#### Step 0b: Get approval to release
Ask the user if you should proceed with the release. Only continue if the user clearly communicates approval to proceed (e.g., "yes", "go for it", "release it", or similar).

### Step 1: Merge in the latest master / main
Fetch the latest master / main and merge it into this task branch. Resolve any conflicts. If you encounter merge conflicts that cannot be resolved automatically, do your best to resolve them. If you are unable to resolve a conflict, communicate with the user to work through it together.

#### Step 1a: Build
In theory, this should have already been done before the PR. But if the repo has a build script, run it (`npm run build`), then stage and commit any changes.
If you encounter errors or failed builds during the release process, do your best to resolve them. If you are unable to resolve an issue, communicate with the user to work through the error together.

### Step 2: Verify version bump
**Never** update the package.json version yourself. The "publish" workflow (GitHub Actions) will automatically do a patch version bump on a push from master / main.

If the user has said this will be a major or minor version update, then it will be. If they did not specify and you believe this should be a major or minor version bump, then ask the user, as they will need to do the publish workflow manually.

### Step 3: CHANGELOG.md
If there is no CHANGELOG.md, skip this step.

There should be an entry in the CHANGELOG.md under the Unreleased category. Use the ["changelog-update" skill](../changelog-update/SKILL.md) to move this task entry from "Unreleased" into the correct section with the correct version as determined in step 2.

### Step 4: Update relative links to source files in task file

Before moving the task file to `/tasks/released/`, update relative links that point to source code files so they work from the new directory depth.

**Links to update:**
- **File links to source code**: Change `[](../src/...)` → `[](../../src/...)` (add one additional `../` to account for the extra directory level when moving to `released/`)
- **Image embeds** (screenshots): Keep as-is; they don't change because the task directory moves with the file
- **Localhost links**: Keep as-is; they are absolute URLs

### Step 5: Move task file and directory to `/tasks/released/`

Move both the task file and its task directory from `/tasks/` to `/tasks/released/`:
- Move `/tasks/{number}-{slug}.md` → `/tasks/released/{number}-{slug}.md`
- Move `/tasks/{number}-{slug}/` directory → `/tasks/released/{number}-{slug}/` (if it exists)

### Step 6: Update task status

Update the status in the task file to "Released".

### Step 7: Commit and push
After the changes from steps 3, 4, 5, and 6, commit these changes and push.

### Step 8: Merged into master / main
Get back on the latest master / main branch, merge in this task branch, resolve any conflicts, and commit. Do **not** push yet.

### Step 9: Get final approval
Tell the user that the release is ready for final approval and ask if you should proceed. Only continue if the user clearly communicates approval to proceed (e.g., "yes", "go for it", or similar). If it is a major or minor change, they will need to quickly cancel the GitHub "publish" action and manually restart the action with the correct version update.

### Step 10: Validate
Ask the user to validate that the release was successful. They will check the live website.

### Step 11: Cleanup
Once the release has been validated, delete the task branch both locally and on remote (GitHub). The PR will close automatically when the branch is merged into main.

```bash
git branch -d {task-branch-name}
git push origin --delete {task-branch-name}
```

Replace `{task-branch-name}` with the branch name (e.g., `task/0001-update-readme_initial_update`).
