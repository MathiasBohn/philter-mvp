# Parallel Test Generation

You are coordinating parallel agents to write tests. Test target: $ARGUMENTS

## Your Task

Generate comprehensive test coverage using parallel specialized agents:

1. **Unit Test Agent** - Component and function tests:
   - React component tests with Testing Library
   - Utility function tests
   - Hook tests
   - Validation schema tests

2. **Integration Test Agent** - API and flow tests:
   - API route tests
   - Supabase integration tests
   - Form submission flows
   - Auth flows

3. **E2E Test Agent** - End-to-end scenarios:
   - User journey tests with Playwright
   - Critical path coverage
   - Cross-browser testing

## Generate Commands

```bash
# Parallel test generation

# Unit Tests - worktrees/feature
cd ~/Development/Flatiron/SE01/philter-mvp/worktrees/feature
claude "Write unit tests for $ARGUMENTS using Vitest and React Testing Library. Cover:
- Component rendering
- User interactions
- Edge cases
- Error states
Place tests in __tests__ folders next to source files."

# Integration Tests - worktrees/experiment
cd ~/Development/Flatiron/SE01/philter-mvp/worktrees/experiment
claude "Write integration tests for $ARGUMENTS. Cover:
- API route handlers
- Database operations
- Auth middleware
- Error handling
Place tests in __tests__/integration/"

# E2E Tests - headless
claude -p "Write Playwright E2E tests for $ARGUMENTS. Cover:
- Happy path user flows
- Error scenarios
- Form validations
Place tests in e2e/ directory" &
```

## Merge Test Files

```bash
# Copy test files from worktrees to main
cp -r worktrees/feature/__tests__/* ./__tests__/
cp -r worktrees/experiment/__tests__/* ./__tests__/

# Or merge branches
git merge feature/agent-work --no-ff -m "test: add unit tests for [feature]"
git merge experiment/sandbox --no-ff -m "test: add integration tests for [feature]"
```

## Verify Coverage

```bash
npm run test -- --coverage
```
