# How to Test the Expense Ledger System

## Step 1: Verify Files Are Loaded

Open your browser console (F12) and run:

```javascript
// Check if ExpenseLedger is loaded
console.log('ExpenseLedger:', typeof ExpenseLedger);
console.log('DataManager:', typeof DataManager);

// Should output:
// ExpenseLedger: object
// DataManager: object
```

## Step 2: Create a Test Expense

1. Go to **Expenses** page
2. Click "Add Expense"
3. Fill in:
   - **Type**: Insurance
   - **Amount**: 1000
   - **Driver**: Select an Owner Operator
   - **Paid By**: Company
4. Save the expense

## Step 3: Check the Expense Has Ledger

In browser console:
```javascript
// Get the expense you just created
const expenses = DataManager.expenses;
const lastExpense = expenses[expenses.length - 1];
console.log('Expense Ledger:', lastExpense.expenseLedger);

// Should show:
// {
//   totalAmount: 1000,
//   amountPaid: 0,
//   remainingBalance: 1000,
//   status: 'active'
// }
```

## Step 4: Go to Settlements

1. Go to **Settlements** page
2. Click "Create Settlement"
3. Select the Owner Operator driver
4. Look at the expenses list - you should see:
   - The expense amount
   - "Balance: $1,000.00" below it

## Step 5: Test Deduction

1. Select a load that pays $600
2. Check the expense checkbox
3. Look at the "Total Deductions" - should show $600 (not $1,000)
4. Generate the settlement

## Step 6: Verify Ledger Updated

In browser console:
```javascript
// Get the expense again
const expense = DataManager.expenses.find(e => e.expenseLedger);
console.log('Updated Ledger:', expense.expenseLedger);

// Should show:
// {
//   totalAmount: 1000,
//   amountPaid: 600,
//   remainingBalance: 400,  // <-- Reduced!
//   status: 'active'
// }
```

## Step 7: Test Spillover

1. Create another settlement for the same driver
2. Select a load that pays $2,000
3. Check the same expense
4. Look at deductions - should only show $400 (the remaining balance)
5. Generate settlement

## Step 8: Verify Fully Paid

In browser console:
```javascript
const expense = DataManager.expenses.find(e => e.expenseLedger);
console.log('Final Ledger:', expense.expenseLedger);

// Should show:
// {
//   totalAmount: 1000,
//   amountPaid: 1000,
//   remainingBalance: 0,  // <-- Paid off!
//   status: 'paid'  // <-- Status changed!
// }
```

## Troubleshooting

### If ExpenseLedger is undefined:
- Check browser console for errors
- Make sure `expense-ledger-utils.js` is loaded before `main.js`
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### If expenses don't show balance:
- Check if expense has `expenseLedger` field
- Run migration: `await ExpenseLedger.migrateExpensesToLedger()`

### If deductions still use full amount:
- Check browser console for errors
- Verify `ExpenseLedger.calculateDeduction()` is being called
- Check that driver is Owner Operator type

