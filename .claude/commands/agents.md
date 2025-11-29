# Quick Agent Launcher

Quickly spin up parallel agents. Command: $ARGUMENTS

## Quick Commands

### `agents status` - Check what's running

Show current worktree status and any running Claude processes.

### `agents launch <plan>` - Launch agents from a plan

Parse the plan and generate copy-paste commands for parallel execution.

### `agents backend <task>` - Launch backend agent

```bash
cd ~/Development/Flatiron/SE01/philter-mvp/worktrees/feature
claude "<task>"
```

### `agents frontend <task>` - Launch frontend agent

```bash
cd ~/Development/Flatiron/SE01/philter-mvp/worktrees/experiment
claude "<task>"
```

### `agents background <task>` - Launch headless agent

```bash
claude -p "<task>" --allowedTools "Read,Edit,Write,Bash,Grep,Glob" &
```

### `agents batch <task1> | <task2> | <task3>` - Launch multiple headless agents

```bash
claude -p "<task1>" & claude -p "<task2>" & claude -p "<task3>" & wait
```

## Your Task

Based on the command provided, either:

1. **Show status** - List worktrees, branches, and any uncommitted changes
2. **Generate commands** - Create ready-to-paste terminal commands
3. **Explain setup** - Help configure new worktrees or agents

## Worktree Quick Reference

| Alias | Path | Use For |
|-------|------|---------|
| `main` | philter-mvp/ | Your interactive work |
| `backend` / `feature` | worktrees/feature/ | Backend/API tasks |
| `frontend` / `experiment` | worktrees/experiment/ | Frontend/UI tasks |

## Common Patterns

**Full-stack feature:**
```bash
# Backend agent
cd worktrees/feature && claude "Implement [feature] API: database schema, routes, validation"

# Frontend agent (parallel)
cd worktrees/experiment && claude "Implement [feature] UI: components, hooks, pages"
```

**Fix + Test:**
```bash
# Fix agent
cd worktrees/feature && claude "Fix [bug]: investigate and implement fix"

# Test agent (parallel)
claude -p "Write tests covering [bug] scenario" &
```

**Review + Refactor:**
```bash
# Review (headless, parallel)
claude -p "Review [area] for security issues" &
claude -p "Review [area] for performance issues" &
wait

# Then refactor based on findings
cd worktrees/feature && claude "Refactor [area] based on review findings"
```
