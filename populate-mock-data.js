// Mock Data Population Script for ATS FREIGHT LLC TMS
// Run this script in the browser console after the page loads

async function populateMockData() {
    // Confirm before proceeding
    const confirmed = confirm(
        'This will populate your database with mock data:\n\n' +
        '• 4 Customers\n' +
        '• 4 Trucks\n' +
        '• 4 Drivers\n' +
        '• 4 Loads (all delivered)\n' +
        '• 14 Expenses\n\n' +
        'This may take 30-60 seconds. Continue?'
    );
    
    if (!confirmed) {
        console.log('Mock data population cancelled');
        return;
    }
    
    console.log('🚀 Starting mock data population...');
    Utils.showNotification('Starting mock data population...', 'info');
    
    if (!DataManager.initialized) {
        await DataManager.init();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for data to load
    }
    
    try {
        // ============================================
        // COMMAND 1: Create 4 Customers
        // ============================================
        console.log('\n📋 Creating customers...');
        
        const customers = [
            {
                customerNumber: 'CUST-1001',
                company: {
                    name: 'Midwest Distribution LLC',
                    ein: '31-1234567',
                    address: '445 Industrial Pkwy',
                    city: 'Nashville',
                    state: 'TN',
                    zip: '37211',
                    phone: '(615) 555-7700',
                    email: 'dispatch@midwestdist.com'
                },
                contact: {
                    name: 'Robert Mitchell',
                    title: 'Logistics Manager',
                    phone: '(615) 555-7701',
                    email: 'robert.m@midwestdist.com'
                },
                paymentTerms: 30,
                billingEmail: 'billing@midwestdist.com'
            },
            {
                customerNumber: 'CUST-1002',
                company: {
                    name: 'Great Lakes Logistics Inc',
                    ein: '38-9876543',
                    address: '8900 W Bryn Mawr Ave',
                    city: 'Chicago',
                    state: 'IL',
                    zip: '60631',
                    phone: '(773) 555-4400',
                    email: 'orders@greatlakeslog.com'
                },
                contact: {
                    name: 'Jennifer Patterson',
                    title: 'Operations Director',
                    phone: '(773) 555-4401',
                    email: 'jen.patterson@greatlakeslog.com'
                },
                paymentTerms: 30,
                billingEmail: 'ap@greatlakeslog.com'
            },
            {
                customerNumber: 'CUST-1003',
                company: {
                    name: 'Southern Transport Services',
                    ein: '62-5544332',
                    address: '1201 Peachtree St NE',
                    city: 'Atlanta',
                    state: 'GA',
                    zip: '30309',
                    phone: '(404) 555-8800',
                    email: 'shipping@southerntransport.com'
                },
                contact: {
                    name: 'David Thompson',
                    title: 'Transportation Coordinator',
                    phone: '(404) 555-8801',
                    email: 'd.thompson@southerntransport.com'
                },
                paymentTerms: 45,
                billingEmail: 'accounts@southerntransport.com'
            },
            {
                customerNumber: 'CUST-1004',
                company: {
                    name: 'Northeast Freight Solutions',
                    ein: '22-7788990',
                    address: '750 Lexington Ave',
                    city: 'New York',
                    state: 'NY',
                    zip: '10022',
                    phone: '(212) 555-2200',
                    email: 'dispatch@nefreight.com'
                },
                contact: {
                    name: 'Maria Rodriguez',
                    title: 'Freight Manager',
                    phone: '(212) 555-2201',
                    email: 'maria.r@nefreight.com'
                },
                paymentTerms: 30,
                billingEmail: 'invoices@nefreight.com'
            }
        ];
        
        const customerIds = [];
        for (const customer of customers) {
            const id = await DataManager.addCustomer(customer);
            customerIds.push(id);
            console.log(`✅ Created customer: ${customer.company.name}`);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // ============================================
        // COMMAND 2: Create 4 Trucks
        // ============================================
        console.log('\n🚛 Creating trucks...');
        
        const trucks = [
            {
                number: 'lii',
                nickname: 'lii Truck - Freightliner',
                make: 'Freightliner',
                model: 'Cascadia',
                year: 2022,
                vin: '1FUJGHDV8NLBC1234',
                licensePlate: 'OH-TRK-789',
                ownership: 'owned',
                status: 'active',
                insurancePaidBy: 'company',
                monthlyInsuranceCost: 550,
                registrationExpiry: '2026-08-31',
                currentMileage: 125000
            },
            {
                number: 'OP',
                nickname: 'OP - Peterbilt',
                make: 'Peterbilt',
                model: '579',
                year: 2021,
                vin: '1XPWD40X1ED215678',
                licensePlate: 'OH-OO-445',
                ownership: 'owner_operator',
                status: 'active',
                insurancePaidBy: 'owner_operator',
                currentMileage: 98000
            },
            {
                number: 'T1',
                nickname: 'Truck 1 - Volvo',
                make: 'Volvo',
                model: 'VNL 760',
                year: 2020,
                vin: '4V4NC9EH5LN123456',
                licensePlate: 'OH-COM-101',
                ownership: 'owned',
                status: 'active',
                insurancePaidBy: 'company',
                monthlyInsuranceCost: 500,
                registrationExpiry: '2026-06-30',
                currentMileage: 145000
            },
            {
                number: 'T2',
                nickname: 'Truck 2 - International',
                make: 'International',
                model: 'LT Series',
                year: 2021,
                vin: '1HSDJAAN4LH654321',
                licensePlate: 'OH-COM-102',
                ownership: 'owned',
                status: 'active',
                insurancePaidBy: 'company',
                monthlyInsuranceCost: 520,
                registrationExpiry: '2026-06-30',
                currentMileage: 110000
            }
        ];
        
        const truckIds = [];
        for (const truck of trucks) {
            const id = await DataManager.addTruck(truck);
            truckIds.push(id);
            console.log(`✅ Created truck: ${truck.number}`);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Wait for trucks to be fully created
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // ============================================
        // COMMAND 3: Create 4 Drivers
        // ============================================
        console.log('\n👤 Creating drivers...');
        
        const drivers = [
            {
                driverNumber: 'DRV-1001',
                firstName: 'Liban',
                lastName: 'Ali',
                driverType: 'owner',
                payPercentage: 0.65, // 65% as decimal - individual rate
                phone: '(614) 254-0380',
                email: 'liban@atsfreight.com',
                address: '3191 Morse Rd STE 15',
                city: 'Columbus',
                state: 'OH',
                zip: '43231',
                license: {
                    number: 'OH-DL-987654',
                    state: 'OH',
                    expiration: '2027-12-31',
                    class: 'CDL-A'
                },
                medicalExpirationDate: '2026-06-30',
                status: 'active',
                payment: {
                    type: 'percentage'
                }
            },
            {
                driverNumber: 'DRV-1002',
                firstName: 'Ahmed',
                lastName: 'Hassan',
                driverType: 'owner_operator',
                payPercentage: 0.88, // 88% as decimal
                phone: '(614) 555-0101',
                email: 'ahmed.hassan@gmail.com',
                address: '1245 Kenny Rd',
                city: 'Columbus',
                state: 'OH',
                zip: '43212',
                license: {
                    number: 'OH-DL-445566',
                    state: 'OH',
                    expiration: '2028-03-15',
                    class: 'CDL-A'
                },
                medicalExpirationDate: '2026-09-20',
                status: 'active',
                payment: {
                    type: 'percentage'
                },
                deductionPreferences: {
                    fuel: true,
                    insurance: false,
                    maintenance: false,
                    other: false
                }
            },
            {
                driverNumber: 'DRV-1003',
                firstName: 'Marcus',
                lastName: 'Johnson',
                driverType: 'company',
                payPercentage: 0.68, // 68% as decimal - individual rate
                phone: '(614) 555-0202',
                email: 'marcus.j@atsfreight.com',
                address: '890 Livingston Ave',
                city: 'Columbus',
                state: 'OH',
                zip: '43205',
                license: {
                    number: 'OH-DL-778899',
                    state: 'OH',
                    expiration: '2027-08-20',
                    class: 'CDL-A'
                },
                medicalExpirationDate: '2026-04-15',
                status: 'active',
                payment: {
                    type: 'percentage'
                }
            },
            {
                driverNumber: 'DRV-1004',
                firstName: 'Sarah',
                lastName: 'Williams',
                driverType: 'company',
                payPercentage: 0.72, // 72% as decimal - individual rate
                phone: '(614) 555-0303',
                email: 'sarah.w@atsfreight.com',
                address: '2340 Sullivant Ave',
                city: 'Columbus',
                state: 'OH',
                zip: '43204',
                license: {
                    number: 'OH-DL-334455',
                    state: 'OH',
                    expiration: '2028-01-10',
                    class: 'CDL-A'
                },
                medicalExpirationDate: '2026-11-30',
                status: 'active',
                payment: {
                    type: 'percentage'
                }
            }
        ];
        
        const driverIds = [];
        for (const driver of drivers) {
            const id = await DataManager.addDriver(driver);
            driverIds.push(id);
            console.log(`✅ Created driver: ${driver.firstName} ${driver.lastName}`);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Wait for drivers to be fully created
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // ============================================
        // COMMAND 4: Create 4 Loads (All Delivered)
        // ============================================
        console.log('\n📦 Creating loads...');
        
        const loads = [
            {
                loadNumber: 'LD-1001',
                customerId: customerIds[0],
                customerName: 'Midwest Distribution LLC',
                status: 'delivered',
                pickup: {
                    company: 'ABC Manufacturing',
                    address: '2500 Greentree Rd',
                    city: 'Nashville',
                    state: 'TN',
                    zip: '37211',
                    date: '2025-11-20',
                    time: '08:00',
                    contact: {
                        name: 'John Smith',
                        phone: '(615) 555-1100'
                    }
                },
                delivery: {
                    company: 'XYZ Warehouse',
                    address: '5800 Commerce Pkwy',
                    city: 'Columbus',
                    state: 'OH',
                    zip: '43231',
                    date: '2025-11-21',
                    time: '14:00',
                    contact: {
                        name: 'Lisa Brown',
                        phone: '(614) 555-3300'
                    }
                },
                cargo: {
                    type: 'Electronics',
                    weight: 40000,
                    pieces: 24,
                    description: 'Palletized electronics - Handle with care'
                },
                rate: {
                    total: 2800,
                    base: 2800,
                    fuelSurcharge: 0,
                    detentionPay: 0
                },
                mileage: {
                    total: 302,
                    loaded: 302,
                    empty: 0
                },
                deliveredAt: '2025-11-21T14:30:00Z'
            },
            {
                loadNumber: 'LD-1002',
                customerId: customerIds[1],
                customerName: 'Great Lakes Logistics Inc',
                status: 'delivered',
                pickup: {
                    company: 'Midwest Steel Supply',
                    address: '3400 S Ashland Ave',
                    city: 'Chicago',
                    state: 'IL',
                    zip: '60608',
                    date: '2025-11-18',
                    time: '10:00',
                    contact: {
                        name: 'Tom Anderson',
                        phone: '(773) 555-9900'
                    }
                },
                delivery: {
                    company: 'Detroit Manufacturing',
                    address: '12000 E Jefferson Ave',
                    city: 'Detroit',
                    state: 'MI',
                    zip: '48214',
                    date: '2025-11-19',
                    time: '08:00',
                    contact: {
                        name: 'Karen White',
                        phone: '(313) 555-7700'
                    }
                },
                cargo: {
                    type: 'Steel Coils',
                    weight: 44000,
                    pieces: 18,
                    description: 'Steel coils - Secure properly, tarped'
                },
                rate: {
                    total: 3200,
                    base: 3200,
                    fuelSurcharge: 0,
                    detentionPay: 0
                },
                mileage: {
                    total: 283,
                    loaded: 283,
                    empty: 0
                },
                deliveredAt: '2025-11-19T08:45:00Z'
            },
            {
                loadNumber: 'LD-1003',
                customerId: customerIds[2],
                customerName: 'Southern Transport Services',
                status: 'delivered',
                pickup: {
                    company: 'Georgia Food Distributors',
                    address: '2900 Crown Rd SW',
                    city: 'Atlanta',
                    state: 'GA',
                    zip: '30331',
                    date: '2025-11-14',
                    time: '06:00',
                    contact: {
                        name: 'Mike Davis',
                        phone: '(404) 555-4400'
                    }
                },
                delivery: {
                    company: 'Ohio Fresh Markets',
                    address: '4500 Kenny Rd',
                    city: 'Columbus',
                    state: 'OH',
                    zip: '43220',
                    date: '2025-11-15',
                    time: '16:00',
                    contact: {
                        name: 'Susan Miller',
                        phone: '(614) 555-8800'
                    }
                },
                cargo: {
                    type: 'Refrigerated Food',
                    weight: 38000,
                    pieces: 32,
                    description: 'Temperature controlled - Keep at 38°F'
                },
                rate: {
                    total: 3500,
                    base: 3500,
                    fuelSurcharge: 0,
                    detentionPay: 0
                },
                mileage: {
                    total: 435,
                    loaded: 435,
                    empty: 0
                },
                deliveredAt: '2025-11-15T15:30:00Z'
            },
            {
                loadNumber: 'LD-1004',
                customerId: customerIds[3],
                customerName: 'Northeast Freight Solutions',
                status: 'delivered',
                pickup: {
                    company: 'Empire State Packaging',
                    address: '250 Hudson St',
                    city: 'New York',
                    state: 'NY',
                    zip: '10013',
                    date: '2025-11-16',
                    time: '12:00',
                    contact: {
                        name: 'James Chen',
                        phone: '(212) 555-6600'
                    }
                },
                delivery: {
                    company: 'Buckeye Distribution Center',
                    address: '1850 McKinley Ave',
                    city: 'Columbus',
                    state: 'OH',
                    zip: '43222',
                    date: '2025-11-17',
                    time: '10:00',
                    contact: {
                        name: 'Patricia Garcia',
                        phone: '(614) 555-2200'
                    }
                },
                cargo: {
                    type: 'Retail Merchandise',
                    weight: 35000,
                    pieces: 28,
                    description: 'Mixed retail goods - General freight'
                },
                rate: {
                    total: 4100,
                    base: 4100,
                    fuelSurcharge: 0,
                    detentionPay: 0
                },
                mileage: {
                    total: 534,
                    loaded: 534,
                    empty: 0
                },
                deliveredAt: '2025-11-17T09:45:00Z'
            }
        ];
        
        // Wait a bit for drivers to sync
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh driver list
        const allDrivers = DataManager.drivers;
        const allTrucks = DataManager.trucks;
        
        // Assign drivers and trucks to loads
        const libanDriver = allDrivers.find(d => d.firstName === 'Liban' && d.lastName === 'Ali');
        const ahmedDriver = allDrivers.find(d => d.firstName === 'Ahmed' && d.lastName === 'Hassan');
        const marcusDriver = allDrivers.find(d => d.firstName === 'Marcus' && d.lastName === 'Johnson');
        const sarahDriver = allDrivers.find(d => d.firstName === 'Sarah' && d.lastName === 'Williams');
        
        loads[0].driverId = libanDriver ? libanDriver.id : null;
        loads[0].truckId = allTrucks.find(t => t.number === 'lii')?.id || null;
        
        loads[1].driverId = ahmedDriver ? ahmedDriver.id : null;
        loads[1].truckId = allTrucks.find(t => t.number === 'OP')?.id || null;
        
        loads[2].driverId = marcusDriver ? marcusDriver.id : null;
        loads[2].truckId = allTrucks.find(t => t.number === 'T1')?.id || null;
        
        loads[3].driverId = sarahDriver ? sarahDriver.id : null;
        loads[3].truckId = allTrucks.find(t => t.number === 'T2')?.id || null;
        
        const loadIds = [];
        for (const load of loads) {
            const id = await DataManager.addLoad(load);
            loadIds.push(id);
            console.log(`✅ Created load: ${load.loadNumber}`);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Wait for loads to be fully created
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // ============================================
        // COMMAND 5: Create 14 Expenses
        // ============================================
        console.log('\n💰 Creating expenses...');
        
        // Wait for loads to sync
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const allLoads = DataManager.loads;
        const getLoadIdByNumber = (loadNumber) => {
            const load = allLoads.find(l => l.loadNumber === loadNumber);
            return load ? load.id : null;
        };
        
        const getDriverIdByName = (firstName, lastName) => {
            const driver = allDrivers.find(d => d.firstName === firstName && d.lastName === lastName);
            return driver ? driver.id : null;
        };
        
        const getTruckIdByNumber = (truckNumber) => {
            const truck = allTrucks.find(t => t.number === truckNumber);
            return truck ? truck.id : null;
        };
        
        const expenses = [
            {
                type: 'fuel',
                category: 'fuel',
                description: 'Fuel for Nashville to Columbus',
                amount: 350,
                date: '2025-11-20',
                driverId: getDriverIdByName('Liban', 'Ali'),
                driverName: 'Liban Ali',
                truckId: getTruckIdByNumber('lii'),
                truckNumber: 'lii',
                loadId: getLoadIdByNumber('LD-1001'),
                vendor: {
                    name: 'Pilot Flying J - Nashville, TN'
                },
                paidBy: 'company'
            },
            {
                type: 'toll',
                category: 'toll',
                description: 'Highway tolls',
                amount: 45,
                date: '2025-11-20',
                driverId: getDriverIdByName('Liban', 'Ali'),
                driverName: 'Liban Ali',
                truckId: getTruckIdByNumber('lii'),
                truckNumber: 'lii',
                loadId: getLoadIdByNumber('LD-1001'),
                vendor: {
                    name: 'E-ZPass'
                },
                paidBy: 'company'
            },
            {
                type: 'fuel',
                category: 'fuel',
                description: 'Fuel Chicago to Detroit',
                amount: 280,
                date: '2025-11-18',
                driverId: getDriverIdByName('Ahmed', 'Hassan'),
                driverName: 'Ahmed Hassan',
                truckId: getTruckIdByNumber('OP'),
                truckNumber: 'OP',
                loadId: getLoadIdByNumber('LD-1002'),
                vendor: {
                    name: 'Love\'s - Chicago, IL'
                },
                paidBy: 'company'
            },
            {
                type: 'fuel',
                category: 'fuel',
                description: 'Fuel Atlanta to Columbus',
                amount: 400,
                date: '2025-11-14',
                driverId: getDriverIdByName('Marcus', 'Johnson'),
                driverName: 'Marcus Johnson',
                truckId: getTruckIdByNumber('T1'),
                truckNumber: 'T1',
                loadId: getLoadIdByNumber('LD-1003'),
                vendor: {
                    name: 'Pilot - Atlanta, GA'
                },
                paidBy: 'company'
            },
            {
                type: 'maintenance',
                category: 'maintenance',
                description: 'Oil change and inspection',
                amount: 185,
                date: '2025-11-15',
                driverId: getDriverIdByName('Marcus', 'Johnson'),
                driverName: 'Marcus Johnson',
                truckId: getTruckIdByNumber('T1'),
                truckNumber: 'T1',
                loadId: getLoadIdByNumber('LD-1003'),
                vendor: {
                    name: 'TA Truck Service - Columbus'
                },
                paidBy: 'company'
            },
            {
                type: 'lumper',
                category: 'lumper',
                description: 'Unloading fee at delivery',
                amount: 125,
                date: '2025-11-15',
                driverId: getDriverIdByName('Marcus', 'Johnson'),
                driverName: 'Marcus Johnson',
                truckId: getTruckIdByNumber('T1'),
                truckNumber: 'T1',
                loadId: getLoadIdByNumber('LD-1003'),
                vendor: {
                    name: 'Ohio Fresh Markets'
                },
                paidBy: 'driver'
            },
            {
                type: 'fuel',
                category: 'fuel',
                description: 'Fuel NY to Columbus',
                amount: 480,
                date: '2025-11-16',
                driverId: getDriverIdByName('Sarah', 'Williams'),
                driverName: 'Sarah Williams',
                truckId: getTruckIdByNumber('T2'),
                truckNumber: 'T2',
                loadId: getLoadIdByNumber('LD-1004'),
                vendor: {
                    name: 'Flying J - Pennsylvania'
                },
                paidBy: 'company'
            },
            {
                type: 'toll',
                category: 'toll',
                description: 'Pennsylvania Turnpike',
                amount: 75,
                date: '2025-11-16',
                driverId: getDriverIdByName('Sarah', 'Williams'),
                driverName: 'Sarah Williams',
                truckId: getTruckIdByNumber('T2'),
                truckNumber: 'T2',
                loadId: getLoadIdByNumber('LD-1004'),
                vendor: {
                    name: 'PA Turnpike'
                },
                paidBy: 'company'
            },
            {
                type: 'insurance',
                category: 'insurance',
                description: 'Monthly insurance - Truck lii',
                amount: 550,
                date: '2025-11-01',
                truckId: getTruckIdByNumber('lii'),
                truckNumber: 'lii',
                vendor: {
                    name: 'Progressive Commercial'
                },
                paidBy: 'company',
                isRecurring: true,
                recurringType: 'monthly'
            },
            {
                type: 'insurance',
                category: 'insurance',
                description: 'Monthly insurance - Truck T1',
                amount: 500,
                date: '2025-11-01',
                truckId: getTruckIdByNumber('T1'),
                truckNumber: 'T1',
                vendor: {
                    name: 'State Farm Commercial'
                },
                paidBy: 'company',
                isRecurring: true,
                recurringType: 'monthly'
            },
            {
                type: 'insurance',
                category: 'insurance',
                description: 'Monthly insurance - Truck T2',
                amount: 520,
                date: '2025-11-01',
                truckId: getTruckIdByNumber('T2'),
                truckNumber: 'T2',
                vendor: {
                    name: 'State Farm Commercial'
                },
                paidBy: 'company',
                isRecurring: true,
                recurringType: 'monthly'
            },
            {
                type: 'fixed',
                category: 'fixed',
                description: 'Office rent - 3191 Morse Rd',
                amount: 1200,
                date: '2025-11-01',
                vendor: {
                    name: 'Landlord'
                },
                paidBy: 'company',
                isRecurring: true,
                recurringType: 'monthly'
            },
            {
                type: 'fixed',
                category: 'fixed',
                description: 'TMS software subscription',
                amount: 150,
                date: '2025-11-01',
                vendor: {
                    name: 'Software Provider'
                },
                paidBy: 'company',
                isRecurring: true,
                recurringType: 'monthly'
            },
            {
                type: 'maintenance',
                category: 'maintenance',
                description: 'Tire repair',
                amount: 95,
                date: '2025-11-23',
                driverId: getDriverIdByName('Liban', 'Ali'),
                driverName: 'Liban Ali',
                truckId: getTruckIdByNumber('lii'),
                truckNumber: 'lii',
                vendor: {
                    name: 'Discount Tire - Columbus'
                },
                paidBy: 'company'
            }
        ];
        
        for (const expense of expenses) {
            await DataManager.addExpense(expense);
            console.log(`✅ Created expense: ${expense.description} - $${expense.amount}`);
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        console.log('\n✅ Mock data population complete!');
        console.log('\n📊 Summary:');
        console.log(`   - ${customers.length} Customers created`);
        console.log(`   - ${trucks.length} Trucks created`);
        console.log(`   - ${drivers.length} Drivers created`);
        console.log(`   - ${loads.length} Loads created`);
        console.log(`   - ${expenses.length} Expenses created`);
        
        Utils.showNotification(
            `Mock data created successfully! ${customers.length} customers, ${trucks.length} trucks, ${drivers.length} drivers, ${loads.length} loads, ${expenses.length} expenses.`,
            'success'
        );
        
        console.log('\n🔄 Refreshing page in 3 seconds...');
        
        setTimeout(() => {
            window.location.reload();
        }, 3000);
        
    } catch (error) {
        console.error('❌ Error populating mock data:', error);
        console.error('Full error details:', error);
        Utils.showNotification('Error populating data: ' + (error.message || 'Unknown error'), 'error');
        alert('Error populating mock data. Check the console for details.\n\nError: ' + (error.message || 'Unknown error'));
    }
}

// Export to window for easy access
window.populateMockData = populateMockData;

// Auto-detect when page is loaded and script is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📝 Mock data script loaded!');
            console.log('💡 Click "Populate Mock Data" button on dashboard or run populateMockData() in console.');
        });
    } else {
        console.log('📝 Mock data script loaded!');
        console.log('💡 Click "Populate Mock Data" button on dashboard or run populateMockData() in console.');
    }
}

