// Migration script to fix existing driver percentages
// Run this once to convert all driver.payPercentage values to decimal format (0-1)
// and remove references to driver.payment.percentage

async function migrateDriverPercentages() {
    console.log('Starting driver percentage migration...');
    
    if (!DataManager.initialized) {
        await DataManager.init();
    }
    
    const drivers = DataManager.drivers;
    let migratedCount = 0;
    let fixedCount = 0;
    
    for (const driver of drivers) {
        let needsUpdate = false;
        const updateData = {};
        
        // Check if payPercentage exists and needs conversion
        if (driver.payPercentage !== undefined && driver.payPercentage !== null) {
            let newPercentage = driver.payPercentage;
            
            // If stored as integer (e.g., 88), convert to decimal (0.88)
            if (newPercentage > 1) {
                newPercentage = newPercentage / 100;
                updateData.payPercentage = newPercentage;
                needsUpdate = true;
                fixedCount++;
                console.log(`Driver ${driver.id}: Converting ${driver.payPercentage} to ${newPercentage}`);
            }
        }
        
        // Check if missing percentage and needs default
        if (!driver.payPercentage || driver.payPercentage === 0) {
            if (driver.driverType === 'owner_operator') {
                updateData.payPercentage = 0.88; // 88% default for O/O
            } else if (driver.driverType === 'company' || driver.driverType === 'owner') {
                updateData.payPercentage = 0; // No default - must be set individually
            } else {
                updateData.payPercentage = 0; // No default - must be set individually
            }
            needsUpdate = true;
            migratedCount++;
            console.log(`Driver ${driver.id}: Adding default percentage ${updateData.payPercentage}`);
        }
        
        // Validate the percentage
        if (updateData.payPercentage) {
            updateData.payPercentage = Utils.validatePayPercentage(updateData.payPercentage, driver.driverType);
        }
        
        if (needsUpdate) {
            try {
                await DataManager.updateDriver(driver.id, updateData);
                console.log(`✓ Migrated driver ${driver.id} (${driver.firstName} ${driver.lastName}): ${(updateData.payPercentage * 100).toFixed(0)}%`);
            } catch (error) {
                console.error(`✗ Error migrating driver ${driver.id}:`, error);
            }
        }
    }
    
    console.log(`\nMigration complete!`);
    console.log(`- Migrated ${migratedCount} drivers (added missing percentages)`);
    console.log(`- Fixed ${fixedCount} drivers (converted integer to decimal)`);
    console.log(`- Total drivers processed: ${drivers.length}`);
    
    return {
        migrated: migratedCount,
        fixed: fixedCount,
        total: drivers.length
    };
}

// Auto-run migration on page load (only once)
if (typeof window !== 'undefined') {
    window.migrateDriverPercentages = migrateDriverPercentages;
    
    // Check if migration has been run
    if (!localStorage.getItem('percentagesMigrated')) {
        document.addEventListener('DOMContentLoaded', async () => {
            // Wait for DataManager to initialize
            if (!DataManager.initialized) {
                await DataManager.init();
            }
            
            // Wait a bit more for drivers to load
            setTimeout(async () => {
                const confirmed = confirm(
                    'Driver percentage migration detected.\n\n' +
                    'This will convert all driver pay percentages to decimal format (0.88 for 88%).\n\n' +
                    'Would you like to run the migration now?'
                );
                
                if (confirmed) {
                    try {
                        await migrateDriverPercentages();
                        localStorage.setItem('percentagesMigrated', 'true');
                        Utils.showNotification('Driver percentage migration completed!', 'success');
                    } catch (error) {
                        console.error('Migration error:', error);
                        Utils.showNotification('Migration error: ' + error.message, 'error');
                    }
                } else {
                    localStorage.setItem('percentagesMigrated', 'skipped');
                }
            }, 2000);
        });
    }
}

