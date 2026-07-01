---
name: task-validate
description: Validate that a task is properly working before marking it as Complete
---

# Validate a Task

## When to Use
Use this skill when you or the user is working on a task (see task-complete skill) and need to validate the work.

## Task files
The task file is located at `/tasks/*` in the format `{4 digit task number}-{task slug}.md`. The user should have attached the task file to the prompt, but if they only provided a task number, you should be able to find it. For example, the task might be named `0001-update-readme.md`. If they ask you to "validate task 1" or "validate the update readme task", that is the file they are referring to.

#### Task Directory & Media Files
All files related to the task—including screenshots, videos, gifs, logs, one-off scripts, and other artifacts—should be stored in a directory within `/tasks` with the same name as the task (without the `.md` extension). For example, if the task file is at `/tasks/0002-my-task.md` and you want to add a screenshot (for validation failure or success), create the directory `/tasks/0002-my-task/` if it does not already exist, and put the screenshot in there with a descriptive name (e.g., `/tasks/0002-my-task/validation-screenshot-1.png`).

## Branch Verification
Before validating, verify you are on the correct branch for the task, the branch will be named `task/{4 digit task number}-{task slug}_{description_slug}`.

## Unit Test Execution
Before committing, always run all unit tests (e.g., `npm run test`). Refer to https://raw.githubusercontent.com/dustinpoissant/kempo-testing-framework/refs/heads/main/llms.txt for details. Ensure all tests pass, including any new or updated tests.

## Missing or Unclear Acceptance Criteria
If acceptance criteria or the testing plan are missing or unclear, ask the user for clarification before proceeding with validation.

## Environment Setup Issues
If you encounter errors setting up the environment (e.g., server won’t start, missing dependencies, credentials don’t work), attempt to resolve them. If you cannot, ask the user for help and document the issue in the validation results.

## chrome-devtools-mcp
Use chrome-devtools-mcp to run your own Chromium browser and use it to test the work.

## local server
Information about how to use the local server should be in README.md (it's probably `npm run dev`). You can see the port in the README or by reading the package.json to see the script. The server might already be running (scan that port) or you may need to start it yourself.

## credentials
If you need credentials to log in to the site we are building, they should be in AGENTS.md.

## Validation
Validate that the functionality is working as described in the task's acceptance criteria, and follow any testing plan outlined in the task.

### Filling in the LLM Validation Results Section
**THIS IS CRITICAL:** When validation succeeds, you MUST fill in the "LLM Validation Results" section of the task file with:
- Subheadings for each acceptance criterion
- Subheadings for each item in the testing plan (if present)
- Pass/fail status with details and evidence (screenshots, test output, etc.) for each item
- At least one screenshot if the change is visual (stored in `/tasks/{task-number}-{slug}/` directory)

**Markdown Formatting Requirements:**
- **Embed screenshots** using relative markdown image syntax: `![Description](task-number-slug/screenshot.png)` — this allows images to work when the task directory is later moved to `released/`
- **Make localhost links clickable**: Use markdown link syntax `[description](http://localhost:PORT/path)` instead of plain URLs so the user can click them directly
- **Make file links clickable**: Use markdown link syntax `[filename](../path/to/file.js)` for source files so the user can navigate directly to them
- **Include test output**: Paste relevant test results, console output, or validation commands that were run

The "LLM Validation Results" section should provide a clear record of what was validated and that all criteria passed.

The "User Validation Results" section should always be left completely blank - the user may optionally add additional notes during "task-complete" skill step 7 if they have information beyond what you documented.

## What to do when validation fails
Put notes about the validation failure in the "LLM Validation Results" section of the task file. If the failure is visual, include a screenshot (using chrome-devtools-mcp) as described above in the "Media Files" section, and import it into the "LLM Validation Results" section in your failure notes.

### You are developing
If you are developing the task (came here from the `task-complete` skill), then you should continue to iterate (debug, code, validate) until the task is complete and has been validated to meet the acceptance criteria and the testing plan.

### You are validating another LLM's work (subagent)
You should report back to the other LLM (agent) with all the details required for it to continue to iterate on the task.

### The user is developing
You should report back to the user with all the details required for them to continue to iterate on the task.

## What to do when validation succeeds
After all failures have been corrected, clean up all failure notes in the task file's "LLM Validation Results" section, and delete any relevant screenshots (that were used in this section).

In the task file, you should add notes and screenshots to the "LLM Validation Results" section. If the change is visual, you should probably include at least one screenshot as described above in the "Media Files" section, and import it into the "LLM Validation Results" section. Then inform the parent agent or user that the validation has passed and the task is ready for user validation.