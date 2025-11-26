# Fix: Negative Driver Pay in P&L Report

## Problem
When you added $10,000 in expenses for testing, the P&L showed **Driver Pay: -$608.00** (negative), which is incorrect.

## Root Cause
When deductions exceed gross pay in a settlement, `netPay` becomes negative:
- Gross Pay: $500
- Deductions: $1,108
- Net Pay: $500 - $1,108 = **-$608** ❌

The P&L then sums these negative values, making total driver pay negative.

## Fix Applied

### 1. Settlement Creation (`settlements.html` line 1141)
**Before:**
```javascript
const netPay = grossPay - totalDeductions; // Could be negative
```

**After:**
```javascript
// FIX: Cap netPay at $0 minimum - driver cannot owe negative amount
const netPay = Math.max(0, grossPay - totalDeductions);
const driverDebt = Math.max(0, totalDeductions - grossPay); // Track excess deductions as debt
```

### 2. P&L Report (`reports.html` line 749)
**Before:**
```javascript
const netPay = parseFloat(settlement.netPay || 0); // Could be negative
```

**After:**
```javascript
// FIX: Ensure netPay is never negative (cap at 0)
const netPay = Math.max(0, parseFloat(settlement.netPay || 0));
```

### 3. Settlement Update (`settlements.html` line 2422)
**Before:**
```javascript
settlement.netPay = settlement.grossPay - (parseFloat(settlement.totalDeductions) || 0);
```

**After:**
```javascript
// FIX: Cap netPay at $0 minimum
settlement.netPay = Math.max(0, settlement.grossPay - (parseFloat(settlement.totalDeductions) || 0));
settlement.driverDebt = Math.max(0, (parseFloat(settlement.totalDeductions) || 0) - settlement.grossPay);
```

## What This Means

### Before Fix:
- If deductions > gross pay: Net Pay = negative amount
- P&L Driver Pay = sum of all netPay (could be negative)
- Net Profit = Revenue - Expenses - (negative driver pay) = **inflated profit** ❌

### After Fix:
- If deductions > gross pay: Net Pay = $0.00, Driver Debt = excess amount
- P&L Driver Pay = sum of all netPay (always ≥ $0)
- Net Profit = Revenue - Expenses - Driver Pay = **accurate profit** ✅

## Example Scenario

**Settlement with $10,000 expenses:**
- Gross Pay: $2,000
- Deductions: $10,000
- **Before:** Net Pay = -$8,000 ❌
- **After:** Net Pay = $0, Driver Debt = $8,000 ✅

**P&L Impact:**
- **Before:** Driver Pay = -$8,000 (increases profit incorrectly)
- **After:** Driver Pay = $0 (accurate, debt tracked separately)

## Next Steps

1. **Hard refresh your browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Delete the existing settlement** that has negative netPay
3. **Create a new settlement** - it will now cap netPay at $0
4. **Check P&L report** - Driver Pay should now be ≥ $0

## Future Enhancement

The `driverDebt` field is now tracked but not displayed in reports. You can add a "Driver Debt" section to the P&L to show outstanding balances separately from driver pay.

