# Parallel Bug Fix

You are coordinating parallel agents to fix a bug or issue. The issue is: $ARGUMENTS

## Your Task

1. **Investigate the issue** using explore agents:
   - Search for relevant code
   - Identify the root cause
   - Find all affected areas

2. **Create a fix plan** with parallel tasks:
   - Primary fix (the main code change)
   - Related fixes (other areas affected)
   - Test coverage (ensure the fix is tested)
   - Regression check (ensure nothing else breaks)

3. **Generate agent commands**:

   ```bash
   # Terminal 1 - Primary Fix Agent
   cd ~/Development/Flatiron/SE01/philter-mvp/worktrees/feature
   git checkout -b fix/[issue-name]
   claude "Fix: [primary fix task with context]"

   # Terminal 2 - Test Agent (headless)
   claude -p "Write tests to cover [the bug scenario] and verify the fix" &

   # Terminal 3 - Regression Check (headless)
   claude -p "Check for similar patterns in the codebase that might have the same issue" &
   ```

4. **Verification steps**:
   ```bash
   npm run build
   npm run lint
   npm run test
   ```

## Context
- Philter is a NYC co-op/condo board application platform
- Key areas: applications/, broker/, agent/, board/ in app/(dashboard)
- State management: React Query + Supabase
- Forms: React Hook Form + Zod validation
