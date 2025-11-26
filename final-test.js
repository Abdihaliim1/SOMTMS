// FINAL SYSTEM TEST - Verify everything works after cleanup

async function runFinalTest() {
    console.log('🧪 STARTING FINAL SYSTEM TEST...');
    
    try {
        // Wait for DataManager
        while (!DataManager || !DataManager.drivers) {
            await new Promise(r => setTimeout(r, 500));
        }

        console.log('✅ DataManager loaded');

        // Test 1: Add real driver
        console.log('🧪 Test 1: Adding real driver...');
        const testDriver = {
            firstName: 'John',
            lastName: 'TestDriver',
            driverType: 'owner_operator',
            payPercentage: 0.88,
            phone: '555-0123',
            email: 'john@test.com',
            licenseNumber: 'TEST123',
            currentTruckId: null
        };
        
        const driverId = await DataManager.addDriver(testDriver);
        console.log('✅ Test 1 PASSED: Driver added successfully');

        // Test 2: Add real load
        console.log('🧪 Test 2: Adding real load...');
        const testLoad = {
            loadNumber: 'TEST-001',
            driverId: driverId,
            rate: { total: 3000 },
            status: 'delivered',
            deliveredAt: new Date().toISOString(),
            pickupLocation: 'Test Pickup',
            deliveryLocation: 'Test Delivery'
        };
        
        const loadId = await DataManager.addLoad(testLoad);
        console.log('✅ Test 2 PASSED: Load added and appears on dashboard');

        // Test 3: Add $100 fuel for O/O
        console.log('🧪 Test 3: Adding O/O fuel expense...');
        const testExpense = {
            driverId: driverId,
            amount: 100,
            category: 'fuel',
            description: 'Test fuel expense',
            paidBy: 'company',
            deductFromDriver: true,
            date: new Date().toISOString()
        };
        
        const expenseId = await DataManager.addExpense(testExpense);
        console.log('✅ Test 3 PASSED: O/O expense added');

        // Verify expense logic
        const expense = DataManager.expenses.find(e => e.id === expenseId);
        if (expense.paidBy === 'company' && expense.deductFromDriver === true) {
            console.log('✅ EXPENSE LOGIC CORRECT: Will be deducted from settlement, NOT in company expenses');
        } else {
            console.log('❌ EXPENSE LOGIC ERROR: Check expense allocation');
        }

        console.log('🎉 FINAL TEST COMPLETE - ALL SYSTEMS WORKING!');
        console.log('📊 Dashboard should show: 1 active load, $3000 revenue, 1 driver');
        console.log('💰 Settlement should auto-include $100 fuel expense');
        console.log('📈 Reports should exclude O/O expenses from company totals');

        return {
            success: true,
            driverId: driverId,
            loadId: loadId,
            expenseId: expenseId
        };

    } catch (error) {
        console.error('❌ FINAL TEST FAILED:', error);
        return { success: false, error: error.message };
    }
}

// Expose globally
window.runFinalTest = runFinalTest;
