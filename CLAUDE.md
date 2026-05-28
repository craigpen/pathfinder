# Claude Code Guidelines for University Pathfinder

## Git Workflow (Safety First)

### Before Making Changes
- Always run `git status` to confirm working tree state
- Review `git log --oneline -5` to understand recent changes
- If making risky edits, create a feature branch first

### After Completing Work
- Show the diff before committing: `git diff [files]`
- Create a commit with a clear, descriptive message
- Never use `--force` or `--no-verify` without explicit user approval
- Confirm branch before pushing (never push to main without asking)

### Protecting Against Data Loss
- Always commit atomically: one logical change per commit
- Keep commits small enough to review and understand
- If uncertain about a file's state, read it first before editing
- When editing files previously modified in this session, check git status first
- Tag important milestones with `git tag` if needed for recovery

### Dangerous Operations (Ask Before Doing)
- Force push (`git push --force`)
- Hard reset (`git reset --hard`)
- Rebase on main
- Amending published commits
- Destructive file operations (`rm -rf`, etc.)

## Code Changes
- Default to small, focused edits over large refactors
- Prefer editing existing files to creating new ones
- No unnecessary comments—only when the "why" is non-obvious
- Don't add error handling for impossible scenarios

## Testing & Verification
- Open `index.html` directly in a browser to test changes
- Only commit after verifying changes work locally
- Use git diff to visually confirm changes match intent

## Project Workflow
- **Development**: Edit `index.html`, test locally in browser
- **Commit**: After testing passes, create a commit with a clear message
- **Deploy**: Push to GitHub (syncs to your github.io page)
- **Sharing**: Test on mobile device via github.io before finalizing

## Key Files
- `index.html` — Single-page app with embedded CSS/JS (1.3MB)
  - This is your main deliverable; treat edits carefully
  - Always test in browser before committing

---

**Last Updated:** 2026-05-28
