# 🚛 ATS FREIGHT LLC - Transportation Management System V2

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/yourusername/ats-freight-tms)
[![Status](https://img.shields.io/badge/status-Production%20Ready-green.svg)](https://github.com/yourusername/ats-freight-tms)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎉 **PRODUCTION READY - NOVEMBER 2025**

A comprehensive Transportation Management System (TMS) built for ATS FREIGHT LLC. This system handles all aspects of freight operations including load management, driver settlements, expense tracking, fleet management, and financial reporting.

---

## 🚀 **NEW IN VERSION 2.0**

### 💰 **Advanced Settlement Generation**
- ✅ **Auto-populate O/O expenses** - Automatically includes all company-paid expenses for Owner Operators
- ✅ **Smart expense categorization** - Fuel vs Other expenses auto-filled
- ✅ **Professional UI warnings** - Red banner shows company-paid expenses with totals
- ✅ **Real-time calculations** - Net pay updates instantly as expenses are included
- ✅ **Expense tracking** - Links expenses to settlements, prevents double-settlement

### 📊 **Accurate P&L Reporting**
- ✅ **No double-counting** - O/O expenses excluded from company expense totals
- ✅ **Real settlement data** - Uses actual net pay from settlements instead of estimates
- ✅ **Gross Method for O/O** - Shows full revenue + reimbursements for transparency
- ✅ **Interactive charts** - Professional Plotly.js visualizations
- ✅ **Export functionality** - PDF, CSV, print-ready reports

### 🚚 **Enhanced Driver Management**
- ✅ **One driver = One truck system** - Auto-fill truck based on driver assignment
- ✅ **Dynamic pay calculation** - No hardcoded percentages, uses actual driver records
- ✅ **Real-time updates** - Changes reflect immediately across entire system
- ✅ **Professional validation** - Comprehensive error checking and defaults

### 💸 **Professional Expense Management**
- ✅ **Smart allocation logic** - Automatic Company vs O/O expense handling
- ✅ **Expense ledger system** - Tracks remaining balances for Owner Operators
- ✅ **Status management** - Approved, pending, rejected workflow
- ✅ **Receipt handling** - File upload and preview capabilities

### 🏢 **Complete Fleet Management**
- ✅ **Ownership tracking** - Owned, leased, financed, owner-operator categories
- ✅ **Insurance automation** - Auto-creates monthly insurance expenses
- ✅ **Profitability analysis** - Revenue, expenses, ROI calculations per truck
- ✅ **Compliance tracking** - Insurance, registration, inspection date monitoring

---

## 🛡️ **ENTERPRISE FEATURES**

### 🔄 **Real-time Data Synchronization**
- Firebase Firestore for instant multi-user sync
- Offline persistence with IndexedDB
- Optimistic updates with automatic rollback on errors
- Connection monitoring and intelligent retry logic

### 🎯 **Financial Accuracy**
- Rule-based calculation system (no hardcoded values)
- Automatic recalculation when business rules change
- Version tracking for all financial calculations
- Comprehensive validation and error handling

### 🔒 **Data Stability & Security**
- Exponential backoff retry logic for failed operations
- Pre-save data validation to prevent corruption
- Conflict resolution using timestamp-based merging
- Comprehensive error logging and monitoring

---

## 📋 **SYSTEM CAPABILITIES**

### 👥 **Multi-Driver Type Support**
- **Company Drivers** - W2 employees, company pays all expenses
- **Owner Operators** - 1099 contractors, company deducts expenses from settlements
- **Owner as Driver** - Business owner driving company trucks

### 💰 **Accurate Financial Management**
- **Revenue Recognition** - Full amount for company drivers, commission-only for O/O
- **Expense Allocation** - Smart logic based on driver type and truck ownership
- **Settlement Generation** - Auto-includes all relevant expenses with professional UI
- **P&L Reporting** - Accurate profit calculations with no double-counting

### 🚛 **Complete Fleet Operations**
- **Truck Management** - Ownership types, insurance, maintenance tracking
- **Driver Assignment** - One driver per truck assignment system
- **Profitability Analysis** - Revenue, expenses, ROI calculations per asset
- **Compliance Tracking** - Insurance, registration, inspection date monitoring

---

## 🏗️ **TECHNICAL STACK**

### **Frontend**
- **HTML5** - Semantic markup with accessibility features
- **CSS3** - Modern styling with Tailwind CSS framework
- **JavaScript ES6+** - Modern JavaScript with async/await patterns
- **Responsive Design** - Mobile-first approach with professional UI/UX

### **Backend & Database**
- **Firebase Firestore** - NoSQL cloud database with real-time sync
- **Firebase Auth** - User authentication and authorization
- **IndexedDB** - Client-side storage for offline persistence
- **Cloud Functions** - Serverless backend processing (ready for deployment)

### **Libraries & Tools**
- **Plotly.js** - Interactive charts and data visualization
- **Font Awesome** - Professional icon library
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase SDK** - Real-time database and authentication

---

## 🚀 **QUICK START**

### **1. Clone Repository**
```bash
git clone https://github.com/yourusername/ats-freight-tms.git
cd ats-freight-tms
```

### **2. Firebase Setup**
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication
4. Copy your Firebase config to `main.js`

### **3. Deploy**
```bash
# Option 1: Static hosting (Netlify, Vercel, etc.)
# Upload entire folder to your hosting provider

# Option 2: Firebase Hosting
firebase init hosting
firebase deploy
```

### **4. First Time Setup**
1. Open the application in your browser
2. **IMPORTANT**: Run data cleanup to remove test data
   - Click "Clean All Data" button on dashboard
   - OR open browser console and run: `cleanupMockData()`
3. Add your real drivers, trucks, and customers
4. Start managing your freight operations!

---

## 📖 **DOCUMENTATION**

### **Core Modules**
- [`main.js`](main.js) - Core data management and Firebase integration
- [`data-stability.js`](data-stability.js) - Offline persistence and retry logic
- [`expense-ledger-utils.js`](expense-ledger-utils.js) - O/O expense tracking system
- [`populate-mock-data.js`](populate-mock-data.js) - Test data generation (for development)

### **Pages**
- [`index.html`](index.html) - Dashboard with KPIs and quick actions
- [`loads.html`](loads.html) - Load management and tracking
- [`drivers.html`](drivers.html) - Driver profiles and assignments
- [`settlements.html`](settlements.html) - Driver settlement generation
- [`expenses.html`](expenses.html) - Expense tracking and approval
- [`fleet.html`](fleet.html) - Truck management and profitability
- [`reports.html`](reports.html) - P&L and business analytics
- [`customers.html`](customers.html) - Customer management and invoicing

### **Utilities**
- [`cleanup-mock-data.js`](cleanup-mock-data.js) - Remove all test data
- [`final-test.js`](final-test.js) - System verification script
- [`cleanup.html`](cleanup.html) - User-friendly data cleanup interface

---

## 🔧 **CONFIGURATION**

### **Business Rules** (Configurable in Settings)
```javascript
const businessRules = {
    driverPayRules: {
        companyDriver: { percentage: 0.70 },    // 70% of load revenue
        ownerOperator: { percentage: 0.88 }     // 88% of load revenue
    },
    revenueRules: {
        commissionRate: 0.12                    // 12% commission from O/O loads
    },
    expenseRules: {
        autoDeductFromOO: true,                 // Auto-deduct company-paid O/O expenses
        createInsuranceExpenses: true           // Auto-create monthly insurance expenses
    }
};
```

### **Firebase Security Rules**
```javascript
// Firestore Security Rules (deploy to Firebase)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🧪 **TESTING**

### **Test Data Management**
```javascript
// Populate test data for development
populateMockData()

// Clean all test data before production
cleanupMockData()

// Verify system functionality
runFinalTest()
```

### **System Verification**
The system includes comprehensive testing utilities:
- Mock data population for development and testing
- Automated cleanup for production deployment
- System verification to ensure all features work correctly
- Real-time calculation validation

---

## 📊 **BUSINESS LOGIC**

### **Settlement Calculation**
```javascript
// Owner Operator Settlement Example
const grossPay = loadRevenue * driverPayPercentage;  // e.g., $3000 * 0.88 = $2640
const expenses = getCompanyPaidExpenses(driverId);   // Auto-populated: $500 fuel + $200 insurance
const netPay = Math.max(0, grossPay - expenses);    // $2640 - $700 = $1940
```

### **P&L Calculation**
```javascript
// Company Revenue (excludes O/O expenses to prevent double-counting)
const companyRevenue = companyDriverLoads.total + ownerOperatorLoads.commission;
const companyExpenses = expenses.filter(e => !isOwnerOperatorExpense(e));
const netProfit = companyRevenue - companyExpenses - actualDriverPay;
```

---

## 🔒 **SECURITY & COMPLIANCE**

### **Data Protection**
- Firebase security rules for authenticated access only
- Client-side data validation before database writes
- Automatic data backup and versioning
- Audit trail for all financial transactions

### **Business Compliance**
- Accurate 1099 contractor expense tracking
- Proper revenue recognition for tax reporting
- Detailed financial reporting for accounting
- Professional invoicing and settlement documentation

---

## 🚀 **DEPLOYMENT OPTIONS**

### **Option 1: Netlify (Recommended)**
1. Connect GitHub repository to Netlify
2. Set build command: (none - static site)
3. Set publish directory: `/`
4. Deploy automatically on git push

### **Option 2: Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### **Option 3: Traditional Web Hosting**
- Upload all files to web server
- Ensure HTTPS is enabled
- Configure Firebase for your domain

---

## 📞 **SUPPORT**

### **Documentation**
- [`PRODUCTION_READY.md`](PRODUCTION_READY.md) - Complete feature documentation
- [`CLEANUP_INSTRUCTIONS.md`](CLEANUP_INSTRUCTIONS.md) - Data cleanup guide
- [`DELETE_ALL_TEST_DATA.md`](DELETE_ALL_TEST_DATA.md) - Test data removal

### **System Status**
- **Version**: 2.0.0
- **Status**: Production Ready
- **Last Updated**: November 2025
- **Stability**: Enterprise Grade

---

## 📄 **LICENSE**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 **ACKNOWLEDGMENTS**

- Built with modern web technologies for maximum compatibility
- Designed for real-world freight operations
- Tested with comprehensive business scenarios
- Ready for immediate production deployment

---

**🚛 ATS FREIGHT LLC Transportation Management System V2 - Production Ready! 🚀**

*Professional freight management made simple.*