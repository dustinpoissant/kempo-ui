---
name: task-create
description: Create a new task to be refined and completed at another time
---
# Task files are always created in the current repository, even when this skill is invoked globally. All file locations are relative to the repository you are working in.

# Create a Task

## When to Use

Use this skill when there is work that needs to be completed and is outside the scope of the current task.

## Goal of this skill
The goal is to create a preliminary task file. All details do not need to be fleshed out at the time of creation. The purpose is to create the file and outline the current state and acceptance criteria.

If the scope was discussed, you may fill out the scope sections; otherwise, leave them as the template value (i.e., `{description}`), and the user or LLM will figure that out at a later date.

If the task details (implementation details) were discussed, you may fill out the task details section; otherwise, leave it as the template value.

If the testing strategy was discussed, you may fill out the testing section; otherwise, leave it as the template value.

The goal of this skill is not to do the task, or even fully plan the task—just to create the task to be planned at a later date, unless you have all the information needed to fully plan it at the time you were asked to create a new task.

## Task Status

If there are still sections that need to be defined at a later date (which is perfectly acceptable), then set the status to "Planning".

If there are dependencies (other tasks) that need to be completed first, then set the status to "Blocked".

If the task is not blocked, and all the sections are filled out, then set the status to "Ready".

## Files and Templates

### Task file location and names
Create a new markdown file in the repo under `/tasks/*` that follows the naming convention `{four digit task number}-{description slug (3-6 words, hyphen-separated, all lowercase)}`. The task number must always be four digits with leading zeros (e.g., `0001-update-readme.md`).

Released tasks should be moved into `tasks/released/*`. When this folder gets to around 100 tasks, move the tasks to another repo, `kempo-blog-task-archive`, to avoid having thousands of markdown files cluttering this repo. This allows for future reference.

Always look for the most recent task number—it might be directly in `/tasks/*` or in `/tasks/released/*`—and then use the next available number.

#### Media Files
All media files (screenshots, videos, gifs, etc.) needed for this task should be stored in a directory within `/tasks` with the same name as the task (without the `.md` extension). For example, if the task file is at `/tasks/0002-my-task.md` and you want to add a screenshot (for instance, to include in the "current state" description), create the directory `/tasks/0002-my-task/` if it does not already exist, and put the screenshot in there with a descriptive name (e.g., `/tasks/0002-my-task/current-state-screenshot-1.png`).

### Template
Use the template in `/tasks/_template.md` to create the task file. **Follow the template exactly as written — do not deviate, add placeholder text, or make creative changes.**

Replace only the parts in curly braces `{...}` with the actual content. For example:
- `{Task Number}` → `0001`
- `{How does this feature currently work}` → Markdown section explaining the current state
- `{How does it need to work to consider this task a success}` → Markdown explaining the end state

When the template says **"leave blank"** in the braces (e.g., `{leave blank, it will be filled out by the LLM that validate the task}`), you must literally leave that section empty — do not add placeholder text, instructions, or fill in anything. An empty section signals that someone else will fill it later.

