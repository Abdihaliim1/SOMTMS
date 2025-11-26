# Mock Data Population Instructions

## How to Populate Mock Data

This script will create all the mock data needed for testing the TMS system.

### Steps:

1. **Open the Dashboard** (`index.html`) in your browser

2. **Open Browser Console**
   - Press `F12` (or `Cmd+Option+I` on Mac)
   - Click on the "Console" tab

3. **Run the Script**
   - Type: `populateMockData()`
   - Press Enter

4. **Wait for Completion**
   - The script will create:
     - 4 Customers
     - 4 Trucks
     - 4 Drivers
     - 4 Loads (all delivered)
     - 14 Expenses
   - Progress will be shown in the console
   - Page will automatically refresh when complete

### Expected Results:

After running the script, you should see:

- **Dashboard**: 
  - Total Revenue: $10,784.00
  - Active Loads: 0 (all delivered)
  - Active Drivers: 4
  - Total Miles: 1,554

- **Reports - Profit Breakdown**:
  - Total Revenue: $10,784.00
  - Total Expenses: $4,955.00
  - Driver Pay: $9,941.00
  - Net Profit: -$4,112.00 (Loss)

### Data Created:

**Customers:**
1. Midwest Distribution LLC
2. Great Lakes Logistics Inc
3. Southern Transport Services
4. Northeast Freight Solutions

**Trucks:**
1. lii (Freightliner Cascadia) - Company Owned
2. OP (Peterbilt 579) - Owner Operator
3. T1 (Volvo VNL 760) - Company Owned
4. T2 (International LT) - Company Owned

**Drivers:**
1. Liban Ali - Owner (Driver) - 70%
2. Ahmed Hassan - Owner Operator - 88%
3. Marcus Johnson - Company Driver - 70%
4. Sarah Williams - Company Driver - 70%

**Loads:**
1. LD-1001 - Nashville to Columbus - $2,800
2. LD-1002 - Chicago to Detroit - $3,200
3. LD-1003 - Atlanta to Columbus - $3,500
4. LD-1004 - New York to Columbus - $4,100

**Expenses:**
- Fuel expenses for each load
- Insurance (monthly recurring)
- Maintenance
- Fixed expenses (rent, software)
- Tolls and lumper fees

### Notes:

- All data is saved to Firebase Firestore
- The script includes delays to ensure data is properly saved
- If you see errors, check the console for details
- You can run the script multiple times (it will create duplicates)

### To Remove Mock Data:

You can delete the data manually from:
- Firebase Console → Firestore Database
- Or create a cleanup script

