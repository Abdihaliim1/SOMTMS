# Testing Checklist - Test Before Every Deploy

## Quick Test (5 minutes)
Run this before EVERY commit:

- [ ] Page loads without errors
- [ ] Check browser console (F12) - no red errors
- [ ] Main feature works (add/edit/delete)
- [ ] Review git diff for unexpected changes

## Full System Test (15 minutes)
Run this before deploying to production:

### 1. Dashboard (index.html)
- [ ] Page loads
- [ ] All statistics display correctly
- [ ] Charts render
- [ ] Navigation links work

### 2. Loads (loads.html)
- [ ] Page loads
- [ ] Add new load works
- [ ] Edit existing load works
- [ ] Delete load works
- [ ] Load table displays correctly
- [ ] Filters work
- [ ] Search works
- [ ] Export to CSV works

### 3. Drivers (drivers.html)
- [ ] Page loads
- [ ] Add new driver works
- [ ] Edit existing driver works
- [ ] Delete driver works
- [ ] Truck assignment works
- [ ] Driver table displays correctly
- [ ] Filters work

### 4. Fleet (fleet.html)
- [ ] Page loads
- [ ] Add new truck works
- [ ] Edit existing truck works
- [ ] Delete truck works
- [ ] Truck table displays correctly
- [ ] Ownership types work correctly

### 5. Expenses (expenses.html)
- [ ] Page loads
- [ ] Add new expense works
- [ ] Edit existing expense works
- [ ] Delete expense works
- [ ] Approval workflow works
- [ ] Expense allocation works (Company vs O/O)
- [ ] Filters work

### 6. Settlements (settlements.html)
- [ ] Page loads without errors
- [ ] Generate settlement button works
- [ ] Driver selection loads their loads
- [ ] Select all checkbox works
- [ ] Period selection works
- [ ] Generate settlement creates successfully
- [ ] Settlement table displays
- [ ] Delete settlement works
- [ ] Refresh button works
- [ ] Charts display (Trends & Status)
- [ ] PDF generation works
- [ ] Filters work

### 7. Customers (customers.html)
- [ ] Page loads
- [ ] Add new customer works
- [ ] Edit existing customer works
- [ ] Delete customer works
- [ ] Customer table displays correctly

### 8. Reports (reports.html)
- [ ] Page loads
- [ ] P&L report generates
- [ ] Charts display correctly
- [ ] Date filters work
- [ ] Export functions work

### 9. Accounts Receivable (accounts-receivable.html)
- [ ] Page loads
- [ ] Invoice table displays
- [ ] Aging report works
- [ ] Payment recording works
- [ ] Filters work

### 10. Dispatch Board (dispatch.html)
- [ ] Page loads
- [ ] Load cards display
- [ ] Drag and drop works
- [ ] Status updates work
- [ ] Filters work

## Browser Console Check
For EVERY page tested:

1. Open DevTools (F12)
2. Go to Console tab
3. Refresh page
4. Look for:
   - ❌ Red errors (MUST FIX)
   - ⚠️ Yellow warnings (review)
   - ✅ Green success messages (good)

## Git Diff Review
Before committing:

```bash
# Review all changes
git diff

# Check for large deletions
git diff --stat

# Look for deleted functions
git diff | grep "^-.*function"

# Look for deleted event listeners
git diff | grep "^-.*addEventListener"
```

## Common Issues to Check

- [ ] No JavaScript errors in console
- [ ] All buttons have onclick handlers
- [ ] All forms have submit handlers
- [ ] All modals open and close
- [ ] All data loads from Firebase
- [ ] All CRUD operations work (Create, Read, Update, Delete)
- [ ] All calculations are correct
- [ ] All charts/graphs display
- [ ] All filters function properly
- [ ] All exports work

## Critical Functions (Never Delete These!)

### Global (main.js)
- `DataManager.init()`
- `Auth.init()`
- `Utils.*` functions

### Per Page
- `DOMContentLoaded` event listener
- `render*Table()` functions
- `delete*()` functions
- `refresh*()` functions
- Form submit handlers
- Modal open/close functions

## After Testing

- [ ] All tests passed
- [ ] No console errors
- [ ] Git diff reviewed
- [ ] Commit message is clear
- [ ] Ready to push

---

**Pro Tip**: Copy this checklist into your commit message template to remind yourself to test!
