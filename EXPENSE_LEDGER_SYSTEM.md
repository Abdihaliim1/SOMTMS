# Expense Ledger System - Running Balance Logic

## Overview
This document describes the new ledger-based expense deduction system for Owner Operators. The system tracks outstanding balances and prevents duplicate deductions across multiple settlements.

## Problem Solved
**Before:** Expenses were deducted from every settlement, treating one-time costs (like Monthly Insurance) as recurring per-load fees.

**After:** Expenses are tracked with a running balance. Once the balance reaches $0, no further deductions occur.

## How It Works

### 1. Expense Ledger Structure
When an expense is created for an Owner Operator (paid by company), a ledger is automatically initialized:

```javascript
expenseLedger: {
    totalAmount: 1000,        // Original expense amount
    amountPaid: 0,           // Total paid so far
    remainingBalance: 1000,  // Outstanding balance
    status: 'active',        // 'active', 'paid', 'cancelled'
    createdAt: '2025-01-15T...',
    lastUpdated: '2025-01-15T...'
}
```

### 2. Settlement Calculation Algorithm

**Step A:** Calculate Gross Driver Pay for selected loads
```
Gross Pay = Σ(Load Amount × Driver Percentage) + Detention Pay
```

**Step B:** Get all active expenses with outstanding balance
```javascript
const activeExpenses = ExpenseLedger.getActiveExpenses(driverId);
// Returns expenses where:
// - driverId matches
// - paidBy === 'company'
// - expenseLedger.status === 'active'
// - expenseLedger.remainingBalance > 0
```

**Step C:** Calculate Deduction Amount
```javascript
const result = ExpenseLedger.calculateDeduction(driverId, grossPay, selectedLoadIds);
// Returns:
// - deductionAmount: Total to deduct (up to grossPay)
// - remainingPay: What driver gets after deductions
// - updatedExpenses: Array of ledger updates to apply
// - breakdown: { fuel, insurance, maintenance, other }
```

**Step D:** Update Ledgers After Settlement
```javascript
await ExpenseLedger.updateLedgers(result.updatedExpenses);
// Updates each expense's ledger with new balance
```

### 3. Spillover Logic Example

**Scenario:** Driver owes $1,000 for Insurance

**Load 1 (Pays $600):**
- System sees $1,000 debt
- Takes all $600
- Driver gets $0
- Debt reduces to $400
- Ledger: `{ amountPaid: 600, remainingBalance: 400 }`

**Load 2 (Pays $2,000):**
- System sees remaining $400 debt
- Takes $400
- Driver gets $1,600
- Debt becomes $0
- Ledger: `{ amountPaid: 1000, remainingBalance: 0, status: 'paid' }`

**Load 3 (Pays $2,000):**
- System sees $0 debt
- Takes Nothing
- Driver gets $2,000
- No ledger update needed

## Implementation Details

### Files Modified

1. **`expense-ledger-utils.js`** (NEW)
   - `getActiveExpenses()` - Get expenses with outstanding balance
   - `calculateDeduction()` - Calculate deduction based on balance
   - `updateLedgers()` - Update expense ledgers after settlement
   - `migrateExpensesToLedger()` - Initialize ledgers for existing expenses

2. **`main.js`**
   - `addExpense()` - Initialize ledger for new Owner Operator expenses
   - `calculateSettlementTotal()` - Use ledger system for deductions
   - `loadDriverExpenses()` - Display remaining balance in UI

3. **`settlements.html`**
   - Settlement generation - Update ledgers after settlement created
   - Added `expense-ledger-utils.js` script

### Key Functions

#### `ExpenseLedger.calculateDeduction(driverId, grossPay, selectedLoadIds)`
Calculates how much to deduct based on outstanding balances.

**Logic:**
1. Get all active expenses for driver
2. Sort by date (oldest first)
3. For each expense:
   - Calculate deduction = min(remainingBalance, remainingPay)
   - Update ledger tracking
   - Reduce remainingPay
4. Return total deduction and updates

#### `ExpenseLedger.updateLedgers(updatedExpenses)`
Updates expense ledgers in Firebase after settlement.

**Updates:**
- `amountPaid` += deduction
- `remainingBalance` -= deduction
- `status` = 'paid' if balance reaches 0
- `lastUpdated` = current timestamp

## Migration

### For Existing Expenses
Run this in the browser console to initialize ledgers for existing expenses:

```javascript
await ExpenseLedger.migrateExpensesToLedger();
```

This will:
- Find all Owner Operator expenses (paid by company)
- Initialize ledgers if missing
- Set `remainingBalance = totalAmount` (full balance outstanding)

## UI Changes

### Expense Display
Expenses now show:
- **Remaining Balance** (if ledger exists)
- **Original Amount** (if partially paid)

Example:
```
$400.00
Original: $1,000.00
```

### Settlement Calculation
- Uses ledger balance instead of raw expense amount
- Automatically stops deducting when balance reaches $0
- Shows breakdown by category (fuel, insurance, maintenance, other)

## Testing

### Test Scenario 1: Full Payment
1. Create expense: $1,000 Insurance
2. Create settlement: Load pays $1,500
3. **Expected:** $1,000 deducted, $500 to driver, expense marked as 'paid'

### Test Scenario 2: Partial Payment (Spillover)
1. Create expense: $1,000 Insurance
2. Create settlement 1: Load pays $600
3. **Expected:** $600 deducted, $0 to driver, balance = $400
4. Create settlement 2: Load pays $2,000
5. **Expected:** $400 deducted, $1,600 to driver, expense marked as 'paid'

### Test Scenario 3: Multiple Expenses
1. Create expenses: $500 Fuel, $300 Maintenance
2. Create settlement: Load pays $600
3. **Expected:** $500 + $300 = $800 total, but only $600 deducted (partial)
4. **Expected:** Fuel fully paid, Maintenance partially paid ($100 remaining)

## Benefits

1. **No Duplicate Deductions** - Each expense is only deducted until paid off
2. **Accurate Tracking** - Always know outstanding balance
3. **Automatic Management** - System handles spillover automatically
4. **Transparent** - UI shows remaining balance clearly
5. **Backward Compatible** - Falls back to old system if ledger not available

## Notes

- Only applies to Owner Operator expenses where `paidBy === 'company'`
- Company driver expenses are not affected (no deductions)
- Ledgers are automatically initialized for new expenses
- Existing expenses can be migrated using `migrateExpensesToLedger()`

