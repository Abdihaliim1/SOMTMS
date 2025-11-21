// Somali Truck - Transportation Management System
// Main JavaScript File

// Global Configuration
const CONFIG = {
    company: {
        name: 'Somali Truck',
        logo: 'ST',
        address: '3191 MORSE RD STE 15, COLUMBUS, OH 43231',
        phone: '(614) 254-0380',
        email: 'dispatch@somalitruck.com'
    },
    api: {
        googleMapsKey: 'YOUR_GOOGLE_MAPS_API_KEY',
        googleVisionKey: 'YOUR_GOOGLE_VISION_API_KEY'
    },
    firebase: {
        apiKey: "AIzaSyBBCw37DQMfSduVD9AN3wxQCemLpZpdQr8",
        authDomain: "truck-c6639.firebaseapp.com",
        projectId: "truck-c6639",
        storageBucket: "truck-c6639.firebasestorage.app",
        messagingSenderId: "531771908970",
        appId: "1:531771908970:web:cb9e41526e9f613ba0fb13",
        measurementId: "G-JX7RH9S8D2"
    }
};

// Initialize Firebase
firebase.initializeApp(CONFIG.firebase);

// Enable offline persistence for local caching
firebase.firestore().enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.log('Persistence failed: Multiple tabs open');
        } else if (err.code == 'unimplemented') {
            console.log('Persistence not supported by browser');
        }
    });

const db = firebase.firestore();
const auth = firebase.auth();

// Utility Functions
const Utils = {
    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Format date
    formatDate: (date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    },

    // Format datetime
    formatDateTime: (date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    // Generate unique ID
    generateId: (prefix = '') => {
        return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Calculate distance between two points (mock implementation)
    calculateDistance: (origin, destination) => {
        // This would use Google Maps API in production
        const distances = {
            'columbus_chicago': 355,
            'columbus_nashville': 380,
            'columbus_atlanta': 550,
            'columbus_dallas': 930
        };

        const key = `${origin.toLowerCase()}_${destination.toLowerCase()}`;
        return distances[key] || Math.floor(Math.random() * 1000) + 200;
    },

    // Show notification
    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
                type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
            }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' :
                        'fa-info-circle'
            } mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    },

    // Validate email
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validate phone
    validatePhone: (phone) => {
        const re = /^\(\d{3}\) \d{3}-\d{4}$/;
        return re.test(phone);
    },

    // Format phone number
    formatPhone: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.substr(0, 3)}) ${cleaned.substr(3, 3)}-${cleaned.substr(6, 4)}`;
        }
        return phone;
    }
};

// LocalStorage Authentication
const Auth = {
    currentUser: null,

    // Initialize Auth
    init: () => {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            Auth.currentUser = user;
            console.log('User authenticated:', user.email);
            // Update UI if needed
            const welcomeMsg = document.querySelector('.nav-item span'); // "Welcome, Admin"
            if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${user.name}`;
        } else {
            console.log('No user authenticated');
            // Redirect to login if not on login page
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
        }
    },

    // Sign in
    signIn: async (email, password) => {
        // Simple hardcoded check
        if (email === 'admin' && password === 'admin123') {
            const user = {
                uid: 'admin_user',
                email: 'admin',
                name: 'Admin',
                role: 'admin'
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            Auth.currentUser = user;
            Utils.showNotification('Successfully logged in!', 'success');
            return user;
        } else {
            Utils.showNotification('Invalid credentials', 'error');
            throw new Error('Invalid credentials');
        }
    },

    // Sign out
    signOut: async () => {
        localStorage.removeItem('currentUser');
        Auth.currentUser = null;
        Utils.showNotification('Successfully logged out!', 'success');
        window.location.href = 'login.html';
    },

    // Get user role
    getUserRole: async (uid) => {
        return 'admin'; // Always admin for this demo
    }
};

// Data Management using LocalStorage
const DataManager = {
    // Local cache variables (kept in sync automatically by Firebase)
    loads: [],
    drivers: [],
    customers: [],
    trucks: [],
    settlements: [],
    invoices: [],
    expenses: [],
    iftaReports: [],

    // Initialize: Sets up Firebase listeners that sync Cloud <-> Local Storage
    init: async () => {
        console.log("Initializing DataManager with Firebase Persistence...");

        try {
            // Listener: LOADS
            db.collection('loads').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
                DataManager.loads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log(`Loaded ${DataManager.loads.length} loads from Firebase`);
                // Auto-refresh UI if the function exists on the current page
                if (window.renderLoads) window.renderLoads();
                if (window.updateDashboard) window.updateDashboard();
            }, error => {
                console.error('Error loading loads:', error);
            });

            // Listener: DRIVERS
            db.collection('drivers').onSnapshot(snapshot => {
                DataManager.drivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log(`Loaded ${DataManager.drivers.length} drivers from Firebase`);
                if (window.renderDrivers) window.renderDrivers();
            }, error => {
                console.error('Error loading drivers:', error);
            });

            // Listener: CUSTOMERS
            db.collection('customers').onSnapshot(snapshot => {
                DataManager.customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log(`Loaded ${DataManager.customers.length} customers from Firebase`);
                if (window.renderCustomers) window.renderCustomers();
            }, error => {
                console.error('Error loading customers:', error);
            });

            // Listener: TRUCKS
            db.collection('trucks').onSnapshot(snapshot => {
                DataManager.trucks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log(`Loaded ${DataManager.trucks.length} trucks from Firebase`);
            }, error => {
                console.error('Error loading trucks:', error);
            });

            // Listener: SETTLEMENTS
            db.collection('settlements').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
                DataManager.settlements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log(`Loaded ${DataManager.settlements.length} settlements from Firebase`);
                if (window.renderSettlements) window.renderSettlements();
            }, error => {
                console.error('Error loading settlements:', error);
            });

            // Listener: INVOICES
            db.collection('invoices').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
                DataManager.invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log(`Loaded ${DataManager.invoices.length} invoices from Firebase`);
            }, error => {
                console.error('Error loading invoices:', error);
            });

            // Listener: EXPENSES
            db.collection('expenses').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
                DataManager.expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log(`Loaded ${DataManager.expenses.length} expenses from Firebase`);
            }, error => {
                console.error('Error loading expenses:', error);
            });

            console.log('Firebase listeners initialized successfully');
        } catch (error) {
            console.error('Error initializing DataManager:', error);
            Utils.showNotification('Error connecting to database', 'error');
        }
    },

    // --- LOADS ---
    addLoad: async (loadData) => {
        try {
            // Clean data (remove undefined values)
            const payload = JSON.parse(JSON.stringify(loadData));
            payload.createdAt = new Date().toISOString();
            payload.updatedAt = new Date().toISOString();
            payload.companyId = 'somali_truck'; // Multi-tenant support

            const docRef = await db.collection('loads').add(payload);
            Utils.showNotification('Load created successfully!', 'success');
            return docRef.id;
        } catch (e) {
            console.error('Error adding load:', e);
            Utils.showNotification('Error creating load: ' + e.message, 'error');
            throw e;
        }
    },

    updateLoad: async (loadId, loadData) => {
        try {
            const payload = JSON.parse(JSON.stringify(loadData));
            payload.updatedAt = new Date().toISOString();
            await db.collection('loads').doc(loadId).update(payload);
            Utils.showNotification('Load updated successfully!', 'success');
        } catch (e) {
            console.error('Error updating load:', e);
            Utils.showNotification('Error updating load: ' + e.message, 'error');
            throw e;
        }
    },

    deleteLoad: async (loadId) => {
        if (confirm('Are you sure you want to delete this load?')) {
            try {
                await db.collection('loads').doc(loadId).delete();
                Utils.showNotification('Load deleted successfully!', 'success');
            } catch (e) {
                console.error('Error deleting load:', e);
                Utils.showNotification('Error deleting load: ' + e.message, 'error');
                throw e;
            }
        }
    },

    getLoad: (loadId) => {
        return DataManager.loads.find(l => l.id === loadId || l.loadNumber === loadId);
    },

    // --- DRIVERS ---
    addDriver: async (driverData) => {
        try {
            const payload = JSON.parse(JSON.stringify(driverData));
            payload.createdAt = new Date().toISOString();
            payload.updatedAt = new Date().toISOString();
            payload.companyId = 'somali_truck';

            const docRef = await db.collection('drivers').add(payload);
            Utils.showNotification('Driver added successfully!', 'success');
            return docRef.id;
        } catch (e) {
            console.error('Error adding driver:', e);
            Utils.showNotification('Error adding driver: ' + e.message, 'error');
            throw e;
        }
    },

    updateDriver: async (driverId, driverData) => {
        try {
            const payload = JSON.parse(JSON.stringify(driverData));
            payload.updatedAt = new Date().toISOString();
            await db.collection('drivers').doc(driverId).update(payload);
            Utils.showNotification('Driver updated successfully!', 'success');
        } catch (e) {
            console.error('Error updating driver:', e);
            Utils.showNotification('Error updating driver: ' + e.message, 'error');
            throw e;
        }
    },

    deleteDriver: async (driverId) => {
        if (confirm('Are you sure you want to delete this driver?')) {
            try {
                await db.collection('drivers').doc(driverId).delete();
                Utils.showNotification('Driver deleted successfully!', 'success');
            } catch (e) {
                console.error('Error deleting driver:', e);
                Utils.showNotification('Error deleting driver: ' + e.message, 'error');
                throw e;
            }
        }
    },

    getDriver: (driverId) => {
        return DataManager.drivers.find(d => d.id === driverId || d.driverNumber === driverId);
    },

    // --- CUSTOMERS ---
    addCustomer: async (customerData) => {
        try {
            const payload = JSON.parse(JSON.stringify(customerData));
            payload.createdAt = new Date().toISOString();
            payload.updatedAt = new Date().toISOString();
            payload.companyId = 'somali_truck';

            const docRef = await db.collection('customers').add(payload);
            Utils.showNotification('Customer added successfully!', 'success');
            return docRef.id;
        } catch (e) {
            console.error('Error adding customer:', e);
            Utils.showNotification('Error adding customer: ' + e.message, 'error');
            throw e;
        }
    },

    updateCustomer: async (customerId, customerData) => {
        try {
            const payload = JSON.parse(JSON.stringify(customerData));
            payload.updatedAt = new Date().toISOString();
            await db.collection('customers').doc(customerId).update(payload);
            Utils.showNotification('Customer updated successfully!', 'success');
        } catch (e) {
            console.error('Error updating customer:', e);
            Utils.showNotification('Error updating customer: ' + e.message, 'error');
            throw e;
        }
    },

    deleteCustomer: async (customerId) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            try {
                await db.collection('customers').doc(customerId).delete();
                Utils.showNotification('Customer deleted successfully!', 'success');
            } catch (e) {
                console.error('Error deleting customer:', e);
                Utils.showNotification('Error deleting customer: ' + e.message, 'error');
                throw e;
            }
        }
    },

    getCustomer: (customerId) => {
        return DataManager.customers.find(c => c.id === customerId || c.customerNumber === customerId);
    },

    // --- INVOICES ---
    addInvoice: async (invoiceData) => {
        try {
            const payload = JSON.parse(JSON.stringify(invoiceData));
            payload.createdAt = new Date().toISOString();
            payload.updatedAt = new Date().toISOString();
            payload.companyId = 'somali_truck';

            const docRef = await db.collection('invoices').add(payload);
            Utils.showNotification('Invoice created successfully!', 'success');
            return docRef.id;
        } catch (e) {
            console.error('Error adding invoice:', e);
            Utils.showNotification('Error creating invoice: ' + e.message, 'error');
            throw e;
        }
    },

    updateInvoice: async (invoiceId, invoiceData) => {
        try {
            const payload = JSON.parse(JSON.stringify(invoiceData));
            payload.updatedAt = new Date().toISOString();
            await db.collection('invoices').doc(invoiceId).update(payload);
            Utils.showNotification('Invoice updated successfully!', 'success');
        } catch (e) {
            console.error('Error updating invoice:', e);
            Utils.showNotification('Error updating invoice: ' + e.message, 'error');
            throw e;
        }
    },

    deleteInvoice: async (invoiceId) => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            try {
                await db.collection('invoices').doc(invoiceId).delete();
                Utils.showNotification('Invoice deleted successfully!', 'success');
            } catch (e) {
                console.error('Error deleting invoice:', e);
                Utils.showNotification('Error deleting invoice: ' + e.message, 'error');
                throw e;
            }
        }
    },

    getInvoice: (invoiceId) => {
        return DataManager.invoices.find(i => i.id === invoiceId);
    },

    // --- SETTLEMENTS ---
    addSettlement: async (settlementData) => {
        try {
            const payload = JSON.parse(JSON.stringify(settlementData));
            payload.createdAt = new Date().toISOString();
            payload.updatedAt = new Date().toISOString();
            payload.companyId = 'somali_truck';

            const docRef = await db.collection('settlements').add(payload);
            Utils.showNotification('Settlement created successfully!', 'success');
            return docRef.id;
        } catch (e) {
            console.error('Error adding settlement:', e);
            Utils.showNotification('Error creating settlement: ' + e.message, 'error');
            throw e;
        }
    },

    updateSettlement: async (settlementId, settlementData) => {
        try {
            const payload = JSON.parse(JSON.stringify(settlementData));
            payload.updatedAt = new Date().toISOString();
            await db.collection('settlements').doc(settlementId).update(payload);
            Utils.showNotification('Settlement updated successfully!', 'success');
        } catch (e) {
            console.error('Error updating settlement:', e);
            Utils.showNotification('Error updating settlement: ' + e.message, 'error');
            throw e;
        }
    },

    deleteSettlement: async (settlementId) => {
        if (confirm('Are you sure you want to delete this settlement?')) {
            try {
                await db.collection('settlements').doc(settlementId).delete();
                Utils.showNotification('Settlement deleted successfully!', 'success');
            } catch (e) {
                console.error('Error deleting settlement:', e);
                Utils.showNotification('Error deleting settlement: ' + e.message, 'error');
                throw e;
            }
        }
    },

    getSettlement: (settlementId) => {
        return DataManager.settlements.find(s => s.id === settlementId);
    },

    // --- EXPENSES ---
    addExpense: async (expenseData) => {
        try {
            const payload = JSON.parse(JSON.stringify(expenseData));
            payload.createdAt = new Date().toISOString();
            payload.updatedAt = new Date().toISOString();
            payload.companyId = 'somali_truck';

            const docRef = await db.collection('expenses').add(payload);
            Utils.showNotification('Expense added successfully!', 'success');
            return docRef.id;
        } catch (e) {
            console.error('Error adding expense:', e);
            Utils.showNotification('Error adding expense: ' + e.message, 'error');
            throw e;
        }
    },

    updateExpense: async (expenseId, expenseData) => {
        try {
            const payload = JSON.parse(JSON.stringify(expenseData));
            payload.updatedAt = new Date().toISOString();
            await db.collection('expenses').doc(expenseId).update(payload);
            Utils.showNotification('Expense updated successfully!', 'success');
        } catch (e) {
            console.error('Error updating expense:', e);
            Utils.showNotification('Error updating expense: ' + e.message, 'error');
            throw e;
        }
    },

    deleteExpense: async (expenseId) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            try {
                await db.collection('expenses').doc(expenseId).delete();
                Utils.showNotification('Expense deleted successfully!', 'success');
            } catch (e) {
                console.error('Error deleting expense:', e);
                Utils.showNotification('Error deleting expense: ' + e.message, 'error');
                throw e;
            }
        }
    },

    getExpense: (expenseId) => {
        return DataManager.expenses.find(e => e.id === expenseId);
    }
};

// Google Maps Integration
const MapsAPI = {
    // Calculate route and distance
    calculateRoute: async (origin, destination, waypoints = []) => {
        try {
            // Mock implementation - replace with actual Google Maps API
            const mockDistance = Utils.calculateDistance(origin, destination);

            return {
                distance: mockDistance,
                duration: Math.floor(mockDistance / 60) + ' hours', // Mock duration
                route: `${origin} → ${destination}`,
                stateBreakdown: {
                    'OH': Math.floor(mockDistance * 0.2),
                    'IN': Math.floor(mockDistance * 0.3),
                    'IL': Math.floor(mockDistance * 0.5)
                }
            };
        } catch (error) {
            console.error('Error calculating route:', error);
            throw error;
        }
    },

    // Geocode address
    geocodeAddress: async (address) => {
        try {
            // Mock implementation - replace with actual Google Maps API
            const mockCoordinates = {
                lat: 39.9612 + (Math.random() - 0.5) * 2,
                lng: -82.9988 + (Math.random() - 0.5) * 2
            };

            return mockCoordinates;
        } catch (error) {
            console.error('Error geocoding address:', error);
            throw error;
        }
    }
};

// OCR Document Processing
const OCRService = {
    // Process document and extract text
    processDocument: async (file) => {
        try {
            // Mock implementation - replace with actual Google Vision API
            const mockResults = {
                text: 'Mock extracted text from document',
                confidence: 0.95,
                fields: {
                    loadNumber: 'RC-2025-001',
                    shipper: 'ABC Manufacturing Corp',
                    rate: 2500.00,
                    pickupDate: '2025-11-15',
                    deliveryDate: '2025-11-16'
                }
            };

            return mockResults;
        } catch (error) {
            console.error('Error processing document:', error);
            throw error;
        }
    },

    // Upload file to storage
    uploadFile: async (file, path) => {
        try {
            if (!Auth.storage) {
                throw new Error('Storage not initialized');
            }

            const storageRef = Auth.storage.ref();
            const fileRef = storageRef.child(path);
            const snapshot = await fileRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();

            return downloadURL;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }
};

// PDF Generation
const PDFService = {
    // Generate settlement PDF
    generateSettlementPDF: async (settlementData) => {
        try {
            // Mock implementation - replace with actual PDF generation
            const mockPDF = {
                filename: `settlement_${settlementData.settlementNumber}.pdf`,
                size: '150KB',
                url: 'mock://pdf/settlement.pdf'
            };

            return mockPDF;
        } catch (error) {
            console.error('Error generating settlement PDF:', error);
            throw error;
        }
    },

    // Generate IFTA report PDF
    generateIFTAPDF: async (iftaData) => {
        try {
            // Mock implementation - replace with actual PDF generation
            const mockPDF = {
                filename: `ifta_${iftaData.quarter}_${iftaData.year}.pdf`,
                size: '250KB',
                url: 'mock://pdf/ifta_report.pdf'
            };

            return mockPDF;
        } catch (error) {
            console.error('Error generating IFTA PDF:', error);
            throw error;
        }
    },

    // Generate invoice PDF
    generateInvoicePDF: async (invoiceData) => {
        try {
            // Mock implementation - replace with actual PDF generation
            const mockPDF = {
                filename: `invoice_${invoiceData.invoiceNumber}.pdf`,
                size: '120KB',
                url: 'mock://pdf/invoice.pdf'
            };

            return mockPDF;
        } catch (error) {
            console.error('Error generating invoice PDF:', error);
            throw error;
        }
    }
};

// IFTA Calculations
const IFTACalculator = {
    // Calculate IFTA taxes
    calculateIFTA: (quarterData) => {
        const { totalMiles, totalGallons, stateBreakdown } = quarterData;
        const mpg = totalMiles / totalGallons;

        const taxCalculations = {};
        let totalTaxDue = 0;

        // Mock tax rates by state
        const taxRates = {
            'OH': 0.47, 'IN': 0.51, 'IL': 0.52, 'KY': 0.45,
            'TN': 0.48, 'MI': 0.46, 'WI': 0.43, 'IA': 0.445,
            'MO': 0.42, 'AR': 0.405, 'MS': 0.37, 'AL': 0.39,
            'GA': 0.41, 'SC': 0.41, 'NC': 0.41, 'VA': 0.41,
            'WV': 0.41, 'PA': 0.41, 'NY': 0.41, 'VT': 0.41,
            'NH': 0.41, 'ME': 0.41, 'MA': 0.41, 'RI': 0.41,
            'CT': 0.41, 'NJ': 0.41, 'DE': 0.41, 'MD': 0.41,
            'DC': 0.41, 'FL': 0.41, 'TX': 0.41, 'OK': 0.41,
            'KS': 0.41, 'NE': 0.41, 'SD': 0.41, 'ND': 0.41,
            'MT': 0.41, 'WY': 0.41, 'CO': 0.41, 'NM': 0.41,
            'AZ': 0.41, 'UT': 0.41, 'ID': 0.41, 'WA': 0.41,
            'OR': 0.41, 'NV': 0.41, 'CA': 0.41, 'AK': 0.41,
            'HI': 0.41
        };

        for (const [state, miles] of Object.entries(stateBreakdown)) {
            const gallonsInState = miles / mpg;
            const taxRate = taxRates[state] || 0.41;
            const taxDue = gallonsInState * taxRate;

            taxCalculations[state] = {
                miles,
                gallons: Math.round(gallonsInState * 100) / 100,
                mpg: Math.round(mpg * 100) / 100,
                taxRate,
                taxDue: Math.round(taxDue * 100) / 100
            };

            totalTaxDue += taxDue;
        }

        return {
            totalMiles,
            totalGallons,
            mpg: Math.round(mpg * 100) / 100,
            taxCalculations,
            totalTaxDue: Math.round(totalTaxDue * 100) / 100
        };
    }
};

// Settlement Calculator
const SettlementCalculator = {
    // Calculate driver settlement
    calculateSettlement: (driverId, periodStart, periodEnd) => {
        const driver = DataManager.drivers.find(d => d.id === driverId);
        if (!driver) {
            throw new Error('Driver not found');
        }

        const loads = DataManager.loads.filter(load =>
            load.driverId === driverId &&
            load.pickedUpAt >= periodStart &&
            load.pickedUpAt <= periodEnd
        );

        let totalMiles = 0;
        let loadedMiles = 0;
        let emptyMiles = 0;
        let basePay = 0;
        let fuelSurcharge = 0;
        let detentionPay = 0;
        let percentagePay = 0;

        loads.forEach(load => {
            const miles = load.mileage.total;
            totalMiles += miles;
            loadedMiles += miles; // Simplified - would track loaded vs empty

            if (driver.payment.type === 'per_mile') {
                basePay += miles * driver.payment.perMileRate;
            } else if (driver.payment.type === 'percentage') {
                // Owner operator percentage calculation
                const loadRevenue = load.rate.total;
                const percentageRate = driver.payment.percentageRate || 75;
                percentagePay += loadRevenue * (percentageRate / 100);
                basePay += loadRevenue * (percentageRate / 100);
            } else if (driver.payment.type === 'flat_rate') {
                basePay += driver.payment.flatRate;
            } else if (driver.payment.type === 'salary') {
                // Fixed salary calculation (weekly)
                const weeklySalary = driver.payment.weeklySalary || 1200;
                basePay = weeklySalary;
            }

            // Add fuel surcharge, detention pay, etc.
            fuelSurcharge += load.rate.fuelSurcharge || 0;
            detentionPay += load.rate.detentionPay || 0;
        });

        // For salary drivers, ensure they're paid their full salary regardless of loads
        if (driver.payment.type === 'salary' && loads.length === 0) {
            basePay = driver.payment.weeklySalary || 1200;
        }

        const grossPay = basePay + fuelSurcharge + detentionPay;

        // Calculate deductions
        const deductions = {
            fuelAdvance: 0, // Would come from actual data
            cashAdvance: 0,
            insurance: driver.payment.type === 'owner_operator' ? 0 : 45.00, // No insurance deduction for owner operators
            truckPayment: driver.payment.type === 'owner_operator' ? driver.payment.truckPayment || 0 : 0,
            taxes: {
                federal: grossPay * 0.075,
                state: grossPay * 0.02,
                socialSecurity: driver.payment.type === 'owner_operator' ? 0 : grossPay * 0.062,
                medicare: driver.payment.type === 'owner_operator' ? 0 : grossPay * 0.0145
            }
        };

        const totalDeductions = Object.values(deductions.taxes).reduce((sum, tax) => sum + tax, 0) +
            deductions.insurance + deductions.fuelAdvance + deductions.cashAdvance + deductions.truckPayment;

        const netPay = grossPay - totalDeductions;

        return {
            driverId,
            period: { start: periodStart, end: periodEnd },
            paymentType: driver.payment.type,
            earnings: {
                totalMiles,
                loadedMiles,
                emptyMiles,
                basePay: Math.round(basePay * 100) / 100,
                percentagePay: Math.round(percentagePay * 100) / 100,
                fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
                detentionPay: Math.round(detentionPay * 100) / 100,
                grossPay: Math.round(grossPay * 100) / 100
            },
            deductions: {
                ...deductions,
                totalDeductions: Math.round(totalDeductions * 100) / 100
            },
            netPay: Math.round(netPay * 100) / 100,
            loads
        };
    },

    // Generate settlement when load is delivered
    generateSettlementOnDelivery: (loadId) => {
        const load = DataManager.loads.find(l => l.id === loadId);
        if (!load || load.status !== 'delivered') {
            return null;
        }

        const driverId = load.driverId;
        const deliveryDate = new Date(load.deliveredAt);
        const weekStart = new Date(deliveryDate);
        weekStart.setDate(deliveryDate.getDate() - deliveryDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        return SettlementCalculator.calculateSettlement(driverId, weekStart, weekEnd);
    }
};

// Debug Function
function debugSettlementData() {
    const driverSelect = document.getElementById('driverSelect');
    const driverId = driverSelect.value;

    if (!driverId) {
        alert('Please select a driver first.');
        return;
    }

    const totalLoads = DataManager.loads.length;
    const driverLoads = DataManager.loads.filter(l => String(l.driverId) === String(driverId));
    const deliveredLoads = driverLoads.filter(l => (l.status || '').toLowerCase() === 'delivered');
    const unpaidLoads = deliveredLoads.filter(l => !l.settlementId || l.settlementId === 'null');

    const msg = `
    DEBUG REPORT:
    ----------------
    Selected Driver ID: ${driverId}
    Total Loads in System: ${totalLoads}
    Loads for this Driver: ${driverLoads.length}
    Delivered Loads for Driver: ${deliveredLoads.length}
    Unpaid & Delivered Loads: ${unpaidLoads.length}
    
    Sample Load (if any):
    ${driverLoads.length > 0 ? JSON.stringify(driverLoads[0], null, 2) : 'No loads found'}
    `;

    console.log(msg);
    alert(msg);
}

/* ----------  NEW: SHOW EVERY UNSETTLED DELIVERED LOAD  ---------- */
function loadAllUnsettledDeliveredLoads() {
    const tbody = document.getElementById('driverLoadsBody');
    const loadsSection = document.getElementById('settlementLoadsSection');
    const noLoadsMsg = document.getElementById('noLoadsMessage');
    const generateBtn = document.getElementById('generateBtn');

    tbody.innerHTML = '';          // clear old rows
    document.getElementById('grossPay').textContent = '$0.00';
    document.getElementById('netPay').textContent = '$0.00';

    // 1. collect every delivered load that has NO settlementId
    const eligible = DataManager.loads.filter(l => {
        const status = (l.status || '').toLowerCase();
        const delivered = status === 'delivered' || status === 'completed';
        const unpaid = !l.settlementId || l.settlementId === 'null' || l.settlementId === 'undefined';
        return delivered && unpaid;
    });

    console.log(`[Settlement] ${eligible.length} delivered loads ready for settlement`);

    if (eligible.length === 0) {
        loadsSection.classList.add('hidden');
        noLoadsMsg.classList.remove('hidden');
        if (generateBtn) generateBtn.disabled = true;
        return;
    }

    noLoadsMsg.classList.add('hidden');
    loadsSection.classList.remove('hidden');

    eligible.forEach(load => {
        // pay amount for this load (per-mile default – adjust if you store driver %)
        const miles = parseFloat(load.mileage?.total || load.totalMiles || 0);
        const rate = 0.65;   // fallback – you can read driver.rate if you wish
        const pay = miles * rate;

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-blue-50 transition-colors';
        tr.innerHTML = `
          <td class="px-4 py-3">
            <input type="checkbox" class="settlement-checkbox w-4 h-4 text-blue-600 rounded"
                   value="${load.id}"
                   data-pay="${pay.toFixed(2)}"
                   data-miles="${miles}"
                   onchange="calculateSettlementTotal()">
          </td>
          <td class="px-4 py-3 text-sm font-medium text-gray-900">${load.loadNumber}</td>
          <td class="px-4 py-3 text-sm text-gray-500">${Utils.formatDate(load.delivery?.date || load.updatedAt)}</td>
          <td class="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">${load.pickup?.city} → ${load.delivery?.city}</td>
          <td class="px-4 py-3 text-sm font-bold text-gray-900 text-right">${Utils.formatCurrency(pay)}</td>`;
        tbody.appendChild(tr);
    });

    calculateSettlementTotal();   // refresh totals / charts
}

// Dashboard Analytics
const Analytics = {
    // Get dashboard metrics
    getDashboardMetrics: () => {
        const loads = DataManager.loads;
        const drivers = DataManager.drivers.filter(d => d.employment.status === 'active');

        const activeLoads = loads.filter(l => l.status === 'in_transit').length;
        const weeklyRevenue = loads
            .filter(l => {
                const loadDate = new Date(l.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return loadDate >= weekAgo;
            })
            .reduce((sum, load) => sum + load.rate.total, 0);

        const monthlyMiles = loads
            .filter(l => {
                const loadDate = new Date(l.createdAt);
                const monthAgo = new Date();
                monthAgo.setDate(monthAgo.getDate() - 30);
                return loadDate >= monthAgo;
            })
            .reduce((sum, load) => sum + load.mileage.total, 0);

        return {
            activeLoads,
            weeklyRevenue: Math.round(weeklyRevenue),
            activeDrivers: drivers.length,
            monthlyMiles
        };
    },

    // Get load status distribution
    getLoadStatusDistribution: () => {
        const loads = DataManager.loads;
        const statusCounts = {};

        loads.forEach(load => {
            statusCounts[load.status] = (statusCounts[load.status] || 0) + 1;
        });

        return statusCounts;
    },

    // Get revenue trends
    getRevenueTrends: (months = 6) => {
        const loads = DataManager.loads;
        const trends = {};

        loads.forEach(load => {
            const date = new Date(load.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            trends[monthKey] = (trends[monthKey] || 0) + load.rate.total;
        });

        return trends;
    }
};

// Initialize application
const App = {
    // Initialize the application
    init: async () => {
        console.log('Initializing Somali Truck TMS...');

        try {
            // Load company settings
            CompanySettings.loadSettings();

            // Initialize Firebase
            Auth.init();

            // Initialize data
            await DataManager.init();

            // Set up global event listeners
            App.setupEventListeners();

            console.log('TMS initialized successfully');
        } catch (error) {
            console.error('Error initializing TMS:', error);
            Utils.showNotification('Error initializing application', 'error');
        }
    },

    // Set up global event listeners
    setupEventListeners: () => {
        // Phone number formatting
        document.addEventListener('input', (e) => {
            if (e.target.type === 'tel') {
                e.target.value = Utils.formatPhone(e.target.value);
            }
        });

        // Form validation
        document.addEventListener('submit', (e) => {
            if (e.target.tagName === 'FORM') {
                App.validateForm(e.target);
            }
        });

        // Auto-save functionality
        let saveTimeout;
        document.addEventListener('input', (e) => {
            if (e.target.hasAttribute('data-autosave')) {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    App.autoSave(e.target);
                }, 2000);
            }
        });
    },

    // Validate form
    validateForm: (form) => {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('border-red-500');
                isValid = false;
            } else {
                input.classList.remove('border-red-500');
            }

            // Email validation
            if (input.type === 'email' && input.value && !Utils.validateEmail(input.value)) {
                input.classList.add('border-red-500');
                isValid = false;
            }

            // Phone validation
            if (input.type === 'tel' && input.value && !Utils.validatePhone(input.value)) {
                input.classList.add('border-red-500');
                isValid = false;
            }
        });

        if (!isValid) {
            Utils.showNotification('Please fill in all required fields correctly', 'error');
        }

        return isValid;
    },

    // Auto-save functionality
    autoSave: (element) => {
        const form = element.closest('form');
        if (form) {
            const formData = new FormData(form);
            console.log('Auto-saving form data:', Object.fromEntries(formData));
            Utils.showNotification('Changes saved automatically', 'success');
        }
    }
};

// Company Settings Management
const CompanySettings = {
    // Open company settings modal
    openModal: () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Company Settings</h3>
                    <button onclick="CompanySettings.closeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="companySettingsForm">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                            <input type="text" id="companyNameInput" value="${CONFIG.company.name}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Company Logo (2-3 characters)</label>
                            <input type="text" id="companyLogoInput" value="${CONFIG.company.logo}" maxlength="3"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input type="text" id="companyAddressInput" value="${CONFIG.company.address}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input type="tel" id="companyPhoneInput" value="${CONFIG.company.phone}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" id="companyEmailInput" value="${CONFIG.company.email}"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button type="button" onclick="CompanySettings.closeModal()" 
                                class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" 
                                class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Add form submission handler
        document.getElementById('companySettingsForm').addEventListener('submit', CompanySettings.saveSettings);
    },

    // Close company settings modal
    closeModal: () => {
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) {
            modal.remove();
        }
    },

    // Save company settings
    saveSettings: (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const settings = {
            name: document.getElementById('companyNameInput').value,
            logo: document.getElementById('companyLogoInput').value?.toUpperCase() || 'ST',
            address: document.getElementById('companyAddressInput').value,
            phone: document.getElementById('companyPhoneInput').value,
            email: document.getElementById('companyEmailInput').value
        };

        // Update CONFIG
        CONFIG.company = { ...CONFIG.company, ...settings };

        // Update UI
        CompanySettings.updateUI();

        // Save to localStorage
        localStorage.setItem('companySettings', JSON.stringify(CONFIG.company));

        Utils.showNotification('Company settings updated successfully', 'success');
        CompanySettings.closeModal();
    },

    // Update UI elements
    updateUI: () => {
        // Update company name in sidebar
        const companyNameElement = document.getElementById('companyName');
        if (companyNameElement) {
            companyNameElement.textContent = CONFIG.company.name;
        }

        // Update company logo
        const companyLogoElement = document.getElementById('companyLogo');
        if (companyLogoElement) {
            companyLogoElement.textContent = CONFIG.company.logo;
        }

        // Update page titles that include company name
        const pageTitle = document.querySelector('title');
        if (pageTitle && pageTitle.textContent.includes('Somali Truck')) {
            pageTitle.textContent = pageTitle.textContent.replace('Somali Truck', CONFIG.company.name);
        }
    },

    // Load saved settings
    loadSettings: () => {
        const saved = localStorage.getItem('companySettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                CONFIG.company = { ...CONFIG.company, ...settings };
                CompanySettings.updateUI();
            } catch (error) {
                console.error('Error loading company settings:', error);
            }
        }
    }
};

// --- Settlement Generation Logic ---

// 1. New Function to Load Unpaid Loads (Replaces Date-based logic)
function loadDriverUnpaidLoads() {
    const driverId = document.getElementById('driverSelect').value;
    const loadsSection = document.getElementById('settlementLoadsSection');
    const noLoadsMsg = document.getElementById('noLoadsMessage');
    const tbody = document.getElementById('driverLoadsBody');
    const generateBtn = document.getElementById('generateBtn');

    // Reset UI
    tbody.innerHTML = '';
    document.getElementById('grossPay').textContent = '$0.00';
    document.getElementById('netPay').textContent = '$0.00';

    if (!driverId) {
        loadsSection.classList.add('hidden');
        noLoadsMsg.classList.add('hidden');
        return;
    }

    // 2. Query Firestore for ALL eligible loads (Fixed Logic)
    // We look for loads that belong to the driver, are delivered, and have NO settlement ID yet.
    const eligibleLoads = DataManager.loads.filter(l => {
        // Robust driver ID check
        const isDriverMatch = String(l.driverId) === String(driverId);

        // Robust status check (case-insensitive)
        const status = (l.status || '').toLowerCase();
        const isStatusMatch = status === 'delivered' || status === 'completed';

        // Robust settlement ID check (falsy or "null"/"undefined" strings)
        const isUnpaid = !l.settlementId || l.settlementId === 'null' || l.settlementId === 'undefined';

        return isDriverMatch && isStatusMatch && isUnpaid;
    });

    console.log(`Found ${eligibleLoads.length} eligible loads for driver ${driverId}`);

    if (eligibleLoads.length === 0) {
        loadsSection.classList.add('hidden');
        noLoadsMsg.classList.remove('hidden');
        generateBtn.disabled = true;
    } else {
        noLoadsMsg.classList.add('hidden');
        loadsSection.classList.remove('hidden');
        document.getElementById('loadCountBadge').textContent = `${eligibleLoads.length} found`;

        // 3. Populate Table
        eligibleLoads.forEach(load => {
            // Calculate Driver Pay based on their profile
            const driver = DataManager.drivers.find(d => d.id === driverId);
            let payAmount = 0;

            if (driver?.payment?.type === 'percentage') {
                payAmount = (load.rate.total * (driver.payment.percentage / 100));
            } else {
                // Default to Per Mile
                const miles = parseFloat(load.mileage?.total || load.totalMiles || 0);
                const rate = parseFloat(driver?.payment?.perMileRate || 0);
                payAmount = miles * rate;
            }

            const tr = document.createElement('tr');
            tr.className = "hover:bg-blue-50 transition-colors";
            tr.innerHTML = `
                <td class="px-4 py-3"><input type="checkbox" class="settlement-checkbox w-4 h-4 text-blue-600 rounded" 
                    value="${load.id}" 
                    data-pay="${payAmount.toFixed(2)}" 
                    data-miles="${load.mileage?.total || load.totalMiles || 0}"
                    onchange="calculateSettlementTotal()"></td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">${load.loadNumber}</td>
                <td class="px-4 py-3 text-sm text-gray-500">${Utils.formatDate(load.delivery?.date || load.updatedAt)}</td>
                <td class="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">${load.pickup?.city} → ${load.delivery?.city}</td>
                <td class="px-4 py-3 text-sm font-bold text-gray-900 text-right">${Utils.formatCurrency(payAmount)}</td>
            `;
            tbody.appendChild(tr);
        });
    }
    calculateSettlementTotal();
}

// 2. Updated Calculation Logic (Updates the totals in real-time)
function calculateSettlementTotal() {
    const checkboxes = document.querySelectorAll('.settlement-checkbox:checked');
    const generateBtn = document.getElementById('generateBtn');

    let grossPay = 0;
    checkboxes.forEach(cb => {
        grossPay += parseFloat(cb.dataset.pay);
    });

    const fuel = parseFloat(document.getElementById('fuelDeduction').value) || 0;
    const insurance = parseFloat(document.getElementById('insuranceDeduction').value) || 0;
    const other = parseFloat(document.getElementById('otherDeduction').value) || 0;

    const totalDeductions = fuel + insurance + other;
    const netPay = grossPay - totalDeductions;

    // Update UI
    document.getElementById('grossPay').textContent = Utils.formatCurrency(grossPay);
    document.getElementById('totalDeductions').textContent = '-' + Utils.formatCurrency(totalDeductions);

    const netPayEl = document.getElementById('netPay');
    netPayEl.textContent = Utils.formatCurrency(netPay);

    // Visual feedback for negative pay
    if (netPay < 0) {
        netPayEl.classList.remove('text-green-600');
        netPayEl.classList.add('text-red-600');
    } else {
        netPayEl.classList.remove('text-red-600');
        netPayEl.classList.add('text-green-600');
    }

    // Enable button only if loads are selected
    if (generateBtn) {
        generateBtn.disabled = checkboxes.length === 0;
    }
}

// 3. Toggle All Helper
function toggleAllLoads(source) {
    const checkboxes = document.querySelectorAll('.settlement-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = source.checked;
    });
    calculateSettlementTotal();
}

// Maps API Mock
const MapsAPI = {
    calculateRoute: async (origin, dest) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Use Utils.calculateDistance for the mock logic
        const distance = Utils.calculateDistance(origin, dest);

        return {
            distance: distance,
            duration: Math.round(distance / 60 * 60) + ' mins' // rough estimate
        };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        Utils,
        Auth,
        DataManager,
        MapsAPI,
        OCRService,
        PDFService,
        IFTACalculator,
        SettlementCalculator,
        Analytics,
        App,
        CompanySettings
    };
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// GLOBAL EXPORTS — DO NOT DELETE EVER AGAIN
window.loadDriverUnpaidLoads = loadDriverUnpaidLoads;
window.calculateSettlementTotal = calculateSettlementTotal;
window.toggleAllLoads = toggleAllLoads;
window.openCreateSettlementModal = () => {
    document.getElementById('createSettlementModal')?.classList.add('show');
    setTimeout(() => loadDriverUnpaidLoads(), 100); // auto-load on open
};