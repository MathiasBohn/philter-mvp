# Parallel Refactoring

You are coordinating parallel agents to refactor code. The refactoring goal is: $ARGUMENTS

## Your Task

1. **Analyze the refactoring scope**:
   - What code needs to change?
   - What patterns should be applied?
   - What are the risks?

2. **Create a safe refactoring plan**:

   | Agent | Worktree | Tasks | Risk Level |
   |-------|----------|-------|------------|
   | Analysis | main | Identify all affected files | None |
   | Refactor A | feature | Refactor area 1 | Medium |
   | Refactor B | experiment | Refactor area 2 | Medium |
   | Tests | headless | Update/add tests | Low |

3. **Generate agent commands**:

   ```bash
   # Step 1 - Analysis (run first, in main)
   claude "Analyze: Find all files affected by [refactoring goal]. List them with line numbers."

   # Step 2 - Parallel Refactoring (after analysis)
   # Terminal 1
   cd ~/Development/Flatiron/SE01/philter-mvp/worktrees/feature
   claude "Refactor [area 1]: Apply [pattern] to [files]. Ensure types are correct."

   # Terminal 2
   cd ~/Development/Flatiron/SE01/philter-mvp/worktrees/experiment
   claude "Refactor [area 2]: Apply [pattern] to [files]. Ensure types are correct."

   # Background - Update tests
   claude -p "Update tests affected by [refactoring]. Ensure all tests pass." &
   ```

4. **Validation before merge**:

   ```bash
   # In each worktree
   npm run build && npm run lint && npm run test
   ```

5. **Merge strategy** (use --no-ff to preserve history):

   ```bash
   git checkout main
   git merge feature/agent-work --no-ff -m "refactor: [description]"
   git merge experiment/sandbox --no-ff -m "refactor: [description]"
   ```

## Safety Guidelines

- Always run build + lint + test before merging
- Review diffs before merging: `git diff main..feature/agent-work`
- Keep refactoring commits separate from feature commits
