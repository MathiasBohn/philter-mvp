# Parallel Feature Implementation

You are coordinating parallel agents to implement a new feature. The feature is: $ARGUMENTS

## Your Task

1. **Analyze the feature request** and break it down into:
   - Backend tasks (database, API routes, server logic)
   - Frontend tasks (components, hooks, UI)
   - Shared tasks (types, utilities, validation schemas)

2. **Create an implementation plan** with clear task separation:
   - Identify which tasks can run in parallel
   - Identify dependencies between tasks
   - Estimate complexity of each task

3. **Generate agent commands** for parallel execution:

   Provide copy-paste commands in this format:

   ```bash
   # Terminal 1 - Backend Agent (worktrees/feature)
   cd ~/Development/Flatiron/SE01/philter-mvp/worktrees/feature
   claude "Backend tasks: [specific tasks here]"

   # Terminal 2 - Frontend Agent (worktrees/experiment)
   cd ~/Development/Flatiron/SE01/philter-mvp/worktrees/experiment
   claude "Frontend tasks: [specific tasks here]"

   # Background - Support tasks (headless)
   claude -p "[task]" --allowedTools "Read,Edit,Write,Bash" &
   ```

4. **Provide merge instructions** for when agents complete:
   ```bash
   git checkout main
   git merge feature/agent-work --no-ff -m "feat: [description]"
   git merge experiment/sandbox --no-ff -m "feat: [description]"
   ```

## Context
- This is a Next.js 16 / React 19 / TypeScript / Supabase project
- Backend = Supabase (database, auth, storage) + Next.js API routes
- Frontend = React components in /components, pages in /app
- Worktrees are at: ~/Development/Flatiron/SE01/philter-mvp/worktrees/

Be specific with task assignments. Each agent should have clear, non-overlapping responsibilities.
