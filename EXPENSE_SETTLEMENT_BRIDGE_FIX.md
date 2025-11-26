# Expense-Settlement Bridge Fix

## Problem Identified

The Expense System and Settlement System were disconnected:
- Expenses were successfully added to the system
- P&L report could see the expenses
- But Settlement Creation screen showed "No deductible expenses found"
- This caused overpayment to drivers and company losses

## Root Cause

The `loadDriverExpenses()` function had overly restrictive filtering:
1. Required expenses to match either `driverId` OR `truckId` from driver's loads
2. If expense had `driverId` but no matching `truckId` in driver's loads, it was excluded
3. Floating expenses (no `loadId`) were not prominently displayed

## Solution Implemented

### 1. Fixed Expense Query (`main.js` lines 3048-3083)

**New Query Logic:**
```javascript
// PRIMARY CHECK: DriverID must match (this is the main link)
const isDriverMatch = String(e.driverId) === String(driverId);

// SECONDARY CHECK: If no driverId, check truckId (for backward compatibility)
const isTruckMatch = !e.driverId && e.truckId && truckIds.includes(e.truckId);

// Must match driver OR truck (but driver match is preferred)
if (!isDriverMatch && !isTruckMatch) {
    return false;
}
```

**Key Changes:**
- ✅ Prioritizes `driverId` match (most important)
- ✅ Falls back to `truckId` match only if `driverId` is missing
- ✅ Checks `paidBy === 'company'` (company paid, driver owes)
- ✅ Checks `expenseLedger.status === 'active'` and `remainingBalance > 0`
- ✅ Excludes expenses with `settlementId` (already settled)

### 2. Enhanced Floating Expenses Display

**Type A: Load-Linked Expenses**
- Expenses with `loadId` appear when that specific load is selected
- Grouped under load header with load number and route

**Type B: Floating Expenses (NEW)**
- Expenses without `loadId` (e.g., Monthly Insurance) appear immediately
- Displayed with prominent yellow header: "FLOATING EXPENSES"
- Grouped by category (fuel, insurance, maintenance, etc.)
- Always visible regardless of load selection

### 3. Expense Status Tracking

**When Settlement is Created:**
- Ledger system updates `expenseLedger.remainingBalance`
- If fully paid, `expenseLedger.status` changes to `'paid'`
- Expenses with `remainingBalance <= 0` are automatically excluded from future settlements

**Old System (Backward Compatibility):**
- Expenses without ledger are marked with `settlementId`
- Filter excludes expenses with `settlementId`

## Query Criteria Summary

Expenses are shown in settlement if ALL of these are true:

1. ✅ **Driver Match**: `e.driverId === driverId` (PRIMARY) OR `e.truckId` matches driver's trucks (SECONDARY)
2. ✅ **Payment Source**: `e.paidBy === 'company'` (company paid, driver owes)
3. ✅ **Status**: `expenseLedger.status === 'active'` (if ledger exists) OR no ledger (backward compatibility)
4. ✅ **Balance**: `expenseLedger.remainingBalance > 0` (if ledger exists) OR full amount (if no ledger)
5. ✅ **Not Settled**: `!e.settlementId` (not already included in a settlement)

## Testing Checklist

### Test Case 1: Driver-Specific Expense
1. Create expense with `driverId` set to Owner Operator
2. Set `paidBy = 'company'`
3. Go to Settlement Creation for that driver
4. ✅ Expense should appear in "FLOATING EXPENSES" section

### Test Case 2: Load-Linked Expense
1. Create expense with `driverId` and `loadId` set
2. Set `paidBy = 'company'`
3. Go to Settlement Creation for that driver
4. Select the linked load
5. ✅ Expense should appear under that load's section

### Test Case 3: Floating Expense (Monthly Insurance)
1. Create expense with `driverId` but NO `loadId`
2. Set `paidBy = 'company'`
3. Go to Settlement Creation for that driver
4. ✅ Expense should appear immediately in "FLOATING EXPENSES" section
5. ✅ Should appear regardless of which loads are selected

### Test Case 4: Expense After Settlement
1. Create settlement with expense included
2. Ledger updates: `remainingBalance = 0`, `status = 'paid'`
3. Go to Settlement Creation again
4. ✅ Expense should NOT appear (already paid)

## Debug Logging

Added comprehensive console logging:
```javascript
console.log(`[loadDriverExpenses] Driver: ${driverId}, Type: ${driver?.driverType}`);
console.log(`[loadDriverExpenses] Total expenses in system: ${DataManager.expenses.length}`);
console.log(`[loadDriverExpenses] Expenses for this driver:`, ...);
console.log(`[loadDriverExpenses] Found ${eligibleExpenses.length} eligible expenses`);
```

If no expenses appear, check browser console for:
- Total expenses in system
- Expenses matching driverId
- Filter breakdown

## Files Modified

- **`main.js`** (lines 3048-3280):
  - Fixed expense query to prioritize `driverId` match
  - Enhanced floating expenses display with prominent header
  - Added debug logging

## Next Steps

1. **Verify Expense Creation**: Ensure expenses are created with correct `driverId`
2. **Test Settlement Flow**: Create settlement and verify expenses are deducted
3. **Check Ledger Updates**: Verify `expenseLedger` is updated after settlement
4. **Monitor Console**: Check browser console for debug logs if expenses don't appear

## Important Notes

- **Expense Creation**: When creating expenses for Owner Operators, ensure `driverId` is set
- **Floating vs Linked**: Expenses without `loadId` are "floating" and appear in all settlements
- **Ledger System**: New expenses automatically get `expenseLedger` if `paidBy === 'company'` and driver is Owner Operator
- **Backward Compatibility**: Old expenses without ledger still work, but will be deducted in full

