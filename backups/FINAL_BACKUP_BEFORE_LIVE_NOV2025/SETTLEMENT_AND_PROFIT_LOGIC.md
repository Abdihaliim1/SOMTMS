# Settlement and Profit Calculation Logic

## Overview

This document explains how the system calculates:
1. **Company Revenue** from loads
2. **Driver Settlements** (what drivers get paid)
3. **Truck Profitability** (company profit per truck)

---

## QUICK EXAMPLE: Company Driver with Fuel Expense

**Scenario:**
- Load Amount: $3,000
- Driver: Company Driver (70% pay)
- Fuel Expense: $400 (paid by company)

### Step 1: Company Revenue Calculation
```
Load Amount: $3,000
Driver Type: company
Company Revenue: $3,000 (100% - company driver gets full revenue)
```

### Step 2: Driver Settlement
```
Gross Pay: $3,000 × 70% = $2,100

Deductions:
  - Advances: $0
  - Lumper Fees: $0
  - Fuel Expense: $0 ❌ (NOT deducted - company pays)
  - Taxes: $2,100 × 16.15% = $339.15

Net Pay: $2,100 - $339.15 = $1,760.85
```

### Step 3: Truck Profitability
```
Revenue: $3,000 (full load amount)

Expenses:
  - Driver Pay: $2,100 (70% of load)
  - Fuel: $400 (company-paid expense)
  - Insurance: $500 (monthly allocation)
  - Maintenance: $0
  - Lease Payment: $0

Total Expenses: $3,000
Profit: $3,000 - $3,000 = $0 (break-even in this example)
```

**Key Point:** Fuel expense is:
- ✅ Counted in **company expenses** (truck profitability)
- ❌ **NOT deducted** from driver pay (company driver)
- ✅ Reduces company profit

---

## 1. COMPANY REVENUE CALCULATION

### Location: `main.js` - `Utils.calculateCompanyRevenueSync()`

**Key Logic:**
- **Company Driver or Owner (Driver)**: Company gets **100%** of the load amount
- **Owner Operator**: Company gets only the **commission** (typically 12-15%)

### Code:

```javascript
// File: main.js, Lines 145-174
calculateCompanyRevenueSync: (loadAmount, driver) => {
    if (!driver || !loadAmount) {
        return loadAmount || 0;
    }

    const grossAmount = parseFloat(loadAmount) || 0;
    const driverType = driver.driverType;

    // Company Driver or Owner (Driver): Count 100% of load as revenue
    if (driverType === 'company' || driverType === 'owner') {
        return grossAmount;  // ✅ Full amount = company revenue
    }

    // Owner Operator: Count only company's commission
    if (driverType === 'owner_operator') {
        // Calculate commission: 1 - driver percentage
        const driverPayPercentage = Utils.validatePayPercentage(driver.payPercentage, driverType);
        const companyCommission = 1 - driverPayPercentage;
        return grossAmount * companyCommission;  // ✅ Only commission = company revenue
    }

    return grossAmount;
}
```

### Example:

**Scenario 1: Company Driver**
- Load Amount: $3,000
- Driver Type: `company`
- **Company Revenue: $3,000** (100%)

**Scenario 2: Owner Operator**
- Load Amount: $3,000
- Driver Type: `owner_operator`
- Driver Pay Percentage: 88% (0.88)
- Company Commission: 12% (1 - 0.88 = 0.12)
- **Company Revenue: $360** (12% of $3,000)

### When It's Calculated:

**On Load Creation/Update** (`main.js` lines 805-839, 841-875):
```javascript
// When creating a load
if (!payload.companyRevenue && payload.rate?.total) {
    payload.grossLoadAmount = payload.rate.total;
    const driver = payload.driverId ? DataManager.drivers.find(d => d.id === payload.driverId) : null;
    payload.companyRevenue = Utils.calculateCompanyRevenueSync(payload.rate.total, driver);
}
```

**Stored Fields:**
- `grossLoadAmount`: Full load amount (e.g., $3,000)
- `companyRevenue`: Company's actual revenue (e.g., $3,000 for company driver, $360 for O/O)

---

## 2. DRIVER SETTLEMENT CALCULATION

### Location: `main.js` - `calculateSettlementTotal()` (Lines 2897-3069)

### Formula:

```
Gross Pay = Base Pay + Detention Pay
Net Pay = Gross Pay - Deductions

Deductions = Advances + Lumper Fees + Expenses (if O/O) + Taxes (if Company Driver)
```

### Step-by-Step Logic:

#### Step 1: Calculate Gross Pay

```javascript
// Lines 2902-2912
let basePay = 0;
let detentionTotal = 0;

checkboxes.forEach(cb => {
    basePay += parseFloat(cb.dataset.basePay || 0);
    detentionTotal += parseFloat(cb.dataset.detention || 0);
});

const grossPay = basePay + detentionTotal;
```

**Base Pay Calculation** (from `loadDriverUnpaidLoads()`, lines 2538-2570):
```javascript
// For percentage-based pay
const driverPayPercentage = Utils.validatePayPercentage(driver.payPercentage, driver.driverType);
payAmount = totalRate * driverPayPercentage;

// Example: $3,000 load × 70% = $2,100 base pay
```

#### Step 2: Calculate Deductions Based on Driver Type

**A. Company Drivers** (Lines 2933-2934):
```javascript
// For Company Drivers: No expense deductions (company pays everything)
// Only deductions: Advances, Lumper Fees, Taxes
```

**B. Owner Operators** (Lines 2935-3012):
```javascript
if (isOwnerOperator && deductionPrefs) {
    // Only deduct expenses if:
    // 1. Driver chose that deduction preference (e.g., fuel: true)
    // 2. Expense was paid by company (paidBy === 'company')
    
    if (deductionPrefs.fuel) {
        // Find fuel expenses where paidBy === 'company'
        fuelDeduction += expense.amount;
    }
    
    if (deductionPrefs.insurance) {
        // Insurance per load = Monthly insurance ÷ Number of loads
        insuranceDeduction = monthlyInsurance / loadsInPeriod;
    }
    
    // Similar logic for maintenance and other expenses
}
```

#### Step 3: Calculate Taxes

```javascript
// Lines 3014-3024
// Company Drivers and Owner (Driver): Full tax deductions
// Owner Operators: No tax deductions (they're independent contractors)

const taxes = {
    federal: (isCompanyDriver || isOwner) ? grossPay * 0.075 : 0,      // 7.5%
    state: (isCompanyDriver || isOwner) ? grossPay * 0.02 : 0,          // 2%
    socialSecurity: (isCompanyDriver || isOwner) ? grossPay * 0.062 : 0,  // 6.2%
    medicare: (isCompanyDriver || isOwner) ? grossPay * 0.0145 : 0       // 1.45%
};

const totalTaxes = Object.values(taxes).reduce((sum, tax) => sum + tax, 0);
```

#### Step 4: Calculate Net Pay

```javascript
// Lines 3026-3030
// Company Drivers: Advances + Lumper + Taxes (NO expenses)
// Owner Operators: Advances + Lumper + Expenses (NO taxes)

const totalDeductions = advancesTotal + lumperTotal + expensesTotal + totalTaxes;
const netPay = grossPay - totalDeductions;
```

### Example Calculations:

**Example 1: Company Driver**
```
Load: $3,000
Driver Pay Percentage: 70%
Gross Pay: $3,000 × 70% = $2,100

Deductions:
  - Advances: $200
  - Lumper Fees: $50
  - Expenses: $0 (company pays, not deducted)
  - Taxes: $2,100 × 16.15% = $339.15

Total Deductions: $589.15
Net Pay: $2,100 - $589.15 = $1,510.85
```

**Example 2: Owner Operator**
```
Load: $3,000
Driver Pay Percentage: 88%
Gross Pay: $3,000 × 88% = $2,640

Deductions:
  - Advances: $200
  - Lumper Fees: $0
  - Fuel (if chosen): $450 (paid by company)
  - Insurance (if chosen): $800/month ÷ 20 loads = $40
  - Taxes: $0 (O/O is independent contractor)

Total Deductions: $690
Net Pay: $2,640 - $690 = $1,950
```

---

## 3. TRUCK PROFITABILITY CALCULATION

### Location: `fleet.html` - `FleetManager.calculateTruckProfitability()` (Lines 828-957)

### Formula:

```
Revenue = Sum of all load amounts (100% of each load)
Expenses = Driver Pay + Fuel + Insurance + Maintenance + Lease/Loan Payment
Profit = Revenue - Expenses
Profit per Mile = Profit ÷ Total Miles
ROI = (Profit ÷ Purchase Price) × 100
```

### Step-by-Step Code:

#### Step 1: Calculate Revenue

```javascript
// Lines 863-866
// Calculate Revenue: Sum of full load amounts (100%)
const revenue = truckLoads.reduce((sum, load) => {
    return sum + (parseFloat(load.rate?.total) || 0);
}, 0);
```

**Important:** Revenue uses **full load amount**, not `companyRevenue` field. This is because truck profitability is calculated for **company-owned trucks only**, where the company gets 100% of the load.

#### Step 2: Calculate Driver Pay

```javascript
// Lines 876-894
truckLoads.forEach(load => {
    if (load.driverId) {
        const driver = DataManager.drivers.find(d => d.id === load.driverId);
        if (driver && (driver.driverType === 'company' || driver.driverType === 'owner')) {
            const loadAmount = parseFloat(load.rate?.total) || 0;
            
            if (driver.payment?.type === 'percentage') {
                const percentage = parseFloat(driver.payment.percentage || driver.payPercentage || 70);
                const driverPercent = percentage > 1 ? percentage / 100 : percentage;
                driverPay += loadAmount * driverPercent;
            } else if (driver.payment?.type === 'per_mile') {
                const miles = parseFloat(load.mileage?.total) || 0;
                const ratePerMile = parseFloat(driver.payment.perMileRate) || 0;
                driverPay += miles * ratePerMile;
            }
        }
    }
});
```

**Note:** Only counts driver pay for **company drivers** or **owner (driver)**. Owner operators are not included because they use their own trucks.

#### Step 3: Calculate Fuel Expenses

```javascript
// Lines 896-905
const truckFuelExpenses = DataManager.expenses.filter(exp => {
    if (String(exp.truckId) !== String(truck.id)) return false;
    if (exp.paidBy === 'owner_operator') return false; // Skip O/O-paid expenses
    const expType = (exp.type || '').toLowerCase();
    if (!expType.includes('fuel')) return false;
    const expDate = new Date(exp.date || exp.createdAt);
    return expDate >= startDate && expDate <= endDate;
});
fuelExpenses = truckFuelExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
```

**Key Filter:** Only includes expenses where `paidBy !== 'owner_operator'` (company-paid expenses only).

#### Step 4: Calculate Insurance Expenses

```javascript
// Lines 907-913
if (truck.insurancePaidBy === 'company' && truck.monthlyInsuranceCost) {
    // Calculate number of months in date range
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (endDate.getMonth() - startDate.getMonth()) + 1;
    insuranceExpenses = truck.monthlyInsuranceCost * monthsDiff;
}
```

**Logic:** Allocates monthly insurance cost based on number of months in the date range.

#### Step 5: Calculate Maintenance Expenses

```javascript
// Lines 915-924
const truckMaintenanceExpenses = DataManager.expenses.filter(exp => {
    if (String(exp.truckId) !== String(truck.id)) return false;
    if (exp.paidBy === 'owner_operator') return false; // Skip O/O-paid expenses
    const expType = (exp.type || '').toLowerCase();
    if (!expType.includes('maintenance') && !expType.includes('repair')) return false;
    const expDate = new Date(exp.date || exp.createdAt);
    return expDate >= startDate && expDate <= endDate;
});
maintenanceExpenses = truckMaintenanceExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
```

#### Step 6: Calculate Lease/Loan Payment

```javascript
// Lines 926-932
if ((truck.ownership === 'leased' || truck.ownership === 'financed') && truck.monthlyPayment) {
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (endDate.getMonth() - startDate.getMonth()) + 1;
    leasePayment = truck.monthlyPayment * monthsDiff;
}
```

#### Step 7: Calculate Total Expenses and Profit

```javascript
// Lines 934-937
expenses = driverPay + fuelExpenses + insuranceExpenses + maintenanceExpenses + leasePayment;
const profit = revenue - expenses;
```

### Example Calculation:

**Truck: T1 (Company Owned)**
**Date Range: November 1-30, 2024**

**Loads:**
- Load 1: $3,500 (Atlanta to Columbus)
- Load 2: $2,800 (Nashville to Columbus)
- **Total Revenue: $6,300**

**Expenses:**
- Driver Pay (70%): $3,500 × 70% + $2,800 × 70% = $2,450 + $1,960 = **$4,410**
- Fuel: $400 + $350 = **$750**
- Insurance (1 month): **$500**
- Maintenance: **$185**
- Lease Payment: $0 (owned truck)
- **Total Expenses: $5,845**

**Profit:**
- **Profit: $6,300 - $5,845 = $455**
- Total Miles: 435 + 302 = 737 miles
- **Profit per Mile: $455 ÷ 737 = $0.62/mile**

---

## 4. KEY DIFFERENCES: COMPANY DRIVER vs OWNER OPERATOR

### Company Driver Expenses:

**When creating expense** (`main.js` - `DataManager.addExpense()`, lines 1120-1200):
```javascript
// For company drivers, expenses are ALWAYS:
expenseData.paidBy = 'company';
expenseData.deductFromDriver = false;  // ✅ NEVER deducted from driver pay
```

**In Settlement:**
- ✅ Expenses are **NOT deducted** from driver pay
- ✅ Expenses are counted in **company P&L reports**
- ✅ Only deductions: Advances, Lumper Fees, Taxes

**In Truck Profitability:**
- ✅ All company-paid expenses are included
- ✅ Driver pay is calculated and deducted

### Owner Operator Expenses:

**When creating expense:**
```javascript
// For owner operators, depends on form input:
if (expenseData.deductFromSettlement === true) {
    expenseData.paidBy = 'company';
    expenseData.deductFromDriver = true;  // ✅ Will be deducted
} else {
    expenseData.paidBy = 'owner_operator';
    expenseData.deductFromDriver = false;  // ❌ Not deducted, not in company P&L
}
```

**In Settlement:**
- ✅ Only expenses where `paidBy === 'company'` are deducted
- ✅ Deduction only happens if driver chose that preference (e.g., `deductionPreferences.fuel === true`)
- ✅ No taxes deducted (O/O is independent contractor)

**In Truck Profitability:**
- ❌ Owner operator trucks are **skipped** (not company trucks)
- ❌ O/O-paid expenses are **excluded** from company P&L

---

## 5. SUMMARY FORMULAS

### Company Revenue per Load:
```
IF driverType === 'company' OR 'owner':
    companyRevenue = loadAmount (100%)

IF driverType === 'owner_operator':
    companyRevenue = loadAmount × (1 - driverPayPercentage)
    Example: $3,000 × (1 - 0.88) = $360
```

### Driver Settlement:
```
Gross Pay = (Load Amount × Driver Percentage) + Detention Pay

IF Company Driver:
    Net Pay = Gross Pay - Advances - Lumper - Taxes
    (NO expense deductions)

IF Owner Operator:
    Net Pay = Gross Pay - Advances - Lumper - Expenses (if chosen)
    (NO taxes)
```

### Truck Profitability:
```
Revenue = Σ(Load Amounts)  // Full 100% of each load

Expenses = 
    Driver Pay (company drivers only) +
    Fuel Expenses (company-paid only) +
    Insurance (monthly allocation) +
    Maintenance (company-paid only) +
    Lease/Loan Payment (if applicable)

Profit = Revenue - Expenses
Profit per Mile = Profit ÷ Total Miles
ROI = (Profit ÷ Purchase Price) × 100
```

---

## 6. IMPORTANT NOTES

1. **Company Revenue vs Gross Load Amount:**
   - `grossLoadAmount`: Full amount customer pays (e.g., $3,000)
   - `companyRevenue`: What company actually gets (e.g., $3,000 for company driver, $360 for O/O)
   - Reports use `companyRevenue` for total company revenue
   - Truck profitability uses `grossLoadAmount` (100%) because it's for company trucks only

2. **Expense Allocation:**
   - `paidBy`: 'company' or 'owner_operator'
   - `deductFromDriver`: true/false
   - Company driver expenses: Always `paidBy: 'company'`, `deductFromDriver: false`
   - Owner operator expenses: Depends on form selection

3. **Truck Profitability Scope:**
   - Only calculates for: `owned`, `leased`, or `financed` trucks
   - Skips: `owner_operator` trucks (not company assets)
   - Only includes company-paid expenses (`paidBy !== 'owner_operator'`)

4. **Driver Pay Calculation:**
   - Uses `driver.payPercentage` (stored as decimal 0-1, e.g., 0.70 for 70%)
   - Validated by `Utils.validatePayPercentage()` to ensure correct format
   - Falls back to defaults if missing (70% for company, 88% for O/O)

---

## 7. CODE REFERENCES

- **Company Revenue Calculation**: `main.js` lines 145-174
- **Load Creation (Revenue)**: `main.js` lines 805-839, 841-875
- **Settlement Calculation**: `main.js` lines 2897-3069
- **Driver Pay in Settlement**: `main.js` lines 2538-2570
- **Truck Profitability**: `fleet.html` lines 828-957
- **Expense Allocation**: `main.js` lines 1120-1200

