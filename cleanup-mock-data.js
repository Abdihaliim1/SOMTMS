// FINAL CLEANUP SCRIPT - DELETE ALL MOCK DATA
// Run this once before going live

async function cleanupMockData() {
    console.log('🧹 STARTING FINAL CLEANUP - DELETING ALL MOCK DATA...');
    
    try {
        // Wait for DataManager to initialize
        while (!DataManager || !DataManager.drivers) {
            console.log('Waiting for DataManager...');
            await new Promise(r => setTimeout(r, 500));
        }

        let deletedCount = 0;

        // 1. DELETE ALL SETTLEMENTS
        console.log('🗑️ Deleting settlements...');
        const settlements = [...DataManager.settlements];
        for (const settlement of settlements) {
            await DataManager.deleteSettlement(settlement.id);
            deletedCount++;
            console.log(`Deleted settlement: ${settlement.settlementNumber}`);
        }

        // 2. DELETE ALL INVOICES
        console.log('🗑️ Deleting invoices...');
        const invoices = [...DataManager.invoices];
        for (const invoice of invoices) {
            await DataManager.deleteInvoice(invoice.id);
            deletedCount++;
            console.log(`Deleted invoice: ${invoice.invoiceNumber}`);
        }

        // 3. DELETE ALL EXPENSES
        console.log('🗑️ Deleting expenses...');
        const expenses = [...DataManager.expenses];
        for (const expense of expenses) {
            await DataManager.deleteExpense(expense.id);
            deletedCount++;
            console.log(`Deleted expense: ${expense.description} - $${expense.amount}`);
        }

        // 4. DELETE ALL LOADS
        console.log('🗑️ Deleting loads...');
        const loads = [...DataManager.loads];
        for (const load of loads) {
            await DataManager.deleteLoad(load.id);
            deletedCount++;
            console.log(`Deleted load: ${load.loadNumber}`);
        }

        // 5. DELETE ALL DRIVERS
        console.log('🗑️ Deleting drivers...');
        const drivers = [...DataManager.drivers];
        for (const driver of drivers) {
            await DataManager.deleteDriver(driver.id);
            deletedCount++;
            console.log(`Deleted driver: ${driver.firstName} ${driver.lastName}`);
        }

        // 6. DELETE ALL TRUCKS
        console.log('🗑️ Deleting trucks...');
        const trucks = [...DataManager.trucks];
        for (const truck of trucks) {
            await DataManager.deleteTruck(truck.id);
            deletedCount++;
            console.log(`Deleted truck: ${truck.truckNumber}`);
        }

        // 7. DELETE ALL CUSTOMERS
        console.log('🗑️ Deleting customers...');
        const customers = [...DataManager.customers];
        for (const customer of customers) {
            await DataManager.deleteCustomer(customer.id);
            deletedCount++;
            console.log(`Deleted customer: ${customer.name}`);
        }

        console.log(`✅ CLEANUP COMPLETE! Deleted ${deletedCount} records total.`);
        console.log('🎉 SYSTEM IS NOW CLEAN AND READY FOR LIVE DATA!');
        
        // Refresh page to show empty state
        setTimeout(() => {
            window.location.reload();
        }, 2000);

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        alert('Error during cleanup: ' + error.message);
    }
}

// Expose globally
window.cleanupMockData = cleanupMockData;

// Auto-run if called directly
if (typeof window !== 'undefined' && window.location.hash === '#cleanup') {
    document.addEventListener('DOMContentLoaded', () => {
        if (confirm('⚠️ WARNING: This will DELETE ALL DATA in the system!\n\nThis includes all drivers, trucks, loads, expenses, settlements, invoices, and customers.\n\nThis action CANNOT be undone!\n\nAre you absolutely sure you want to proceed?')) {
            cleanupMockData();
        }
    });
}
