# Worktree Management

Manage Git worktrees for parallel agent work. Action: $ARGUMENTS

## Available Actions

### `list` - Show all worktrees

```bash
git worktree list
```

### `create <name>` - Create a new worktree

```bash
# Create worktree with new branch
git worktree add ~/Development/Flatiron/SE01/philter-mvp/worktrees/<name> -b <branch-name> main

# Install dependencies in new worktree
cd ~/Development/Flatiron/SE01/philter-mvp/worktrees/<name>
npm install
```

### `remove <name>` - Remove a worktree

```bash
# First, merge or discard changes
git worktree remove ~/Development/Flatiron/SE01/philter-mvp/worktrees/<name>

# If force needed (discards changes)
git worktree remove --force ~/Development/Flatiron/SE01/philter-mvp/worktrees/<name>

# Clean up the branch if no longer needed
git branch -d <branch-name>
```

### `reset` - Reset worktrees to clean state

```bash
# Reset feature worktree to main
cd ~/Development/Flatiron/SE01/philter-mvp/worktrees/feature
git checkout feature/agent-work
git reset --hard main
npm install

# Reset experiment worktree to main
cd ~/Development/Flatiron/SE01/philter-mvp/worktrees/experiment
git checkout experiment/sandbox
git reset --hard main
npm install
```

### `status` - Check status of all worktrees

```bash
echo "=== Main ===" && cd ~/Development/Flatiron/SE01/philter-mvp/philter-mvp && git status --short
echo "=== Feature ===" && cd ~/Development/Flatiron/SE01/philter-mvp/worktrees/feature && git status --short
echo "=== Experiment ===" && cd ~/Development/Flatiron/SE01/philter-mvp/worktrees/experiment && git status --short
```

## Your Current Worktrees

| Name | Path | Branch |
|------|------|--------|
| main | philter-mvp/ | main |
| feature | worktrees/feature/ | feature/agent-work |
| experiment | worktrees/experiment/ | experiment/sandbox |

## Quick Reference

Based on the action requested, provide the appropriate commands and execute if requested.
