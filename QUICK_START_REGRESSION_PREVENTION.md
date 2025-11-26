# Quick Start: Preventing Regressions

## The Problem You Asked About

**"When I do some change, the system will lose some features"**

This is called a **regression** - when new changes accidentally break existing functionality.

## The Solution: 3 Simple Steps

### 1️⃣ Before You Commit - Use the Safe Commit Script

Instead of `git commit`, use:
```bash
./safe-commit.sh "Your commit message"
```

This script will:
- ✅ Warn you if deleting lots of code
- ✅ Alert you if deleting event listeners
- ✅ Show you what changed
- ✅ Ask for confirmation

### 2️⃣ Always Test Before Pushing

Open the page you changed in your browser and test:
- Does the page load?
- Do all buttons work?
- Are there errors in console (F12)?

Use `TESTING_CHECKLIST.md` for a complete list.

### 3️⃣ Use Feature Branches

Don't commit directly to `main`:
```bash
# Create a feature branch
git checkout -b feature/my-change

# Make your changes
# Test everything
# Commit

# Push to feature branch first
git push origin feature/my-change

# Test on Netlify preview
# Only merge to main when verified
```

## Files Created for You

1. **`PREVENTING_REGRESSIONS.md`** - Complete guide with best practices
2. **`TESTING_CHECKLIST.md`** - What to test before every deploy
3. **`safe-commit.sh`** - Automated safety checks before committing

## Quick Reference

### Safe Workflow
```bash
# 1. Create feature branch
git checkout -b feature/update-something

# 2. Make your changes
# ... edit files ...

# 3. Stage changes
git add settlements.html

# 4. Safe commit (with checks)
./safe-commit.sh "Update settlement PDF design"

# 5. Test in browser
# Open page, test all features

# 6. Push to feature branch
git push origin feature/update-something

# 7. Test on Netlify preview
# Visit: https://feature-update-something--your-site.netlify.app

# 8. Merge to main when verified
git checkout main
git merge feature/update-something
git push origin main
```

### Emergency: Undo a Bad Commit
```bash
# If you just committed but haven't pushed
git reset HEAD~1

# If you already pushed
git revert HEAD
git push origin main
```

## Remember

> **Test before you commit. Commit before you push. Push to a branch first.**

This simple workflow will prevent 99% of regressions!
