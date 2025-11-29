# Parallel Code Review

You are coordinating parallel agents to review code. Review target: $ARGUMENTS

## Your Task

Spin up specialized review agents that each focus on a specific aspect:

1. **Security Agent** - Check for vulnerabilities:
   - SQL injection, XSS, CSRF
   - Auth/authorization issues
   - Sensitive data exposure
   - Supabase RLS policy gaps

2. **Performance Agent** - Check for performance issues:
   - N+1 queries
   - Unnecessary re-renders
   - Missing memoization
   - Large bundle imports

3. **Type Safety Agent** - Check TypeScript:
   - Any types that should be specific
   - Missing null checks
   - Incorrect type assertions
   - Schema/type mismatches

4. **Best Practices Agent** - Check code quality:
   - React patterns (hooks, effects)
   - Error handling
   - Accessibility (a11y)
   - Code duplication

## Generate Commands

```bash
# Run all review agents in parallel (headless)

# Security Review
claude -p "Security review: Analyze $ARGUMENTS for security vulnerabilities. Check for injection attacks, auth issues, RLS policy gaps, and sensitive data exposure. Report findings with severity levels." --output-format json > /tmp/review-security.json &

# Performance Review
claude -p "Performance review: Analyze $ARGUMENTS for performance issues. Check for N+1 queries, unnecessary re-renders, missing memoization, and large imports. Report findings with impact levels." --output-format json > /tmp/review-performance.json &

# Type Safety Review
claude -p "Type safety review: Analyze $ARGUMENTS for TypeScript issues. Check for any types, missing null checks, incorrect assertions. Report findings with suggested fixes." --output-format json > /tmp/review-types.json &

# Best Practices Review
claude -p "Best practices review: Analyze $ARGUMENTS for code quality. Check React patterns, error handling, accessibility, duplication. Report findings with recommendations." --output-format json > /tmp/review-quality.json &

wait
echo "All reviews complete. Check /tmp/review-*.json"
```

## Consolidate Results

After agents complete, summarize all findings:

```bash
claude "Consolidate the code review results from /tmp/review-*.json into a single prioritized action list"
```
