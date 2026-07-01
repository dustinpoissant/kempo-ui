---
name: task-complete
description: Complete a task defined in a task file
---

# Complete a Task

⚠️ **CRITICAL: DO NOT SKIP ANY STEPS UNLESS EXPLICITLY TOLD TO DO SO BY THE USER.** Each step is required and must be completed in order. Skipping steps, even if they seem similar or redundant, will cause oversights and bugs.

## When to Use

Only use this skill if the task's status is "Ready". If the task is not yet ready, tell the user that it is not ready and they need to fully define the task or instruct you to use the task-prepare skill.

## Files and Templates

### Task files
The task file is located at `/tasks/*` in the format `{4 digit task number}-{task slug}.md`. The user should have attached the task file to the prompt, but if they only provided a task number, you should be able to find it. For example, the task might be named `0001-update-readme.md`. If they ask you to "do task 1" or "do the update readme task", that is the file they are referring to.

### Task Directory for Artifacts
All files related to the task—including screenshots, videos, gifs, logs, one-off scripts, and other artifacts—should be stored in a directory within `/tasks` with the same name as the task (without the `.md` extension). For example, if the task file is at `/tasks/0002-my-task.md`, use `/tasks/0002-my-task/` for all such files (e.g., `/tasks/0002-my-task/testing-plan-screenshot-1.png`, `/tasks/0002-my-task/debug-log-1.txt`).

## Git Branching
Each task should be completed in its own git branch. Use the format `task/{task filename without .md extension}`. For the example above, the git branch would be `task/0001-update-readme`.

## Steps:
### Step 1. Change the status of the task from "Ready" to "In Progress".

### Step 2. Check the git status
Before creating a new branch, always verify that there are no uncommitted file changes:
```
git status
```
    
### Step 3. Get on master
All task branches will be based on master/main unless stated otherwise in the task. Switch to that branch and update it:
```
git checkout master && git pull
```
    
### Step 4. Create the new branch
```
git checkout -b task/0001-update-readme
```
    
### Step 5. Do the work
Change the task's status to "In Progress". Do the work defined in the task to the best of your ability.

**FOR TEST TASKS:** If the task is about creating, modifying, or testing unit tests, you must **actually run the tests** as part of Step 5. Do not defer this to Step 6. Verify that the tests pass or fail as expected before moving forward.

#### Ask Questions
In theory, the entire task should be well defined with all relevant references for context, but if you have questions, ask the user for clarifications.

### Step 6. Update Docs
Use the ["docs-update" skill](../docs-update/SKILL.md) to update all the documentation. For this repo, the docs are the live examples of the components, so create and update any example pages that demonstrate the feature. This is critical for validating the feature works as intended.

### Step 7. Update Unit Tests
Some repos have unit tests, some do not. If there is a directory named `tests` in the root of the repo, then it has unit tests. Read the README to understand what testing framework is used—do not assume it is JEST, Enzyme, React Testing Library, or any other common framework. It is probably [kempo-testing-framework](https://raw.githubusercontent.com/dustinpoissant/kempo-testing-framework/refs/heads/main/llms.txt), but check the README and package.json (if they exist) to determine the framework.

Look at existing tests to understand the syntax and best practices used in this repo.

**CRITICAL:** If your task changed any code functionality (as opposed to being purely a test creation task):
- Determine if existing unit tests need to be updated to cover the new code
- Create new tests if needed
- **Actually run the test suite** and verify all tests pass (including existing tests)
- Do not proceed until you have confirmed test results

**Note:** While writing tests, you may discover issues from the doc examples created in Step 6. Fix those issues in the component code and re-run tests until they pass.

### Step 8. LLM Validation (LLM Validation Results)
Once you believe you have completed the work, validate it thoroughly using the live documentation:

**FOR ALL TASKS:** Use the [Validate Task Skill](../task-validate/SKILL.md) to validate before moving on. Fill in the "LLM Validation Results" section of the task file with detailed evidence (screenshots from live docs, test output, console logs, etc.) for each acceptance criterion. Embed the validation screenshots, don't just link to them.

**DO NOT PROCEED TO STEP 9 until you have actual evidence that your work is valid.**

### Step 9. User Testing and Validation - **REQUIRED BLOCKING FEEDBACK LOOP**

**YOU MUST STOP HERE AND WAIT FOR USER FEEDBACK. THIS IS A BLOCKING POINT WITH NO EXCEPTIONS.**

Once you have completed and validated the task, ask the user to validate / test it manually using the live documentation. Give them all relevant information and instructions on how to validate/test the work you have done. Clearly indicate that they need to fill out the "User Validation Results" section of the task.

**CRITICAL: This is a feedback loop.** If the user identifies issues:
1. Fix the issues
2. Re-validate the fixes (re-run tests, verify docs still work)
3. **STOP AGAIN AND WAIT FOR USER APPROVAL** - Do not automatically proceed
4. Only move to Step 10 after the user explicitly confirms the fixes are acceptable

**DO NOT MOVE FORWARD TO STEP 10 UNTIL THE USER EXPLICITLY SAYS "OK" OR APPROVES THE WORK.** Every time you loop back with fixes, you must get explicit approval again before proceeding.

### Step 10. Update the CHANGELOG.md - **NEVER SKIP THIS STEP**

⚠️ **CRITICAL: This step is ALWAYS required unless the user explicitly tells you to skip it.** This step has been skipped before with negative consequences. Do not skip it.

Use the ["changelog-update" skill](../changelog-update/SKILL.md) to update the changelog. Put this in the "Unreleased" section with a clear entry describing what was added, changed, or fixed by this task.

### Step 11. Change the task's status to "Complete"
Update the status of the task in the task file to "Complete".

### Step 12. Stage, Commit, and Push
Stage your work, commit your work to the branch, and use a commit message that starts with the branch name. This way, when it is "squashed and merged" into master/main, we can know what task/branch the commit came from. For example: `task/0001-update-readme Added a lot of awesome information to the readme`. Don't make the commit message longer than a paragraph (4-5 sentences); most of the time, 1 sentence is enough. Then finally push.

```
git add . && git commit -m "task/0001-update-readme Added a lot of awesome information to the readme" && git push
```

### Step 13. Create a PR
Using the `gh` cli, create a PR for this task.


## What not to do
Do not merge the branch into master/main, do not move the task and associated directory into `/tasks/released/*`.

