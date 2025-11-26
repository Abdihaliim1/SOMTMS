# P&L Revenue and Driver Pay Fix

## The Problem

The P&L report was showing incorrect calculations:

### Problem 1: Revenue was Inflated
- **Wrong:** Counting full O/O load revenue ($16,600)
- **Correct:** Should only count commission (12% = $1,992)

### Problem 2: O/O Pay was Being Subtracted
- **Wrong:** Subtracting O/O pay ($14,608) as company expense
- **Correct:** O/O pay is NOT company expense - it's their money passing through

---

## The Fix

### Fix 1: Revenue Calculation (`reports.html` lines 682-710)

**Before:**
```javascript
// Always use full line haul (gross) for ALL loads
if (driver.driverType === 'owner_operator') {
    ownerOperatorRevenue += revenue; // Full $16,600 ❌
}
```

**After:**
```javascript
// Use calculateCompanyRevenueSync to get correct revenue
// For O/O: Returns commission (12% of gross)
// For Company/Owner: Returns full gross amount
const companyRevenue = Utils.calculateCompanyRevenueSync(grossAmount, driver);

if (driver.driverType === 'owner_operator') {
    ownerOperatorRevenue += companyRevenue; // Only $1,992 (12%) ✅
}
```

**Result:**
- Company Driver Loads: $14,700 (full revenue)
- O/O Commission: $1,992 (12% of $16,600)
- **Total Revenue: $16,692** ✅

---

### Fix 2: Driver Pay Calculation - Exclude O/O (`reports.html` lines 737-774)

**Before:**
```javascript
settlements.forEach(settlement => {
    // ...
    if (driver.driverType === 'owner_operator') {
        ownerOperatorPay += netPay; // ❌ Including O/O pay
    }
});
```

**After:**
```javascript
settlements.forEach(settlement => {
    // ...
    // FIX: Skip Owner Operator settlements - their pay is NOT company expense
    if (driver.driverType === 'owner_operator') {
        console.log(`[Reports] Excluding O/O settlement - O/O pay is not company expense`);
        return; // Skip O/O settlements ✅
    }
    
    // Only count company drivers and owner (as driver)
    if (driver.driverType === 'owner') {
        ownerAsDriverPay += netPay;
    } else {
        companyDriverPay += netPay;
    }
});
```

**Result:**
- Company Drivers: $4,165
- Owner (as Driver): $980
- O/O Pay: $0 (excluded)
- **Total Driver Pay: $5,145** ✅

---

### Fix 3: Fallback Calculation (No Settlements) (`reports.html` lines 850-857)

**Before:**
```javascript
if (driver.driverType === 'owner_operator') {
    ownerOperatorPay += finalPay; // ❌ Including O/O pay
}
```

**After:**
```javascript
// FIX: Exclude O/O pay - it's their money, not company expense
if (driver.driverType === 'owner_operator') {
    // Skip O/O - their pay is not company expense
    console.log(`[Reports] Excluding O/O load - O/O pay is not company expense`);
} else if (driver.driverType === 'owner') {
    ownerAsDriverPay += finalPay;
} else {
    companyDriverPay += finalPay;
}
```

---

### Fix 4: Total Driver Pay (`reports.html` line 865)

**Before:**
```javascript
const totalDriverPay = companyDriverPay + ownerOperatorPay + ownerAsDriverPay;
```

**After:**
```javascript
// FIX: O/O pay is excluded - it's their money, not company expense
const totalDriverPay = companyDriverPay + ownerAsDriverPay; // O/O pay excluded
```

---

## Correct Net Profit Calculation

**Formula:**
```
Net Profit = Revenue - Expenses - Driver Pay
```

**With Fixed Numbers:**
```
Net Profit = $16,692 - $4,574 - $5,145
Net Profit = $6,973 ✅
```

---

## Summary of Changes

| Line Item | Before (Wrong) | After (Correct) |
|-----------|----------------|-----------------|
| **Revenue** | $31,300 (full O/O loads) | $16,692 (O/O commission only) |
| **Expenses** | $4,574 | $4,574 (same) |
| **Driver Pay** | $19,753 (includes O/O) | $5,145 (O/O excluded) |
| **Net Profit** | $6,973 | **$6,973** ✅ |

---

## Expected Display

The P&L report will now show:
- **Revenue Breakdown:**
  - Company Driver Loads: $14,700
  - Owner Operator Loads: $1,992 (commission only)
  - **Total: $16,692**

- **Driver Pay Breakdown:**
  - Company Drivers: $4,165
  - Owner Operators: $0.00 (excluded - not company expense)
  - Owner (as Driver): $980
  - **Total: $5,145**

- **Net Profit: $6,973** ✅

---

## Testing

1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Open P&L report
3. Verify:
   - Revenue shows O/O commission (12%) not full load amount
   - Driver Pay shows $0.00 for Owner Operators
   - Net Profit calculation is correct
4. Check browser console for logs:
   - `[Reports] Excluding O/O settlement - O/O pay is not company expense`
   - `[Reports] Excluding O/O load - O/O pay is not company expense`

