// ATS FREIGHT LLC - Transportation Management System
// Main JavaScript File

// Global Configuration
const CONFIG = {
    company: {
        name: 'ATS FREIGHT LLC',
        logo: 'ATS',
        logoImage: 'resources/ats-freight-logo.png',
        address: '3191 MORSE RD STE 15',
        city: 'COLUMBUS, OH 43231',
        fullAddress: '3191 MORSE RD STE 15, COLUMBUS, OH 43231',
        phone: '(614) 254-0380',
        email: 'dispatch@atsfreight.com',
        dot: 'DOT 3169186'
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

// Disable offline persistence due to "Multiple tabs" error
// This forces online-only mode but ensures Firebase works correctly
// firebase.firestore().enablePersistence()
//     .catch((err) => {
//         if (err.code == 'failed-precondition') {
//             console.warn('Persistence failed: Multiple tabs open');
//         } else if (err.code == 'unimplemented') {
//             console.warn('Persistence not available in this browser');
//         }
//     });

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

    // Calculate distance between two points
    calculateDistance: (origin, destination) => {
        // Expanded lookup table for common routes (in miles)
        const distances = {
            // Columbus, OH routes
            'columbus, oh_chicago, il': 355,
            'columbus, oh_nashville, tn': 380,
            'columbus, oh_atlanta, ga': 550,
            'columbus, oh_dallas, tx': 930,
            'columbus, oh_phoenix, az': 1888,
            'columbus, oh_new york, ny': 580,
            'columbus, oh_detroit, mi': 200,
            'columbus, oh_pittsburgh, pa': 185,
            'columbus, oh_cincinnati, oh': 110,
            'columbus, oh_cleveland, oh': 145,
            'columbus, oh_indianapolis, in': 175,
            'columbus, oh_louisville, ky': 200,
            'columbus, oh_memphis, tn': 600,
            'columbus, oh_kansas city, mo': 700,
            'columbus, oh_denver, co': 1200,
            'columbus, oh_los angeles, ca': 2300,
            // Chicago routes
            'chicago, il_detroit, mi': 280,
            'chicago, il_cleveland, oh': 350,
            'chicago, il_indianapolis, in': 185,
            'chicago, il_milwaukee, wi': 90,
            'chicago, il_minneapolis, mn': 410,
            'chicago, il_st. louis, mo': 300,
            'chicago, il_kansas city, mo': 510,
            'chicago, il_denver, co': 920,
            'chicago, il_dallas, tx': 925,
            'chicago, il_atlanta, ga': 715,
            'chicago, il_new york, ny': 790,
            // Dallas routes
            'dallas, tx_houston, tx': 240,
            'dallas, tx_san antonio, tx': 275,
            'dallas, tx_phoenix, az': 1065,
            'dallas, tx_denver, co': 925,
            'dallas, tx_kansas city, mo': 550,
            'dallas, tx_memphis, tn': 450,
            'dallas, tx_atlanta, ga': 925,
            'dallas, tx_los angeles, ca': 1435,
            // Atlanta routes
            'atlanta, ga_charlotte, nc': 245,
            'atlanta, ga_nashville, tn': 250,
            'atlanta, ga_birmingham, al': 150,
            'atlanta, ga_jacksonville, fl': 350,
            'atlanta, ga_miami, fl': 665,
            'atlanta, ga_new york, ny': 870,
            'atlanta, ga_chicago, il': 715,
            // New York routes
            'new york, ny_boston, ma': 215,
            'new york, ny_philadelphia, pa': 95,
            'new york, ny_washington, dc': 225,
            'new york, ny_baltimore, md': 190,
            'new york, ny_charlotte, nc': 630,
            // Los Angeles routes
            'los angeles, ca_san francisco, ca': 380,
            'los angeles, ca_san diego, ca': 120,
            'los angeles, ca_las vegas, nv': 270,
            'los angeles, ca_phoenix, az': 375,
            'los angeles, ca_denver, co': 1020,
            // Denver routes
            'denver, co_salt lake city, ut': 520,
            'denver, co_kansas city, mo': 600,
            'denver, co_omaha, ne': 540,
            'denver, co_phoenix, az': 600,
            // Phoenix routes
            'phoenix, az_las vegas, nv': 300,
            'phoenix, az_el paso, tx': 360,
            'phoenix, az_albuquerque, nm': 420,
            // Common reverse routes
            'chicago, il_columbus, oh': 355,
            'nashville, tn_columbus, oh': 380,
            'atlanta, ga_columbus, oh': 550,
            'dallas, tx_columbus, oh': 930,
            'phoenix, az_columbus, oh': 1888,
            'new york, ny_columbus, oh': 580,
            'detroit, mi_columbus, oh': 200,
            'pittsburgh, pa_columbus, oh': 185,
            'cincinnati, oh_columbus, oh': 110,
            'cleveland, oh_columbus, oh': 145,
            'indianapolis, in_columbus, oh': 175,
            'louisville, ky_columbus, oh': 200
        };

        // Normalize input (remove extra spaces, lowercase)
        const normalize = (str) => str.toLowerCase().trim().replace(/\s+/g, ' ');
        const originNorm = normalize(origin);
        const destNorm = normalize(destination);
        const key = `${originNorm}_${destNorm}`;

        // Try direct match
        if (distances[key]) return distances[key];

        // Try reverse match
        const reverseKey = `${destNorm}_${originNorm}`;
        if (distances[reverseKey]) return distances[reverseKey];

        // Fallback: Use coordinate-based calculation (Haversine formula)
        return Utils.calculateDistanceByCoordinates(origin, destination);
    },

    // Calculate distance using city coordinates (Haversine formula)
    calculateDistanceByCoordinates: (origin, destination) => {
        // Major city coordinates (lat, lng)
        const cityCoords = {
            'columbus': { lat: 39.9612, lng: -82.9988 },
            'oh': { lat: 39.9612, lng: -82.9988 },
            'chicago': { lat: 41.8781, lng: -87.6298 },
            'il': { lat: 41.8781, lng: -87.6298 },
            'dallas': { lat: 32.7767, lng: -96.7970 },
            'tx': { lat: 32.7767, lng: -96.7970 },
            'atlanta': { lat: 33.7490, lng: -84.3880 },
            'ga': { lat: 33.7490, lng: -84.3880 },
            'phoenix': { lat: 33.4484, lng: -112.0740 },
            'az': { lat: 33.4484, lng: -112.0740 },
            'new york': { lat: 40.7128, lng: -74.0060 },
            'ny': { lat: 40.7128, lng: -74.0060 },
            'detroit': { lat: 42.3314, lng: -83.0458 },
            'mi': { lat: 42.3314, lng: -83.0458 },
            'nashville': { lat: 36.1627, lng: -86.7816 },
            'tn': { lat: 36.1627, lng: -86.7816 },
            'cleveland': { lat: 41.4993, lng: -81.6944 },
            'cincinnati': { lat: 39.1031, lng: -84.5120 },
            'indianapolis': { lat: 39.7684, lng: -86.1581 },
            'in': { lat: 39.7684, lng: -86.1581 },
            'pittsburgh': { lat: 40.4406, lng: -79.9959 },
            'pa': { lat: 40.4406, lng: -79.9959 },
            'louisville': { lat: 38.2527, lng: -85.7585 },
            'ky': { lat: 38.2527, lng: -85.7585 },
            'memphis': { lat: 35.1495, lng: -90.0490 },
            'kansas city': { lat: 39.0997, lng: -94.5786 },
            'mo': { lat: 39.0997, lng: -94.5786 },
            'denver': { lat: 39.7392, lng: -104.9903 },
            'co': { lat: 39.7392, lng: -104.9903 },
            'los angeles': { lat: 34.0522, lng: -118.2437 },
            'ca': { lat: 34.0522, lng: -118.2437 },
            'houston': { lat: 29.7604, lng: -95.3698 },
            'san antonio': { lat: 29.4241, lng: -98.4936 },
            'miami': { lat: 25.7617, lng: -80.1918 },
            'fl': { lat: 25.7617, lng: -80.1918 },
            'boston': { lat: 42.3601, lng: -71.0589 },
            'ma': { lat: 42.3601, lng: -71.0589 },
            'philadelphia': { lat: 39.9526, lng: -75.1652 },
            'washington': { lat: 38.9072, lng: -77.0369 },
            'dc': { lat: 38.9072, lng: -77.0369 },
            'baltimore': { lat: 39.2904, lng: -76.6122 },
            'md': { lat: 39.2904, lng: -76.6122 },
            'charlotte': { lat: 35.2271, lng: -80.8431 },
            'nc': { lat: 35.2271, lng: -80.8431 },
            'birmingham': { lat: 33.5207, lng: -86.8025 },
            'al': { lat: 33.5207, lng: -86.8025 },
            'jacksonville': { lat: 30.3322, lng: -81.6557 },
            'san francisco': { lat: 37.7749, lng: -122.4194 },
            'san diego': { lat: 32.7157, lng: -117.1611 },
            'las vegas': { lat: 36.1699, lng: -115.1398 },
            'nv': { lat: 36.1699, lng: -115.1398 },
            'salt lake city': { lat: 40.7608, lng: -111.8910 },
            'ut': { lat: 40.7608, lng: -111.8910 },
            'omaha': { lat: 41.2565, lng: -95.9345 },
            'ne': { lat: 41.2565, lng: -95.9345 },
            'el paso': { lat: 31.7619, lng: -106.4850 },
            'albuquerque': { lat: 35.0844, lng: -106.6504 },
            'nm': { lat: 35.0844, lng: -106.6504 },
            'milwaukee': { lat: 43.0389, lng: -87.9065 },
            'wi': { lat: 43.0389, lng: -87.9065 },
            'minneapolis': { lat: 44.9778, lng: -93.2650 },
            'mn': { lat: 44.9778, lng: -93.2650 },
            'st. louis': { lat: 38.6270, lng: -90.1994 }
        };

        // Extract city and state from origin/destination
        const getCoords = (location) => {
            const parts = location.toLowerCase().split(',').map(s => s.trim());
            const city = parts[0];
            const state = parts[1] || '';

            // Try city name first
            if (cityCoords[city]) return cityCoords[city];
            // Try state abbreviation
            if (cityCoords[state]) return cityCoords[state];
            // Try state name
            if (cityCoords[state.toLowerCase()]) return cityCoords[state.toLowerCase()];

            // Default to Columbus, OH if not found
            return { lat: 39.9612, lng: -82.9988 };
        };

        const originCoords = getCoords(origin);
        const destCoords = getCoords(destination);

        // Haversine formula to calculate distance between two points
        const R = 3959; // Earth's radius in miles
        const dLat = (destCoords.lat - originCoords.lat) * Math.PI / 180;
        const dLng = (destCoords.lng - originCoords.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(originCoords.lat * Math.PI / 180) * Math.cos(destCoords.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        // Add 10% for road distance (not straight line)
        return Math.round(distance * 1.1);
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
    },

    // Get ISO week number
    getWeekNumber: (d) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    },

    // Get week start date
    getWeekStart: (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    },

    // Get ISO week number
    getWeekNumber: (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },

    // Format date range for settlement period (e.g., "Nov 10 - Nov 17, 2025")
    formatDateRange: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const startMonth = monthNames[start.getMonth()];
        const startDay = start.getDate();
        const endMonth = monthNames[end.getMonth()];
        const endDay = end.getDate();
        const year = end.getFullYear();
        
        // If same month, format as "Nov 10 - 17, 2025"
        if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
            return `${startMonth} ${startDay} - ${endDay}, ${year}`;
        }
        // If different months but same year, format as "Nov 30 - Dec 7, 2025"
        else if (start.getFullYear() === end.getFullYear()) {
            return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
        }
        // If different years, format as "Dec 28, 2024 - Jan 4, 2025"
        else {
            return `${startMonth} ${startDay}, ${start.getFullYear()} - ${endMonth} ${endDay}, ${year}`;
        }
    },

    // Get week end date (6 days after week start)
    getWeekEnd: (weekStart) => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return weekEnd;
    }
};

// Compliance & Expiration Checking
function checkExpirations() {
    const alerts = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Check driver medical card expirations
    DataManager.drivers.forEach(d => {
        if (!d.medicalExpirationDate) return;
        
        const exp = new Date(d.medicalExpirationDate);
        exp.setHours(0, 0, 0, 0);
        
        if (exp <= in30Days && exp >= today) {
            const days = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
            const driverName = `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.driverNumber || 'Unknown Driver';
            alerts.push({
                type: 'medical',
                message: `MEDICAL CARD: ${driverName} expires in ${days} day${days !== 1 ? 's' : ''}`,
                days: days,
                date: exp
            });
        } else if (exp < today) {
            const daysOverdue = Math.ceil((today - exp) / (1000 * 60 * 60 * 24));
            const driverName = `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.driverNumber || 'Unknown Driver';
            alerts.push({
                type: 'medical',
                message: `MEDICAL CARD: ${driverName} EXPIRED ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago`,
                days: -daysOverdue,
                date: exp
            });
        }
    });

    // Check truck expirations
    DataManager.trucks.forEach(t => {
        const truckNumber = t.number || t.truckNumber || 'Unknown Truck';
        
        ['registrationExpiry', 'inspectionDueDate', 'cabCardRenewalDate'].forEach(field => {
            if (!t[field]) return;
            
            const exp = new Date(t[field]);
            exp.setHours(0, 0, 0, 0);
            
            if (exp <= in30Days && exp >= today) {
                const days = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
                const label = field === 'registrationExpiry' ? 'REGISTRATION' :
                             field === 'inspectionDueDate' ? 'ANNUAL INSPECTION' : 'CAB CARD (IRP)';
                alerts.push({
                    type: field,
                    message: `${label}: Truck ${truckNumber} expires in ${days} day${days !== 1 ? 's' : ''}`,
                    days: days,
                    date: exp
                });
            } else if (exp < today) {
                const daysOverdue = Math.ceil((today - exp) / (1000 * 60 * 60 * 24));
                const label = field === 'registrationExpiry' ? 'REGISTRATION' :
                             field === 'inspectionDueDate' ? 'ANNUAL INSPECTION' : 'CAB CARD (IRP)';
                alerts.push({
                    type: field,
                    message: `${label}: Truck ${truckNumber} EXPIRED ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago`,
                    days: -daysOverdue,
                    date: exp
                });
            }
        });
    });

    // Sort alerts by urgency (expired first, then by days remaining)
    alerts.sort((a, b) => {
        if (a.days < 0 && b.days >= 0) return -1;
        if (a.days >= 0 && b.days < 0) return 1;
        return a.days - b.days;
    });

    if (alerts.length > 0) {
        // Show notification
        const expiredCount = alerts.filter(a => a.days < 0).length;
        const expiringCount = alerts.length - expiredCount;
        let notificationMsg = '';
        
        if (expiredCount > 0 && expiringCount > 0) {
            notificationMsg = `COMPLIANCE ALERT: ${expiredCount} expired, ${expiringCount} expiring soon!`;
        } else if (expiredCount > 0) {
            notificationMsg = `COMPLIANCE ALERT: ${expiredCount} item${expiredCount !== 1 ? 's' : ''} EXPIRED!`;
        } else {
            notificationMsg = `COMPLIANCE ALERT: ${expiringCount} item${expiringCount !== 1 ? 's' : ''} expiring soon!`;
        }
        
        Utils.showNotification(notificationMsg, expiredCount > 0 ? 'error' : 'warning');
        
        // Render compliance alerts if function exists
        if (window.renderComplianceAlerts) {
            window.renderComplianceAlerts(alerts);
        }
    }
}

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
        if (DataManager.initialized) {
            console.log("DataManager already initialized, skipping.");
            return;
        }
        DataManager.initialized = true;
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
                if (window.renderFleet) window.renderFleet();
                // Check expirations when drivers update
                if (window.checkExpirations) window.checkExpirations();
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
                if (window.renderFleet) window.renderFleet();
                // Check expirations when trucks update
                if (window.checkExpirations) window.checkExpirations();
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
                // Re-render invoices when data updates
                if (window.renderInvoices) window.renderInvoices();
                if (window.updateStats) window.updateStats();
            }, error => {
                console.error('Error loading invoices:', error);
            });

            // Listener: EXPENSES
            db.collection('expenses').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
                DataManager.expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log(`Loaded ${DataManager.expenses.length} expenses from Firebase`);
                // Auto-refresh UI if the functions exist on the current page
                if (window.renderExpenses) window.renderExpenses();
                if (window.updateStats) window.updateStats();
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
            payload.companyId = 'ats_freight';

            const docRef = await db.collection('loads').add(payload);

            // Add to local array immediately - REMOVED to prevent duplicates with onSnapshot
            // DataManager.loads.unshift({ id: docRef.id, ...payload });

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

            // UPDATE LOCAL ARRAY
            const index = DataManager.loads.findIndex(l => l.id === loadId);
            if (index !== -1) DataManager.loads[index] = { ...DataManager.loads[index], ...payload };

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
            payload.companyId = 'ats_freight';

            const docRef = await db.collection('drivers').add(payload);

            // Add to local array immediately - REMOVED to prevent duplicates with onSnapshot
            // DataManager.drivers.unshift({ id: docRef.id, ...payload });

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

            const index = DataManager.drivers.findIndex(d => d.id === driverId);
            if (index !== -1) DataManager.drivers[index] = { ...DataManager.drivers[index], ...payload };

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

    // --- TRUCKS ---
    addTruck: async (truckData) => {
        try {
            const payload = JSON.parse(JSON.stringify(truckData));
            payload.createdAt = new Date().toISOString();
            payload.updatedAt = new Date().toISOString();
            payload.companyId = 'ats_freight';

            const docRef = await db.collection('trucks').add(payload);
            Utils.showNotification('Truck added successfully!', 'success');
            return docRef.id;
        } catch (e) {
            console.error('Error adding truck:', e);
            Utils.showNotification('Error adding truck: ' + e.message, 'error');
            throw e;
        }
    },

    updateTruck: async (truckId, truckData) => {
        try {
            const payload = JSON.parse(JSON.stringify(truckData));
            payload.updatedAt = new Date().toISOString();
            await db.collection('trucks').doc(truckId).update(payload);
            Utils.showNotification('Truck updated successfully!', 'success');
        } catch (e) {
            console.error('Error updating truck:', e);
            Utils.showNotification('Error updating truck: ' + e.message, 'error');
            throw e;
        }
    },

    deleteTruck: async (truckId) => {
        if (confirm('Are you sure you want to delete this truck?')) {
            try {
                await db.collection('trucks').doc(truckId).delete();
                Utils.showNotification('Truck deleted successfully!', 'success');
            } catch (e) {
                console.error('Error deleting truck:', e);
                Utils.showNotification('Error deleting truck: ' + e.message, 'error');
                throw e;
            }
        }
    },

    getTruck: (truckId) => {
        return DataManager.trucks.find(t => t.id === truckId || t.number === truckId);
    },

    // --- CUSTOMERS ---
    addCustomer: async (customerData) => {
        try {
            const payload = JSON.parse(JSON.stringify(customerData));
            payload.createdAt = new Date().toISOString();
            payload.updatedAt = new Date().toISOString();
            payload.companyId = 'ats_freight';

            const docRef = await db.collection('customers').add(payload);

            // Add to local array immediately - REMOVED to prevent duplicates with onSnapshot
            // DataManager.customers.unshift({ id: docRef.id, ...payload });

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

            const index = DataManager.customers.findIndex(c => c.id === customerId);
            if (index !== -1) DataManager.customers[index] = { ...DataManager.customers[index], ...payload };

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
            payload.companyId = 'ats_freight';

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
        try {
            // Get invoice to unlink from loads
            const invoice = await db.collection('invoices').doc(invoiceId).get();
            if (invoice.exists) {
                const invoiceData = invoice.data();
                // Unlink invoice from associated loads
                if (invoiceData.loadIds && invoiceData.loadIds.length > 0) {
                    const batch = db.batch();
                    let validLoads = 0;
                    
                    for (const loadId of invoiceData.loadIds) {
                        try {
                            const loadRef = db.collection('loads').doc(loadId);
                            const loadDoc = await loadRef.get();
                            if (loadDoc.exists) {
                                batch.update(loadRef, { invoiceId: null });
                                validLoads++;
                            } else {
                                console.warn(`Load ${loadId} does not exist, skipping unlink`);
                            }
                        } catch (err) {
                            console.warn(`Error checking load ${loadId}:`, err);
                        }
                    }
                    
                    // Only commit if there are valid loads to update
                    if (validLoads > 0) {
                        await batch.commit();
                    }
                }
            }

            // Delete the invoice
            await db.collection('invoices').doc(invoiceId).delete();
        } catch (e) {
            console.error('Error deleting invoice:', e);
            throw e;
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
            payload.companyId = 'ats_freight';

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
        try {
            // Unlink loads and expenses first - check if they exist before updating
            const settlement = await db.collection('settlements').doc(settlementId).get();
            if (settlement.exists) {
                const data = settlement.data();
                const batch = db.batch();
                let validUpdates = 0;
                
                // Unlink loads
                if (data.loadIds && data.loadIds.length > 0) {
                    for (const loadId of data.loadIds) {
                        try {
                            const loadRef = db.collection('loads').doc(loadId);
                            const loadDoc = await loadRef.get();
                            if (loadDoc.exists) {
                                batch.update(loadRef, { settlementId: null });
                                validUpdates++;
                            } else {
                                console.warn(`Load ${loadId} does not exist, skipping unlink`);
                            }
                        } catch (err) {
                            console.warn(`Error checking load ${loadId}:`, err);
                        }
                    }
                }
                
                // Unlink expenses
                if (data.expenseIds && data.expenseIds.length > 0) {
                    for (const expenseId of data.expenseIds) {
                        try {
                            const expenseRef = db.collection('expenses').doc(expenseId);
                            const expenseDoc = await expenseRef.get();
                            if (expenseDoc.exists) {
                                batch.update(expenseRef, { settlementId: null });
                                validUpdates++;
                            } else {
                                console.warn(`Expense ${expenseId} does not exist, skipping unlink`);
                            }
                        } catch (err) {
                            console.warn(`Error checking expense ${expenseId}:`, err);
                        }
                    }
                }
                
                // Only commit if there are valid updates
                if (validUpdates > 0) {
                    await batch.commit();
                }
            }

            // Delete the settlement
            await db.collection('settlements').doc(settlementId).delete();
        } catch (e) {
            console.error('Error deleting settlement:', e);
            throw e;
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
            payload.companyId = 'ats_freight';

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
        try {
            await db.collection('expenses').doc(expenseId).delete();
            Utils.showNotification('Expense deleted successfully!', 'success');
            // Note: confirmation is handled in expenses.html
        } catch (e) {
            console.error('Error deleting expense:', e);
            Utils.showNotification('Error deleting expense: ' + e.message, 'error');
            throw e;
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
            // Uses improved Utils.calculateDistance with lookup table and coordinate fallback
            const distance = Utils.calculateDistance(origin, destination);

            // Estimate duration (assuming average 55 mph for trucking)
            const hours = Math.round((distance / 55) * 10) / 10;
            const duration = hours < 24 ? `${hours} hours` : `${Math.round(hours / 24 * 10) / 10} days`;

            // Simple state breakdown estimation (can be improved with actual route data)
            const stateBreakdown = {
                'OH': Math.floor(distance * 0.2),
                'IN': Math.floor(distance * 0.15),
                'IL': Math.floor(distance * 0.25),
                'Other': Math.floor(distance * 0.4)
            };

            return {
                distance: distance,
                duration: duration,
                route: `${origin} → ${destination}`,
                stateBreakdown: stateBreakdown
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
            // For now, we'll use Tesseract.js for client-side OCR
            // In production, you can replace this with Google Vision API or AWS Textract
            
            let extractedText = '';
            
            // Check if Tesseract is available (you'll need to include tesseract.js library)
            if (typeof Tesseract !== 'undefined') {
                const { data: { text } } = await Tesseract.recognize(file);
                extractedText = text;
            } else {
                // Fallback: Try to read text from file if it's a text file
                // For images/PDFs, we'll use a mock extraction with common patterns
                extractedText = await this.readFileAsText(file);
            }

            // Parse the extracted text to find load information
            const parsedData = this.parseRateConfirmation(extractedText);

            return {
                text: extractedText,
                confidence: 0.85,
                fields: parsedData
            };
        } catch (error) {
            console.error('Error processing document:', error);
            // Return empty fields if OCR fails
            return {
                text: '',
                confidence: 0,
                fields: {}
            };
        }
    },

    // Read file as text (for text files)
    readFileAsText: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },

    // Parse rate confirmation text to extract structured data
    parseRateConfirmation: (text) => {
        const data = {};
        const upperText = text.toUpperCase();

        // Extract Load Number (common patterns: LOAD #, PRO #, REF #, etc.)
        const loadPatterns = [
            /(?:LOAD|PRO|REF|LOAD\s*#|PRO\s*#|REF\s*#)[\s:]*([A-Z0-9\-]+)/i,
            /LOAD\s*NUMBER[\s:]*([A-Z0-9\-]+)/i,
            /(?:LOAD|PRO)\s*([A-Z0-9\-]{6,})/i
        ];
        for (const pattern of loadPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                data.loadNumber = match[1].trim();
                break;
            }
        }

        // Extract Rate (look for $ amounts, "RATE", "TOTAL", etc.)
        const ratePatterns = [
            /(?:RATE|TOTAL|AMOUNT|PAY)[\s:]*\$?\s*([\d,]+\.?\d*)/i,
            /\$\s*([\d,]+\.?\d*)\s*(?:RATE|TOTAL|AMOUNT)/i,
            /(?:TOTAL\s*RATE|RATE\s*TOTAL)[\s:]*\$?\s*([\d,]+\.?\d*)/i
        ];
        for (const pattern of ratePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                data.rate = parseFloat(match[1].replace(/,/g, ''));
                break;
            }
        }

        // Extract Miles
        const milesPatterns = [
            /(?:MILES|MILEAGE|DISTANCE)[\s:]*([\d,]+)/i,
            /([\d,]+)\s*(?:MILES|MI)/i
        ];
        for (const pattern of milesPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                data.miles = parseInt(match[1].replace(/,/g, ''));
                break;
            }
        }

        // Extract Rate Per Mile
        if (data.rate && data.miles) {
            data.ratePerMile = (data.rate / data.miles).toFixed(2);
        } else {
            const rpmPattern = /(?:RATE\s*PER\s*MILE|PER\s*MILE|RPM)[\s:]*\$?\s*([\d,]+\.?\d*)/i;
            const match = text.match(rpmPattern);
            if (match && match[1]) {
                data.ratePerMile = parseFloat(match[1].replace(/,/g, ''));
            }
        }

        // Extract Shipper/Consignor (common patterns)
        const shipperPatterns = [
            /(?:SHIPPER|CONSIGNOR|FROM)[\s:]*([A-Z][A-Z\s&,\.]+)/i,
            /(?:SHIP\s*FROM|PICKUP\s*FROM)[\s:]*([A-Z][A-Z\s&,\.]+)/i
        ];
        for (const pattern of shipperPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                data.shipper = match[1].trim();
                break;
            }
        }

        // Extract Consignee (common patterns)
        const consigneePatterns = [
            /(?:CONSIGNEE|DELIVER\s*TO|TO)[\s:]*([A-Z][A-Z\s&,\.]+)/i,
            /(?:SHIP\s*TO|DELIVERY\s*TO)[\s:]*([A-Z][A-Z\s&,\.]+)/i
        ];
        for (const pattern of consigneePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                data.consignee = match[1].trim();
                break;
            }
        }

        // Extract Pickup Location (City, State)
        const pickupPatterns = [
            /(?:PICKUP|ORIGIN|FROM)[\s:]*([A-Z][A-Z\s]+),\s*([A-Z]{2})/i,
            /PICKUP[\s:]*([A-Z][A-Z\s]+),\s*([A-Z]{2})/i
        ];
        for (const pattern of pickupPatterns) {
            const match = text.match(pattern);
            if (match && match[1] && match[2]) {
                data.pickupCity = match[1].trim();
                data.pickupState = match[2].trim();
                break;
            }
        }

        // Extract Delivery Location (City, State)
        const deliveryPatterns = [
            /(?:DELIVERY|DESTINATION|TO)[\s:]*([A-Z][A-Z\s]+),\s*([A-Z]{2})/i,
            /DELIVERY[\s:]*([A-Z][A-Z\s]+),\s*([A-Z]{2})/i
        ];
        for (const pattern of deliveryPatterns) {
            const match = text.match(pattern);
            if (match && match[1] && match[2]) {
                data.deliveryCity = match[1].trim();
                data.deliveryState = match[2].trim();
                break;
            }
        }

        // Extract Dates (various formats)
        const datePatterns = [
            /(?:PICKUP|P\/U)\s*DATE[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
            /(?:DELIVERY|DEL)\s*DATE[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
            /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi
        ];
        
        const dates = [];
        for (const pattern of datePatterns) {
            try {
                // Use the pattern directly if it's already a RegExp, otherwise create one
                const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'gi');
                const matches = text.matchAll(regex);
                for (const match of matches) {
                    if (match && match[1]) {
                        dates.push(match[1]);
                    }
                }
            } catch (err) {
                console.warn('Error matching date pattern:', err);
                // Fallback: use simple match
                const simpleMatch = text.match(pattern);
                if (simpleMatch && simpleMatch[1]) {
                    dates.push(simpleMatch[1]);
                }
            }
        }
        
        if (dates.length > 0) {
            data.pickupDate = this.parseDate(dates[0]);
            if (dates.length > 1) {
                data.deliveryDate = this.parseDate(dates[1]);
            }
        }

        // Extract ZIP codes
        const zipPattern = /\b(\d{5}(?:-\d{4})?)\b/g;
        const zips = text.match(zipPattern);
        if (zips && zips.length >= 2) {
            data.pickupZip = zips[0];
            data.deliveryZip = zips[1];
        }

        return data;
    },

    // Parse date string to ISO format
    parseDate: (dateStr) => {
        if (!dateStr) return '';
        
        // Handle various date formats
        const formats = [
            /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/,  // MM/DD/YYYY or M/D/YY
            /(\d{1,2})-(\d{1,2})-(\d{2,4})/     // MM-DD-YYYY
        ];

        for (const format of formats) {
            const match = dateStr.match(format);
            if (match) {
                let month = parseInt(match[1]);
                let day = parseInt(match[2]);
                let year = parseInt(match[3]);
                
                // Handle 2-digit years
                if (year < 100) {
                    year += 2000;
                }
                
                // Format as YYYY-MM-DD
                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }
        
        return dateStr;
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
        if (App.listenersSetup) {
            console.warn('Event listeners already set up, skipping.');
            return;
        }
        App.listenersSetup = true;

        // Phone number formatting
        document.addEventListener('input', (e) => {
            try {
                if (e.target && e.target.type === 'tel') {
                    e.target.value = Utils.formatPhone(e.target.value);
                }
            } catch (err) {
                console.error('Error in phone formatting listener:', err);
            }
        });

        // UNIVERSAL FORM HANDLER — THIS IS THE HOLY GRAIL FIX
        document.addEventListener('submit', async (e) => {
            try {
                const form = e.target;
                if (!(form instanceof HTMLFormElement)) return;

                e.preventDefault(); // Stop page reload

                // Validate form (only checks fields with 'required' attribute)
                const isValid = App.validateForm(form);
                if (!isValid) {
                    console.log('[Form] Validation failed for', form.id);
                    return;
                }

                const handlerName = form.id + '_handler';
                const handler = window[handlerName];

                console.log(`[Form] Submitting ${form.id} → looking for ${handlerName}`, handler ? 'FOUND' : 'NOT FOUND');

                if (typeof handler === 'function') {
                    try {
                        await handler(e);
                    } catch (err) {
                        console.error('[Form Handler Error]', err);
                        Utils.showNotification('Save failed: ' + (err.message || 'Unknown error'), 'error');
                    }
                } else {
                    console.warn(`[Form] No handler found: ${handlerName} — did you forget to define it?`);
                    // Don't show error notification for forms that might not need handlers
                    if (form.id && !form.id.includes('search') && !form.id.includes('filter')) {
                        console.warn(`[Form] Form ${form.id} submitted but no handler found. Form may not work correctly.`);
                    }
                }
            } catch (globalErr) {
                console.error('Critical error in form submit listener:', globalErr);
                Utils.showNotification('Form submission error. Please check console.', 'error');
            }
        }, true); // Use capture phase to ensure we catch it first

        // Auto-save (unchanged)
        let saveTimeout;
        document.addEventListener('input', (e) => {
            try {
                if (e.target && e.target.hasAttribute('data-autosave')) {
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(() => App.autoSave(e.target), 2000);
                }
            } catch (err) {
                console.error('Error in auto-save listener:', err);
            }
        });
    },

    // Validate form
    validateForm: (form) => {
        if (!form) return true; // Skip validation if form doesn't exist
        
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        if (inputs.length === 0) return true; // No required fields, validation passes
        
        let isValid = true;
        const invalidFields = [];

        inputs.forEach(input => {
            // Skip disabled or hidden fields
            if (input.disabled || input.type === 'hidden') return;
            
            const value = input.value ? input.value.trim() : '';
            
            if (!value) {
                input.classList.add('border-red-500');
                isValid = false;
                const label = form.querySelector(`label[for="${input.id}"]`)?.textContent || input.name || input.id;
                invalidFields.push(label);
            } else {
                input.classList.remove('border-red-500');
            }

            // Email validation
            if (input.type === 'email' && value && !Utils.validateEmail(value)) {
                input.classList.add('border-red-500');
                isValid = false;
                invalidFields.push(input.name || input.id + ' (invalid email)');
            }

            // Phone validation
            if (input.type === 'tel' && value && !Utils.validatePhone(value)) {
                input.classList.add('border-red-500');
                isValid = false;
                invalidFields.push(input.name || input.id + ' (invalid phone)');
            }
        });

        if (!isValid) {
            const message = invalidFields.length > 0 
                ? `Please fill in: ${invalidFields.slice(0, 3).join(', ')}${invalidFields.length > 3 ? '...' : ''}`
                : 'Please fill in all required fields correctly';
            Utils.showNotification(message, 'error');
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
    const generateBtn = document.getElementById('generateSettlementBtn');

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
        if (generateBtn) generateBtn.disabled = true;
    } else {
        noLoadsMsg.classList.add('hidden');
        loadsSection.classList.remove('hidden');

        // Only update badge if it exists
        const loadCountBadge = document.getElementById('loadCountBadge');
        if (loadCountBadge) {
            loadCountBadge.textContent = `${eligibleLoads.length} found`;
        }

        // 3. Populate Table
        eligibleLoads.forEach(loadRef => {
            // Get fresh load data from DataManager to ensure we have all properties
            const load = DataManager.loads.find(l => l.id === loadRef.id) || loadRef;

            // Calculate Driver Pay based on their profile
            const driver = DataManager.drivers.find(d => d.id === driverId);
            let payAmount = 0;

            console.log('=== LOAD CALCULATION DEBUG ===');
            console.log('Load:', load.loadNumber);
            console.log('Driver:', driver?.firstName, driver?.lastName);
            console.log('Payment Type:', driver?.payment?.type);

            if (driver?.payment?.type === 'percentage') {
                // Robust percentage parsing
                const totalRate = parseFloat(load.rate?.total) || 0;
                // Check both percentage and rate properties
                const rawValue = driver.payment.percentage || driver.payment.rate;
                let percentage = 0;

                console.log('Raw load.rate:', load.rate);
                console.log('load.rate.total:', load.rate?.total);
                console.log('Parsed totalRate:', totalRate);
                console.log('Raw percentage value:', rawValue);
                console.log('Type of raw percentage:', typeof rawValue);

                if (typeof rawValue === 'string' && rawValue.includes('%')) {
                    // Handle "40%" format
                    percentage = parseFloat(rawValue.replace('%', '')) / 100;
                    console.log('String with % - percentage:', percentage);
                } else {
                    // Handle numeric values (40 or 0.40)
                    const numValue = parseFloat(rawValue);
                    // If value is > 1, assume it's a percentage (e.g., 40 means 40%)
                    percentage = numValue > 1 ? numValue / 100 : numValue;
                    console.log('Numeric value - numValue:', numValue, 'percentage:', percentage);
                }

                payAmount = totalRate * percentage;
                console.log(`Final Calculation: $${totalRate} × ${percentage} = $${payAmount}`);
            } else {
                // Default to Per Mile
                const miles = parseFloat(load.mileage?.total || load.totalMiles || 0);
                const rate = parseFloat(driver?.payment?.perMileRate || 0);
                payAmount = miles * rate;
                console.log(`Per Mile: ${miles} miles × $${rate} = $${payAmount}`);
            }

            // Add detention pay to gross pay (check multiple possible locations)
            const detentionPay = parseFloat(
                load.financials?.detentionPay || 
                load.rate?.detentionPay || 
                load.detentionPay || 
                0
            );
            const grossPay = payAmount + detentionPay;

            // Track deductions (check multiple possible locations)
            const advanceAmount = parseFloat(
                load.financials?.advanceAmount || 
                load.rate?.advance || 
                load.advanceAmount || 
                0
            );
            const lumperFees = parseFloat(
                load.financials?.lumperFees || 
                load.rate?.lumperFees || 
                load.lumperFees || 
                0
            );

            console.log(`Detention Pay: $${detentionPay}`);
            console.log(`Advance Amount: $${advanceAmount}`);
            console.log(`Lumper Fees: $${lumperFees}`);
            console.log(`Gross Pay (Base + Detention): $${grossPay}`);

            const tr = document.createElement('tr');
            tr.className = "hover:bg-blue-50 transition-colors";
            tr.innerHTML = `
                <td class="px-4 py-3"><input type="checkbox" class="settlement-checkbox w-4 h-4 text-blue-600 rounded" 
                    value="${load.id}" 
                    data-pay="${grossPay.toFixed(2)}"
                    data-base-pay="${payAmount.toFixed(2)}"
                    data-detention="${detentionPay.toFixed(2)}"
                    data-advance="${advanceAmount.toFixed(2)}"
                    data-lumper="${lumperFees.toFixed(2)}"
                    data-miles="${load.mileage?.total || load.totalMiles || 0}"
                    onchange="calculateSettlementTotal(); if (window.autoSelectExpensesForLoad) autoSelectExpensesForLoad('${load.id}')"></td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">${load.loadNumber}</td>
                <td class="px-4 py-3 text-sm text-gray-500">${Utils.formatDate(load.delivery?.date || load.updatedAt)}</td>
                <td class="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">${load.pickup?.city} → ${load.delivery?.city}</td>
                <td class="px-4 py-3 text-sm font-bold text-gray-900 text-right">${Utils.formatCurrency(grossPay)}</td>
            `;
            tbody.appendChild(tr);
        });
    }
    calculateSettlementTotal();
}

// Load driver expenses for settlement - with automatic load matching
function loadDriverExpenses() {
    const driverId = document.getElementById('driverSelect')?.value;
    const expensesBody = document.getElementById('driverExpensesBody');
    
    if (!expensesBody) return;
    
    // Reset
    expensesBody.innerHTML = '';
    
    if (!driverId) {
        expensesBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-4 py-3 text-sm text-gray-500 text-center">
                    Select a driver to see expenses
                </td>
            </tr>
        `;
        return;
    }
    
    // Get driver to find associated trucks
    const driver = DataManager.drivers.find(d => d.id === driverId);
    if (!driver) {
        expensesBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-4 py-3 text-sm text-gray-500 text-center">
                    Driver not found
                </td>
            </tr>
        `;
        return;
    }
    
    // Get all loads for this driver (including unpaid delivered loads)
    const driverLoads = DataManager.loads.filter(l => {
        const isDriverMatch = String(l.driverId) === String(driverId);
        const status = (l.status || '').toLowerCase();
        const isDelivered = status === 'delivered' || status === 'completed';
        const isUnpaid = !l.settlementId || l.settlementId === 'null' || l.settlementId === 'undefined';
        return isDriverMatch && isDelivered && isUnpaid;
    });
    
    const truckIds = [...new Set(driverLoads.map(l => l.truckId).filter(Boolean))];
    
    // Find expenses for this driver (and optionally trucks they used)
    // Filter expenses that:
    // 1. Are assigned to this driver (driverId matches)
    // 2. OR are assigned to trucks this driver used (truckId matches)
    // 3. Are not already included in a settlement (settlementId is null/undefined)
    const eligibleExpenses = DataManager.expenses.filter(e => {
        const isDriverMatch = e.driverId === driverId;
        const isTruckMatch = e.truckId && truckIds.includes(e.truckId);
        const isUnsettled = !e.settlementId || e.settlementId === 'null' || e.settlementId === 'undefined';
        
        return (isDriverMatch || isTruckMatch) && isUnsettled;
    });
    
    console.log(`Found ${eligibleExpenses.length} eligible expenses for driver ${driverId}`);
    
    if (eligibleExpenses.length === 0) {
        expensesBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-4 py-3 text-sm text-gray-500 text-center">
                    No expenses found for this driver
                </td>
            </tr>
        `;
    } else {
        // Match expenses to loads based on dates
        const expenseLoadMap = new Map(); // expenseId -> loadId
        
        eligibleExpenses.forEach(expense => {
            const expenseDate = new Date(expense.date || expense.createdAt);
            expenseDate.setHours(0, 0, 0, 0);
            
            // First, check if expense already has a loadId
            if (expense.loadId) {
                const load = driverLoads.find(l => l.id === expense.loadId);
                if (load) {
                    expenseLoadMap.set(expense.id, expense.loadId);
                    return;
                }
            }
            
            // Otherwise, try to match by date
            // Match if expense date is between load pickup and delivery dates
            for (const load of driverLoads) {
                const pickupDate = load.pickup?.scheduledDate || load.pickup?.date || load.createdAt;
                const deliveryDate = load.delivery?.date || load.deliveredAt || load.updatedAt;
                
                if (pickupDate && deliveryDate) {
                    const pickup = new Date(pickupDate);
                    const delivery = new Date(deliveryDate);
                    pickup.setHours(0, 0, 0, 0);
                    delivery.setHours(23, 59, 59, 999);
                    
                    // Also check if expense is within 2 days before pickup or 2 days after delivery
                    // (to catch fuel purchased before trip, or expenses after delivery)
                    const pickupWindow = new Date(pickup);
                    pickupWindow.setDate(pickupWindow.getDate() - 2);
                    const deliveryWindow = new Date(delivery);
                    deliveryWindow.setDate(deliveryWindow.getDate() + 2);
                    
                    if (expenseDate >= pickupWindow && expenseDate <= deliveryWindow) {
                        expenseLoadMap.set(expense.id, load.id);
                        break; // Match to first load that fits
                    }
                }
            }
        });
        
        // Group expenses by load
        const expensesByLoad = new Map();
        const unlinkedExpenses = [];
        
        eligibleExpenses.forEach(expense => {
            const loadId = expenseLoadMap.get(expense.id);
            if (loadId) {
                if (!expensesByLoad.has(loadId)) {
                    expensesByLoad.set(loadId, []);
                }
                expensesByLoad.get(loadId).push(expense);
            } else {
                unlinkedExpenses.push(expense);
            }
        });
        
        // Sort expenses within each group by date
        expensesByLoad.forEach((expenses, loadId) => {
            expenses.sort((a, b) => {
                const dateA = new Date(a.date || a.createdAt || 0);
                const dateB = new Date(b.date || b.createdAt || 0);
                return dateA - dateB;
            });
        });
        
        // Sort unlinked expenses by date
        unlinkedExpenses.sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt || 0);
            const dateB = new Date(b.date || b.createdAt || 0);
            return dateA - dateB;
        });
        
        // Display expenses grouped by load
        expensesByLoad.forEach((expenses, loadId) => {
            const load = driverLoads.find(l => l.id === loadId);
            const loadNumber = load?.loadNumber || 'Unknown Load';
            const loadPickup = load?.pickup?.city || '';
            const loadDelivery = load?.delivery?.city || '';
            
            // Add header row for this load's expenses
            const headerRow = document.createElement('tr');
            headerRow.className = "bg-blue-50 font-semibold";
            headerRow.innerHTML = `
                <td colspan="6" class="px-3 py-2 text-xs text-blue-800">
                    <i class="fas fa-truck mr-2"></i>Load: ${loadNumber} (${loadPickup} → ${loadDelivery})
                </td>
            `;
            expensesBody.appendChild(headerRow);
            
            // Add expense rows for this load
            expenses.forEach(expense => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-blue-50 transition-colors";
                tr.setAttribute('data-load-id', loadId);
                
                const expenseDate = expense.date || expense.createdAt;
                const expenseType = expense.type || 'other';
                const expenseAmount = parseFloat(expense.amount || 0);
                const vendorName = expense.vendor?.name || '';
                const description = expense.description || expense.subcategory || expenseType;
                
                tr.innerHTML = `
                    <td class="px-3 py-2">
                        <input type="checkbox" class="expense-checkbox w-4 h-4 text-blue-600 rounded" 
                            value="${expense.id}" 
                            data-amount="${expenseAmount.toFixed(2)}"
                            data-load-id="${loadId}"
                            onchange="calculateSettlementTotal(); syncExpenseWithLoad('${expense.id}', '${loadId}')">
                    </td>
                    <td class="px-3 py-2 text-sm text-gray-600">${Utils.formatDate(expenseDate)}</td>
                    <td class="px-3 py-2 text-sm text-gray-900 capitalize">${expenseType.replace('_', ' ')}</td>
                    <td class="px-3 py-2 text-sm text-gray-700">${description}${vendorName ? ` - ${vendorName}` : ''}</td>
                    <td class="px-3 py-2 text-sm text-blue-600 font-medium">${loadNumber}</td>
                    <td class="px-3 py-2 text-sm font-medium text-red-600 text-right">${Utils.formatCurrency(expenseAmount)}</td>
                `;
                expensesBody.appendChild(tr);
            });
        });
        
        // Display unlinked expenses (if any)
        if (unlinkedExpenses.length > 0) {
            const headerRow = document.createElement('tr');
            headerRow.className = "bg-gray-50 font-semibold";
            headerRow.innerHTML = `
                <td colspan="6" class="px-3 py-2 text-xs text-gray-600">
                    <i class="fas fa-question-circle mr-2"></i>Unlinked Expenses (No matching load found)
                </td>
            `;
            expensesBody.appendChild(headerRow);
            
            unlinkedExpenses.forEach(expense => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-gray-50 transition-colors";
                
                const expenseDate = expense.date || expense.createdAt;
                const expenseType = expense.type || 'other';
                const expenseAmount = parseFloat(expense.amount || 0);
                const vendorName = expense.vendor?.name || '';
                const description = expense.description || expense.subcategory || expenseType;
                
                tr.innerHTML = `
                    <td class="px-3 py-2">
                        <input type="checkbox" class="expense-checkbox w-4 h-4 text-blue-600 rounded" 
                            value="${expense.id}" 
                            data-amount="${expenseAmount.toFixed(2)}"
                            onchange="calculateSettlementTotal()">
                    </td>
                    <td class="px-3 py-2 text-sm text-gray-600">${Utils.formatDate(expenseDate)}</td>
                    <td class="px-3 py-2 text-sm text-gray-900 capitalize">${expenseType.replace('_', ' ')}</td>
                    <td class="px-3 py-2 text-sm text-gray-700">${description}${vendorName ? ` - ${vendorName}` : ''}</td>
                    <td class="px-3 py-2 text-sm text-gray-400">-</td>
                    <td class="px-3 py-2 text-sm font-medium text-red-600 text-right">${Utils.formatCurrency(expenseAmount)}</td>
                `;
                expensesBody.appendChild(tr);
            });
        }
    }
    
    calculateSettlementTotal();
}

// Sync expense selection with load selection
function syncExpenseWithLoad(expenseId, loadId) {
    // When an expense is checked, automatically check its associated load
    const loadCheckbox = document.querySelector(`.settlement-checkbox[value="${loadId}"]`);
    const expenseCheckbox = document.querySelector(`.expense-checkbox[value="${expenseId}"]`);
    
    if (expenseCheckbox && expenseCheckbox.checked && loadCheckbox && !loadCheckbox.checked) {
        loadCheckbox.checked = true;
        calculateSettlementTotal();
    }
}

// Auto-select expenses when a load is selected
function autoSelectExpensesForLoad(loadId) {
    const loadCheckbox = document.querySelector(`.settlement-checkbox[value="${loadId}"]`);
    if (!loadCheckbox) return;
    
    // Find all expenses linked to this load
    const expenseCheckboxes = document.querySelectorAll(`.expense-checkbox[data-load-id="${loadId}"]`);
    
    expenseCheckboxes.forEach(expenseCheckbox => {
        // If load is checked, check the expense. If load is unchecked, uncheck the expense.
        expenseCheckbox.checked = loadCheckbox.checked;
    });
    
    calculateSettlementTotal();
}

// 2. Updated Calculation Logic (Updates the totals in real-time)
function calculateSettlementTotal() {
    const checkboxes = document.querySelectorAll('.settlement-checkbox:checked');
    const expenseCheckboxes = document.querySelectorAll('.expense-checkbox:checked');
    const generateBtn = document.getElementById('generateSettlementBtn');

    let basePay = 0;
    let detentionTotal = 0;
    let advancesTotal = 0;
    let lumperTotal = 0;

    checkboxes.forEach(cb => {
        basePay += parseFloat(cb.dataset.basePay || 0);
        detentionTotal += parseFloat(cb.dataset.detention || 0);
        advancesTotal += parseFloat(cb.dataset.advance || 0);
        lumperTotal += parseFloat(cb.dataset.lumper || 0);
    });

    // Calculate expenses total
    let expensesTotal = 0;
    expenseCheckboxes.forEach(cb => {
        expensesTotal += parseFloat(cb.dataset.amount || 0);
    });

    // Gross pay = base + detention
    const grossPay = basePay + detentionTotal;

    // Manual deductions (fuel, insurance, other)
    const fuel = parseFloat(document.getElementById('fuelDeduction')?.value) || 0;
    let insurance = parseFloat(document.getElementById('insuranceDeduction')?.value) || 0;
    const other = parseFloat(document.getElementById('otherDeduction')?.value) || 0;

    // Calculate tax deductions based on driver type
    const driverId = document.getElementById('driverSelect')?.value;
    const driver = driverId ? DataManager.drivers.find(d => d.id === driverId) : null;
    const isOwnerOperator = driver?.payment?.type === 'percentage' || driver?.payment?.type === 'owner_operator';
    
    // Auto-populate insurance if not set (only for company drivers)
    if (!insurance && !isOwnerOperator && driver) {
        insurance = 45.00; // Default insurance for company drivers
        const insuranceField = document.getElementById('insuranceDeduction');
        if (insuranceField && !insuranceField.value) {
            insuranceField.value = insurance.toFixed(2);
        }
    }

    // Tax calculations (only for company drivers, not owner operators)
    const taxes = {
        federal: isOwnerOperator ? 0 : grossPay * 0.075, // 7.5% federal tax
        state: isOwnerOperator ? 0 : grossPay * 0.02,     // 2% state tax
        socialSecurity: isOwnerOperator ? 0 : grossPay * 0.062, // 6.2% social security
        medicare: isOwnerOperator ? 0 : grossPay * 0.0145  // 1.45% medicare
    };
    
    const totalTaxes = Object.values(taxes).reduce((sum, tax) => sum + tax, 0);

    // Total deductions = load deductions + expenses + manual deductions + taxes
    const totalDeductions = advancesTotal + lumperTotal + expensesTotal + fuel + insurance + other + totalTaxes;
    const netPay = grossPay - totalDeductions;
    
    // Update expenses total display
    const expensesTotalEl = document.getElementById('expensesTotal');
    if (expensesTotalEl) {
        expensesTotalEl.textContent = Utils.formatCurrency(expensesTotal);
    }

    // Update breakdown fields (if they exist - for settlements.html modal)
    const basePayEl = document.getElementById('basePay');
    const detentionPayEl = document.getElementById('detentionPay');
    const advancesTotalEl = document.getElementById('advancesTotal');
    const lumperTotalEl = document.getElementById('lumperTotal');

    if (basePayEl) basePayEl.textContent = Utils.formatCurrency(basePay);
    if (detentionPayEl) detentionPayEl.textContent = Utils.formatCurrency(detentionTotal);
    if (advancesTotalEl) advancesTotalEl.textContent = Utils.formatCurrency(advancesTotal);
    if (lumperTotalEl) lumperTotalEl.textContent = Utils.formatCurrency(lumperTotal);

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

// Toggle All Expenses Helper
function toggleAllExpenses(source) {
    const checkboxes = document.querySelectorAll('.expense-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = source.checked;
    });
    calculateSettlementTotal();
}

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
window.loadDriverExpenses = loadDriverExpenses;
window.calculateSettlementTotal = calculateSettlementTotal;
window.toggleAllLoads = toggleAllLoads;
window.toggleAllExpenses = toggleAllExpenses;
window.autoSelectExpensesForLoad = autoSelectExpensesForLoad;
window.syncExpenseWithLoad = syncExpenseWithLoad;
window.checkExpirations = checkExpirations;
window.openCreateSettlementModal = () => {
    document.getElementById('createSettlementModal')?.classList.add('show');
    setTimeout(() => loadDriverUnpaidLoads(), 100); // auto-load on open
};

// Explicitly export services to window for inline scripts
window.CONFIG = CONFIG;
window.Utils = Utils;
window.Auth = Auth;
window.DataManager = DataManager;
window.MapsAPI = MapsAPI;
window.OCRService = OCRService;
window.PDFService = PDFService;
window.IFTACalculator = IFTACalculator;
window.SettlementCalculator = SettlementCalculator;
window.Analytics = Analytics;
window.App = App;
window.CompanySettings = CompanySettings;

// CRITICAL GLOBAL EXPORTS FOR SETTLEMENTS
// Note: These functions are defined in settlements.html
// We're just declaring them here so they can be called from inline onclick handlers
if (typeof syncAllDeliveredLoads !== 'undefined') {
    window.syncAllDeliveredLoads = syncAllDeliveredLoads;
}
if (typeof openGenerateSettlementModal !== 'undefined') {
    window.openGenerateSettlementModal = openGenerateSettlementModal;
}