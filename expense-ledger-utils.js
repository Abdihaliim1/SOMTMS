/**
 * Expense Ledger Utilities
 * Handles running balance logic for Owner Operator expenses
 */

const ExpenseLedger = {
    /**
     * Get all active expenses with outstanding balance for a driver
     */
    getActiveExpenses: function(driverId) {
        // Ensure DataManager is loaded
        if (typeof DataManager === 'undefined') {
            console.error('DataManager not loaded. Make sure main.js loads before expense-ledger-utils.js');
            return [];
        }
        return DataManager.expenses.filter(exp => {
            // Must be for this driver
            if (String(exp.driverId) !== String(driverId)) return false;
            
            // Must be paid by company (deductible)
            if (exp.paidBy !== 'company') return false;
            
            // Must not be already settled to another settlement
            if (exp.settlementId) return false;
            
            // IMPORTANT: Include BOTH expenses with ledgers AND expenses without ledgers
            // This handles both new ledger-based expenses and old expenses (backward compatibility)
            if (exp.expenseLedger) {
                // Has ledger - check status and remaining balance
                const ledger = exp.expenseLedger;
                if (ledger.status !== 'active' || ledger.remainingBalance <= 0) {
                    return false; // Paid or cancelled
                }
            } else {
                // No ledger - backward compatibility: include if amount > 0
                // This handles old expenses that don't have ledger yet
                const amount = parseFloat(exp.amount || 0);
                if (amount <= 0) return false;
            }
            
            // IMPORTANT: Include BOTH load-linked expenses AND floating expenses (loadId === null)
            // The loadId check is NOT here - we include all expenses that meet the above criteria
            // Floating expenses (loadId === null) are included automatically
            return true;
        });
    },
    
    /**
     * Calculate total outstanding balance for a driver
     */
    getTotalOutstandingBalance: function(driverId) {
        const activeExpenses = this.getActiveExpenses(driverId);
        return activeExpenses.reduce((total, exp) => {
            return total + (exp.expenseLedger.remainingBalance || 0);
        }, 0);
    },
    
    /**
     * Calculate deduction amount for current settlement
     * Returns: { deductionAmount, updatedExpenses }
     */
    calculateDeduction: function(driverId, grossPay, selectedLoadIds = []) {
        const activeExpenses = this.getActiveExpenses(driverId);
        
        if (activeExpenses.length === 0) {
            return {
                deductionAmount: 0,
                updatedExpenses: [],
                breakdown: {}
            };
        }
        
        let remainingPay = grossPay;
        const updatedExpenses = [];
        const breakdown = {
            fuel: 0,
            insurance: 0,
            maintenance: 0,
            other: 0
        };
        
        // Sort expenses by date (oldest first) to pay off oldest debts first
        const sortedExpenses = [...activeExpenses].sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt || 0);
            const dateB = new Date(b.date || b.createdAt || 0);
            return dateA - dateB;
        });
        
        // Process each expense until pay is exhausted
        for (const expense of sortedExpenses) {
            if (remainingPay <= 0) break;
            
            const ledger = expense.expenseLedger;
            const remainingBalance = ledger.remainingBalance || 0;
            
            if (remainingBalance <= 0) continue;
            
            // Calculate how much to deduct from this expense
            const deductionFromThisExpense = Math.min(remainingBalance, remainingPay);
            
            // Update ledger
            const updatedLedger = {
                ...ledger,
                amountPaid: (ledger.amountPaid || 0) + deductionFromThisExpense,
                remainingBalance: remainingBalance - deductionFromThisExpense,
                status: (remainingBalance - deductionFromThisExpense) <= 0 ? 'paid' : 'active',
                lastUpdated: new Date().toISOString()
            };
            
            // Track breakdown by expense type
            const expenseType = (expense.type || '').toLowerCase();
            if (expenseType.includes('fuel')) {
                breakdown.fuel += deductionFromThisExpense;
            } else if (expenseType.includes('insurance')) {
                breakdown.insurance += deductionFromThisExpense;
            } else if (expenseType.includes('maintenance') || expenseType.includes('repair')) {
                breakdown.maintenance += deductionFromThisExpense;
            } else {
                breakdown.other += deductionFromThisExpense;
            }
            
            updatedExpenses.push({
                expenseId: expense.id,
                originalLedger: ledger,
                updatedLedger: updatedLedger,
                deductionAmount: deductionFromThisExpense
            });
            
            remainingPay -= deductionFromThisExpense;
        }
        
        const totalDeduction = grossPay - remainingPay;
        
        return {
            deductionAmount: totalDeduction,
            remainingPay: remainingPay,
            updatedExpenses: updatedExpenses,
            breakdown: breakdown
        };
    },
    
    /**
     * Update expense ledgers after settlement
     */
    updateLedgers: async function(updatedExpenses) {
        // Ensure DataManager is loaded
        if (typeof DataManager === 'undefined') {
            console.error('DataManager not loaded. Make sure main.js loads before expense-ledger-utils.js');
            return;
        }
        
        if (!updatedExpenses || updatedExpenses.length === 0) {
            console.log('No ledger updates to apply');
            return;
        }
        
        console.log(`Updating ${updatedExpenses.length} expense ledgers...`);
        
        const updates = updatedExpenses.map(update => {
            // Update the expense with new ledger
            return DataManager.updateExpense(update.expenseId, {
                expenseLedger: update.updatedLedger
            }).then(() => {
                // Also update local cache immediately
                const expenseIndex = DataManager.expenses.findIndex(e => e.id === update.expenseId);
                if (expenseIndex !== -1) {
                    DataManager.expenses[expenseIndex].expenseLedger = update.updatedLedger;
                }
                console.log(`Updated expense ${update.expenseId}: Balance ${update.updatedLedger.remainingBalance}, Status: ${update.updatedLedger.status}`);
            });
        });
        
        await Promise.all(updates);
        console.log(`✅ Successfully updated ${updates.length} expense ledgers after settlement`);
    },
    
    /**
     * Initialize ledger for existing expenses (migration)
     */
    initializeLedgerForExpense: function(expense) {
        // Ensure DataManager is loaded
        if (typeof DataManager === 'undefined') {
            console.error('DataManager not loaded. Make sure main.js loads before expense-ledger-utils.js');
            return null;
        }
        // Only for owner operator expenses paid by company
        if (expense.paidBy !== 'company' || !expense.driverId) {
            return null;
        }
        
        const driver = DataManager.drivers.find(d => d.id === expense.driverId);
        if (!driver || driver.driverType !== 'owner_operator') {
            return null;
        }
        
        // If ledger already exists, return it
        if (expense.expenseLedger) {
            return expense.expenseLedger;
        }
        
        // Initialize new ledger
        const totalAmount = parseFloat(expense.amount || 0);
        return {
            totalAmount: totalAmount,
            amountPaid: 0,
            remainingBalance: totalAmount,
            status: 'active',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
    },
    
    /**
     * Migrate existing expenses to use ledger system
     */
    migrateExpensesToLedger: async function() {
        console.log('Migrating expenses to ledger system...');
        let migrated = 0;
        
        for (const expense of DataManager.expenses) {
            const ledger = this.initializeLedgerForExpense(expense);
            if (ledger && !expense.expenseLedger) {
                try {
                    await DataManager.updateExpense(expense.id, {
                        expenseLedger: ledger
                    });
                    migrated++;
                } catch (error) {
                    console.error(`Error migrating expense ${expense.id}:`, error);
                }
            }
        }
        
        console.log(`Migrated ${migrated} expenses to ledger system`);
        return migrated;
    }
};

