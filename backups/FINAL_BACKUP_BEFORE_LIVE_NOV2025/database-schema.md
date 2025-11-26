# TMS Database Schema Design

## Database Architecture
- **Primary Database**: Firebase Firestore (NoSQL)
- **Document Structure**: Collections and subcollections for scalability
- **Data Security**: Firebase Security Rules for role-based access
- **Backup Strategy**: Automated daily backups with 30-day retention

## Core Collections

### 1. Users Collection
```javascript
{
  userId: "auth_uid",
  email: "user@company.com",
  role: "admin|dispatcher|driver",
  firstName: "John",
  lastName: "Doe",
  phone: "(614) 555-0123",
  companyId: "ats_freight_llc",
  isActive: true,
  createdAt: timestamp,
  lastLogin: timestamp,
  permissions: {
    canViewLoads: true,
    canEditLoads: true,
    canViewDrivers: true,
    canEditDrivers: false,
    canViewReports: true,
    canExportData: false
  }
}
```

### 2. Companies Collection
```javascript
{
  companyId: "ats_freight_llc",
  name: "ATS FREIGHT LLC",
  address: {
    street: "3191 MORSE RD STE 15",
    city: "COLUMBUS",
    state: "OH",
    zip: "43231"
  },
  phone: "(614) 254-0380",
  email: "dispatch@atsfreight.com",
  website: "www.atsfreight.com",
  logoUrl: "https://storage.url/company-logo.png",
  settings: {
    mileageApi: "google_maps",
    ocrService: "google_vision",
    timezone: "America/New_York",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    mileageUnit: "miles",
    weightUnit: "lbs"
  },
  billing: {
    plan: "premium",
    billingCycle: "monthly",
    nextBillingDate: timestamp,
    isActive: true
  }
}
```

### 3. Loads Collection
```javascript
{
  loadId: "unique_load_id",
  loadNumber: "ATS-2025-001",
  companyId: "ats_freight_llc",
  status: "available|dispatched|in_transit|delivered|cancelled",
  customerId: "customer_doc_id",
  driverId: "driver_doc_id",
  truckId: "truck_doc_id",
  
  // Route Information
  pickup: {
    address: "123 Main St",
    city: "Columbus",
    state: "OH",
    zip: "43215",
    coordinates: { lat: 39.9612, lng: -82.9988 },
    scheduledDate: timestamp,
    actualDate: timestamp,
    contact: {
      name: "John Smith",
      phone: "(614) 555-0123",
      email: "john@shipper.com"
    },
    notes: "Loading dock #3, arrive 30 minutes early"
  },
  
  delivery: {
    address: "456 Oak Ave",
    city: "Chicago",
    state: "IL",
    zip: "60601",
    coordinates: { lat: 41.8781, lng: -87.6298 },
    scheduledDate: timestamp,
    actualDate: timestamp,
    contact: {
      name: "Jane Doe",
      phone: "(312) 555-0456",
      email: "jane@receiver.com"
    },
    notes: "Call 30 minutes before arrival"
  },
  
  // Financial Information
  rate: {
    total: 2500.00,
    currency: "USD",
    ratePerMile: 2.50,
    totalMiles: 1000,
    advance: 500.00,
    detentionPay: 50.00,
    lumperFees: 75.00
  },
  
  // Revenue Calculation (based on driver type)
  grossLoadAmount: 2500.00, // Total amount load pays (same as rate.total)
  companyRevenue: 2500.00,  // Company's actual revenue from this load
  // Calculation logic:
  // - Company Driver: companyRevenue = grossLoadAmount (100%)
  // - Owner Operator: companyRevenue = grossLoadAmount × (1 - driver_percentage)
  //   Example: Load $3000, O/O gets 88% → companyRevenue = $3000 × 0.12 = $360
  // - Owner (Driver): companyRevenue = grossLoadAmount (100%)
  
  // Calculated fields
  mileage: {
    total: 1000,
    practical: 980,
    shortest: 950,
    stateBreakdown: {
      "OH": 150,
      "IN": 200,
      "IL": 650
    }
  },
  
  // Documents
  documents: [
    {
      type: "rate_confirmation",
      url: "https://storage.url/rate-conf.pdf",
      uploadedAt: timestamp,
      extractedData: {
        loadNumber: "RC-2025-001",
        shipper: "ABC Corp",
        rate: 2500.00
      }
    },
    {
      type: "bol",
      url: "https://storage.url/bol.pdf",
      uploadedAt: timestamp
    }
  ],
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp,
  dispatchedAt: timestamp,
  pickedUpAt: timestamp,
  deliveredAt: timestamp,
  invoicedAt: timestamp,
  paidAt: timestamp
}
```

### 4. Drivers Collection
```javascript
{
  driverId: "unique_driver_id",
  companyId: "ats_freight_llc",
  userId: "auth_uid", // Link to users collection
  driverNumber: "DRV-001",
  
  // Personal Information
  personalInfo: {
    firstName: "Mike",
    lastName: "Johnson",
    dateOfBirth: "1985-03-15",
    ssn: "***-**-6789",
    phone: "(614) 555-9876",
    email: "mike@email.com",
    address: {
      street: "789 Pine St",
      city: "Columbus",
      state: "OH",
      zip: "43215"
    },
    emergencyContact: {
      name: "Sarah Johnson",
      relationship: "Spouse",
      phone: "(614) 555-9877"
    }
  },
  
  // License Information
  license: {
    number: "DL123456789",
    state: "OH",
    expirationDate: "2027-03-15",
    class: "CDL-A",
    endorsements: ["H", "T"],
    restrictions: ["L"]
  },
  
  // Driver Type
  driverType: "company|owner_operator|owner",
  // company: Company Driver - 65-70% or per-mile, all expenses paid by company, no deductions
  // owner_operator: Owner Operator - 85-90%, expenses may be deducted from settlement
  // owner: Owner (Driver) - Same as company driver, gets business profit separately
  
  // Payment Configuration
  payment: {
    type: "per_mile|percentage|flat_rate",
    perMileRate: 0.65,
    percentageRate: 75,
    flatRate: 500,
    fuelSurcharge: true,
    detentionPay: 25.00,
    layoverPay: 100.00
  },
  
  // Pay Percentage (stored separately for easier access)
  payPercentage: 70, // Percentage value (e.g., 70 for 70%)
  
  // Deduction Preferences (Owner Operators only)
  deductionPreferences: {
    fuel: true,        // Deduct fuel expenses from settlement
    insurance: false,  // Deduct insurance expenses from settlement
    maintenance: true, // Deduct maintenance expenses from settlement
    other: false       // Deduct other expenses from settlement
  },
  // If preference is false, expense is paid outside the system
  // If preference is true, expense is tracked and deducted from settlement
  
  // Employment Status
  employment: {
    status: "active|inactive|terminated",
    hireDate: "2023-01-15",
    terminationDate: null,
    payFrequency: "weekly|bi-weekly",
    w4Exemptions: 2,
    directDeposit: {
      bankName: "Chase Bank",
      accountNumber: "****5678",
      routingNumber: "044000037"
    }
  },
  
  // Documents
  documents: [
    {
      type: "license",
      url: "https://storage.url/cdl.pdf",
      expirationDate: "2027-03-15"
    },
    {
      type: "medical_certificate",
      url: "https://storage.url/medical.pdf",
      expirationDate: "2025-03-15"
    }
  ],
  
  // Compliance & Expiration Tracking
  medicalExpirationDate: timestamp, // Required - Medical card expiration for FMCSA compliance
  
  // Performance Tracking
  performance: {
    totalMiles: 125000,
    totalLoads: 450,
    onTimeDelivery: 0.94,
    safetyScore: 98.5,
    fuelEfficiency: 7.2
  },
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 5. Trucks Collection
```javascript
{
  truckId: "unique_truck_id",
  companyId: "ats_freight_llc",
  truckNumber: "TRK-001",
  
  // Vehicle Details
  vehicle: {
    make: "Freightliner",
    model: "Cascadia",
    year: 2023,
    vin: "1FUJGLDR53LX08199",
    licensePlate: "ABC1234",
    state: "OH",
    color: "White",
    engine: "Detroit DD15",
    transmission: "Automated",
    fuelType: "diesel"
  },
  
  // Specifications
  specifications: {
    grossVehicleWeight: 80000,
    emptyWeight: 35000,
    payloadCapacity: 45000,
    fuelCapacity: 300,
    sleeperSize: "72 inch",
    axleConfiguration: "6x4"
  },
  
  // Status
  status: {
    currentStatus: "available|in_use|maintenance|out_of_service",
    currentDriverId: "driver_doc_id",
    currentLocation: {
      city: "Columbus",
      state: "OH",
      coordinates: { lat: 39.9612, lng: -82.9988 }
    },
    odometer: 125000,
    engineHours: 8500
  },
  
  // Maintenance
  maintenance: {
    lastInspectionDate: timestamp,
    nextInspectionDate: timestamp,
    lastOilChange: {
      date: timestamp,
      mileage: 120000,
      nextDue: 130000
    },
    maintenanceSchedule: [
      {
        type: "oil_change",
        intervalMiles: 25000,
        lastPerformed: timestamp,
        nextDue: timestamp
      }
    ]
  },
  
  // Compliance & Expiration Tracking
  registrationExpiry: timestamp, // Vehicle registration expiration date
  inspectionDueDate: timestamp, // Annual inspection due date
  cabCardRenewalDate: timestamp, // IRP (International Registration Plan) cab card renewal date
  
  // Insurance Configuration
  insurancePaidBy: "company|owner_operator",
  // company: Company pays monthly insurance, record as recurring expense
  // owner_operator: O/O provides proof, track expiration only
  
  // Company Insurance (if insurancePaidBy === "company")
  monthlyInsuranceCost: 500.00, // Monthly insurance premium
  
  // Owner Operator Insurance (if insurancePaidBy === "owner_operator")
  insuranceExpirationDate: timestamp, // O/O insurance certificate expiration
  insuranceCertificateUrl: "https://storage.url/insurance-cert.pdf", // Uploaded certificate
  
  // Legacy Insurance Object (for backward compatibility)
  insurance: {
    provider: "Progressive Commercial",
    policyNumber: "POL123456789",
    expirationDate: timestamp,
    coverage: {
      liability: 1000000,
      cargo: 100000,
      physicalDamage: true
    }
  },
  
  // Ownership Type
  ownership: "owned|leased|financed|owner_operator",
  // owned: Company owned (fully paid) - no monthly payment, full depreciation, included in profit calculations
  // leased: Company leased - monthly lease payment, return at end or buy out, included in profit calculations
  // financed: Financed (loan) - monthly loan payment (part expense, part principal), company owns eventually, included in profit calculations
  // owner_operator: O/O truck - O/O owns/leases, linked to O/O driver, excluded from company profit calculations
  
  // Financial
  financial: {
    purchaseDate: timestamp,
    purchasePrice: 150000,
    monthlyPayment: 2500,
    leaseOrOwn: "own", // Legacy field, use ownership instead
    depreciation: 0.15
  },
  
  // Direct Financial Fields (for profit calculations)
  monthlyPayment: 2500.00, // Monthly lease/loan payment (for leased/financed trucks only)
  purchasePrice: 150000.00, // Purchase price (for owned/financed trucks, for ROI calculation)
  leaseEndDate: timestamp, // Lease end date (for leased trucks only)
  payoffAmount: 50000.00, // Remaining loan payoff amount (for financed trucks only)
  
  // Owner Operator Link
  ownerOperatorDriverId: "driver_doc_id", // Link to O/O driver (for owner_operator trucks only)
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 6. Customers Collection
```javascript
{
  customerId: "unique_customer_id",
  companyId: "ats_freight_llc",
  customerNumber: "CUST-001",
  
  // Company Information
  company: {
    name: "ABC Manufacturing Corp",
    legalName: "ABC Manufacturing Corporation",
    ein: "12-3456789",
    industry: "Manufacturing",
    website: "www.abcmfg.com",
    phone: "(614) 555-1234",
    fax: "(614) 555-1235",
    email: "shipping@abcmfg.com"
  },
  
  // Addresses
  addresses: [
    {
      type: "billing",
      street: "123 Industrial Blvd",
      city: "Columbus",
      state: "OH",
      zip: "43215",
      isPrimary: true
    },
    {
      type: "shipping",
      street: "456 Warehouse Dr",
      city: "Columbus",
      state: "OH",
      zip: "43216"
    }
  ],
  
  // Contacts
  contacts: [
    {
      name: "Bob Smith",
      title: "Shipping Manager",
      phone: "(614) 555-1234",
      email: "bob@abcmfg.com",
      isPrimary: true
    }
  ],
  
  // Financial Terms
  financial: {
    creditLimit: 50000,
    paymentTerms: "Net 30",
    preferredPaymentMethod: "ACH|Check|Wire",
    billingFrequency: "weekly|monthly",
    discountRate: 0.02,
    discountDays: 10
  },
  
  // Performance
  performance: {
    totalRevenue: 125000,
    totalLoads: 45,
    averageRate: 2778,
    onTimePayment: 0.95,
    lastLoadDate: timestamp
  },
  
  // Notes
  notes: "Preferred customer, excellent payment history",
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 7. Expenses Collection
```javascript
{
  expenseId: "unique_expense_id",
  companyId: "ats_freight_llc",
  
  // Basic Information
  type: "fuel|maintenance|insurance|toll|lumper|permit|lodging|other",
  category: "fuel|maintenance|insurance|toll|lumper|permit|lodging|other", // Same as type - used for grouping expenses by category
  subcategory: "fuel_diesel|oil_change|tire_replacement",
  
  // Transaction Details
  amount: 450.00,
  currency: "USD",
  date: timestamp,
  paymentMethod: "company_card|cash|check",
  
  // Associated Entities
  driverId: "driver_doc_id",
  truckId: "truck_doc_id", // Required for truck-specific expenses (fuel, maintenance, insurance)
  loadId: "load_doc_id", // Optional - Manual link to specific load (no automatic date matching)
  // Note: Expenses are grouped by category (type), not by load
  // Per-truck expenses use truckId, not loadId
  vendor: {
    name: "Pilot Flying J",
    address: "123 Truck Stop Rd, Columbus, OH",
    phone: "(614) 555-FUEL"
  },
  
  // Payment Tracking (for Owner Operators)
  paidBy: "company|owner_operator|tracked_only",
  // company: Paid by company - track as expense AND deduct from O/O settlement
  // owner_operator: Paid by O/O outside system - DON'T track in company P&L
  // tracked_only: For records only, doesn't affect P&L or settlement
  // Default: "company" (for Company Drivers, always company)
  
  // Receipt/Documentation
  receipt: {
    url: "https://storage.url/receipt.pdf",
    ocrData: {
      extractedText: "PILOT FUEL 150 GAL $3.00/GAL",
      confidence: 0.95,
      extractedFields: {
        totalAmount: 450.00,
        gallons: 150,
        pricePerGallon: 3.00,
        fuelType: "diesel"
      }
    }
  },
  
  // Tax Information
  tax: {
    isDeductible: true,
    category: "business_expense",
    state: "OH",
    taxAmount: 27.00
  },
  
  // Approval Workflow
  approval: {
    status: "pending|approved|rejected",
    approvedBy: "user_doc_id",
    approvedAt: timestamp,
    notes: "Approved - fuel expense for load ATS-2025-001"
  },
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 8. Settlements Collection
```javascript
{
  settlementId: "unique_settlement_id",
  companyId: "ats_freight_llc",
  driverId: "driver_doc_id",
  
  // Settlement Period
  period: {
    startDate: timestamp,
    endDate: timestamp,
    weekNumber: 42,
    year: 2025
  },
  
  // Earnings Breakdown
  earnings: {
    totalMiles: 2500,
    loadedMiles: 2000,
    emptyMiles: 500,
    basePay: 1625.00,
    fuelSurcharge: 125.00,
    detentionPay: 75.00,
    layoverPay: 0.00,
    bonus: 100.00,
    grossPay: 1925.00
  },
  
  // Deductions
  deductions: {
    fuelAdvance: 800.00,
    cashAdvance: 200.00,
    insurance: 45.00,
    taxes: {
      federal: 144.38,
      state: 38.25,
      socialSecurity: 119.35,
      medicare: 27.91
    },
    otherDeductions: [
      {
        description: "Uniform Deduction",
        amount: 25.00
      }
    ],
    totalDeductions: 1359.89
  },
  
  // Net Pay
  netPay: 565.11,
  
  // Associated Loads
  loads: [
    {
      loadId: "load_doc_id",
      loadNumber: "ATS-2025-001",
      miles: 1000,
      rate: 650.00,
      fuelSurcharge: 50.00
    }
  ],
  
  // Payment Status
  payment: {
    status: "pending|paid|processed",
    method: "direct_deposit|check",
    paidAt: timestamp,
    checkNumber: "123456",
    bankReference: "ACH789012"
  },
  
  // Documents
  documents: [
    {
      type: "settlement_report",
      url: "https://storage.url/settlement.pdf",
      generatedAt: timestamp
    }
  ],
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 9. IFTAReports Collection
```javascript
{
  reportId: "unique_report_id",
  companyId: "ats_freight_llc",
  
  // Reporting Period
  quarter: "Q1|Q2|Q3|Q4",
  year: 2025,
  startDate: timestamp,
  endDate: timestamp,
  
  // Mileage Summary
  mileage: {
    totalMiles: 125000,
    stateBreakdown: {
      "OH": { miles: 25000, percentage: 20.0 },
      "IN": { miles: 18750, percentage: 15.0 },
      "IL": { miles: 31250, percentage: 25.0 },
      "KY": { miles: 12500, percentage: 10.0 },
      "TN": { miles: 12500, percentage: 10.0 },
      "Other": { miles: 25000, percentage: 20.0 }
    }
  },
  
  // Fuel Purchases
  fuelPurchases: {
    totalGallons: 18500,
    totalCost: 55500.00,
    stateBreakdown: {
      "OH": { gallons: 3700, cost: 11100.00 },
      "IN": { gallons: 2775, cost: 8325.00 },
      "IL": { gallons: 4625, cost: 13875.00 }
    }
  },
  
  // Tax Calculations
  taxCalculations: {
    ohio: {
      miles: 25000,
      gallons: 3700,
      mpg: 6.76,
      taxRate: 0.47,
      taxDue: 11750.00
    },
    indiana: {
      miles: 18750,
      gallons: 2775,
      mpg: 6.76,
      taxRate: 0.51,
      taxDue: 9562.50
    }
  },
  
  // Summary
  summary: {
    totalTaxDue: 45250.00,
    totalTaxPaid: 42000.00,
    netTaxDue: 3250.00,
    refundDue: 0.00
  },
  
  // Status and Filing
  status: "draft|filed|approved",
  filedDate: timestamp,
  filedBy: "user_doc_id",
  
  // Documents
  documents: [
    {
      type: "ifta_report",
      url: "https://storage.url/ifta-q1-2025.pdf",
      generatedAt: timestamp
    },
    {
      type: "supporting_docs",
      url: "https://storage.url/ifta-supporting.zip",
      generatedAt: timestamp
    }
  ],
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Security Rules
```javascript
// Firebase Security Rules for role-based access
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own company data
    match /{collection}/{document} {
      allow read, write: if request.auth != null 
        && request.auth.token.companyId == resource.data.companyId;
    }
    
    // Drivers can only view their own settlements
    match /settlements/{settlement} {
      allow read: if request.auth != null 
        && request.auth.uid == resource.data.driverId
        && request.auth.token.role == 'driver';
      allow write: if request.auth != null 
        && request.auth.token.role in ['admin', 'dispatcher'];
    }
    
    // Admin-only access for certain collections
    match /companies/{company} {
      allow read, write: if request.auth != null 
        && request.auth.token.role == 'admin'
        && request.auth.token.companyId == company;
    }
  }
}
```

## Indexes
- `loads: [companyId, status, createdAt]`
- `loads: [companyId, driverId, status]`
- `drivers: [companyId, employment.status]`
- `expenses: [companyId, type, date]`
- `settlements: [companyId, driverId, period.startDate]`
- `ifta_reports: [companyId, year, quarter]`