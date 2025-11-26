#!/bin/bash
# Safe Git Workflow Script
# Usage: ./safe-commit.sh "Your commit message"

echo "🔍 Running pre-commit safety checks..."
echo ""

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "main" ]; then
    echo "⚠️  WARNING: You're committing directly to main!"
    echo "   Consider using a feature branch instead."
    read -p "   Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Commit cancelled. Create a feature branch:"
        echo "   git checkout -b feature/your-feature-name"
        exit 1
    fi
fi

# Show what files will be committed
echo "📝 Files to be committed:"
git diff --cached --name-only
echo ""

# Check for large deletions
DELETIONS=$(git diff --cached --numstat | awk '{sum+=$2} END {print sum}')
if [ -z "$DELETIONS" ]; then
    DELETIONS=0
fi

if [ "$DELETIONS" -gt 50 ]; then
    echo "⚠️  WARNING: You're deleting $DELETIONS lines of code!"
    echo ""
    echo "   Deleted functions:"
    git diff --cached | grep "^-.*function" | head -5
    echo ""
    read -p "   Are you sure? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Commit cancelled"
        exit 1
    fi
fi

# Check for deleted event listeners
DELETED_LISTENERS=$(git diff --cached | grep -c "^-.*addEventListener")
if [ "$DELETED_LISTENERS" -gt 0 ]; then
    echo "⚠️  WARNING: You're deleting $DELETED_LISTENERS event listener(s)!"
    git diff --cached | grep "^-.*addEventListener"
    echo ""
    read -p "   Is this intentional? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Commit cancelled"
        exit 1
    fi
fi

# Check for deleted DOMContentLoaded
if git diff --cached | grep -q "^-.*DOMContentLoaded"; then
    echo "🚨 CRITICAL: You're deleting DOMContentLoaded event listener!"
    echo "   This will break page initialization!"
    echo ""
    read -p "   Are you ABSOLUTELY SURE? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Commit cancelled"
        exit 1
    fi
fi

# Show the diff
echo ""
echo "📊 Changes summary:"
git diff --cached --stat
echo ""

# Ask for confirmation
read -p "👀 Review the diff? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git diff --cached | less
fi

# Final confirmation
echo ""
read -p "✅ Proceed with commit? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Commit cancelled"
    exit 1
fi

# Commit with provided message or prompt for one
if [ -z "$1" ]; then
    git commit
else
    git commit -m "$1"
fi

echo ""
echo "✅ Commit successful!"
echo ""
echo "📋 Testing checklist:"
echo "   [ ] Test the page in browser"
echo "   [ ] Check console for errors (F12)"
echo "   [ ] Test all buttons and features"
echo "   [ ] Verify nothing broke"
echo ""
echo "When ready to push:"
echo "   git push origin $CURRENT_BRANCH"
