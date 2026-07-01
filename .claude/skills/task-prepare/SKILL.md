---
name: task-prepare
description: Take a task that was already created and is in the "Planning" status, and fully define it to be completed at a later date.
---

# Prepare a Task

## When to Use

Only use this skill when the task's status is "Planning" or "Ready", and the user indicates they want changes to an already planned or ready task. If the user asks you to use this skill on a task that is already "In Progress", confirm with them that they want to replan a task that is currently in progress, as this could cause problems. Skip this check if the user is already aware the task is in progress and has explicitly asked you to use this skill anyway.

## Task files

The task file is located in the repo at `/tasks/*` in the format `{4 digit task number}-{task slug}.md`, for example `/tasks/0002-my-task.md`. The user should attach the task file to the prompt, but if they only provide a task number or description, you should be able to find it.

### Task Directory for Artifacts
All files related to the task—including screenshots, videos, gifs, logs, one-off scripts, and other artifacts—should be stored in a directory within `/tasks` with the same name as the task (without the `.md` extension). For example, if the task file is at `/tasks/0002-my-task.md` and you want to add a screenshot (for instance, to include in the "testing plan" description), create the directory `/tasks/0002-my-task/` if it does not already exist, and put the screenshot or other files in there with a descriptive name (e.g., `/tasks/0002-my-task/testing-plan-screenshot-1.png` or `/tasks/0002-my-task/debug-log-1.txt`).

## Steps

### 1. Compare to Template
The task was created from a template (the task-create skill did this), but the template may have changed since the task was created. Before continuing, verify that the current state of the task file aligns with the current state of `/tasks/_template.md`. If it does not, update the task to match the new template to the best of your ability.

### 2. Identify the gaps
During the task creation stage, the "Current State" and "Acceptance Criteria" should have been filled out, but the rest of the template may have been left as-is. Identify sections that are not filled out. You can easily identify these "gaps" because there will be instructions in curly braces like `{write a description}`. If the "Current State" and "Acceptance Criteria" are not filled out, or seem out of date, identify those as gaps that need to be filled in as well. The validation steps should not be filled out in the planning phase, those will be filled out after the task is completed (during valiation).

### 3. Fill the gaps
Given the context you have in the conversation with the user, fill in the gaps that you feel confident you have enough information to fill. If you are unsure, leave it for the next step.

### 4. Research
For gaps you have identified but do not feel you have enough information to fill in, research the project to try and find the missing information. Other tasks defined in the "Dependency" section, other tasks/files/links in the "References" section, and the Agents.md and README.md are good places to start before diving into code and other tasks (not listed in those sections).

Do not spend too much time on this research step. If you cannot find the answer quickly, move on to the next step and ask the user for clarification.

### 5. Ask for clarity
The user may have the answers you are seeking. Ask them for clarity on the gaps, or on any already filled-in sections that you feel are not clear enough.

### 6. Iterate
Repeat steps 2 through 5 until the entire task has been well defined. If the user does not provide enough information, continue to ask for clarification and loop back as needed until the requirements are clear.

### 7. User Review
Save your changes to the task file, and ask the user to review it. They may mark it as "ready" or ask you to do so (the next/final step).

### 8. Update the status to "Ready"
Update the task status to "Ready" and tell the user this skill is completed and the task is ready to be worked on.
