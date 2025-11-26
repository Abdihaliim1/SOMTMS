/**
 * Data Stability & Offline Persistence Module
 * Provides offline support, retry logic, and data recovery
 */

const DataStability = {
    // IndexedDB database name
    DB_NAME: 'somtruck_offline',
    DB_VERSION: 1,
    db: null,
    
    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second base delay
    
    // Pending operations queue
    pendingOperations: [],
    isProcessingQueue: false,
    
    // Connection status
    isOnline: navigator.onLine,
    
    /**
     * Initialize IndexedDB for offline storage
     */
    init: async function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            
            request.onerror = () => {
                console.error('Failed to open IndexedDB:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized for offline storage');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores for each collection
                const collections = ['loads', 'drivers', 'customers', 'trucks', 'expenses', 'invoices', 'settlements'];
                
                collections.forEach(collection => {
                    if (!db.objectStoreNames.contains(collection)) {
                        const store = db.createObjectStore(collection, { keyPath: 'id' });
                        store.createIndex('updatedAt', 'updatedAt', { unique: false });
                        store.createIndex('createdAt', 'createdAt', { unique: false });
                    }
                });
                
                // Create pending operations store
                if (!db.objectStoreNames.contains('pendingOperations')) {
                    const store = db.createObjectStore('pendingOperations', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('collection', 'collection', { unique: false });
                }
                
                // Create sync status store
                if (!db.objectStoreNames.contains('syncStatus')) {
                    db.createObjectStore('syncStatus', { keyPath: 'collection' });
                }
            };
        });
    },
    
    /**
     * Save data to IndexedDB (offline backup)
     */
    saveToOffline: async function(collection, data) {
        if (!this.db) {
            console.warn('IndexedDB not initialized, skipping offline save');
            return;
        }
        
        try {
            const transaction = this.db.transaction([collection], 'readwrite');
            const store = transaction.objectStore(collection);
            
            // Save each item
            if (Array.isArray(data)) {
                for (const item of data) {
                    await store.put({ ...item, _offlineSaved: new Date().toISOString() });
                }
            } else {
                await store.put({ ...data, _offlineSaved: new Date().toISOString() });
            }
            
            // Update sync status
            await this.updateSyncStatus(collection, 'synced');
            
            console.log(`Saved ${Array.isArray(data) ? data.length : 1} item(s) to offline storage (${collection})`);
        } catch (error) {
            console.error(`Error saving to offline storage (${collection}):`, error);
        }
    },
    
    /**
     * Load data from IndexedDB (offline fallback)
     */
    loadFromOffline: async function(collection) {
        if (!this.db) {
            return [];
        }
        
        try {
            const transaction = this.db.transaction([collection], 'readonly');
            const store = transaction.objectStore(collection);
            const request = store.getAll();
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const data = request.result.map(item => {
                        const { _offlineSaved, ...cleanItem } = item;
                        return cleanItem;
                    });
                    console.log(`Loaded ${data.length} item(s) from offline storage (${collection})`);
                    resolve(data);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error(`Error loading from offline storage (${collection}):`, error);
            return [];
        }
    },
    
    /**
     * Queue operation for retry when online
     */
    queueOperation: function(operation) {
        const queuedOp = {
            id: Date.now() + Math.random(),
            operation: operation,
            timestamp: new Date().toISOString(),
            retries: 0,
            collection: operation.collection || 'unknown'
        };
        
        this.pendingOperations.push(queuedOp);
        this.savePendingOperation(queuedOp);
        
        // Try to process queue if online
        if (this.isOnline) {
            this.processQueue();
        }
        
        return queuedOp.id;
    },
    
    /**
     * Save pending operation to IndexedDB
     */
    savePendingOperation: async function(operation) {
        if (!this.db) return;
        
        try {
            const transaction = this.db.transaction(['pendingOperations'], 'readwrite');
            const store = transaction.objectStore('pendingOperations');
            await store.put(operation);
        } catch (error) {
            console.error('Error saving pending operation:', error);
        }
    },
    
    /**
     * Process pending operations queue
     */
    processQueue: async function() {
        if (this.isProcessingQueue || !this.isOnline) {
            return;
        }
        
        this.isProcessingQueue = true;
        
        // Load pending operations from IndexedDB
        if (this.db) {
            try {
                const transaction = this.db.transaction(['pendingOperations'], 'readonly');
                const store = transaction.objectStore('pendingOperations');
                const request = store.getAll();
                
                request.onsuccess = async () => {
                    const operations = request.result;
                    this.pendingOperations = operations;
                    await this.processPendingOperations();
                };
            } catch (error) {
                console.error('Error loading pending operations:', error);
            }
        }
        
        await this.processPendingOperations();
    },
    
    /**
     * Process all pending operations
     */
    processPendingOperations: async function() {
        while (this.pendingOperations.length > 0 && this.isOnline) {
            const operation = this.pendingOperations[0];
            
            try {
                // Execute the operation
                await operation.operation.execute();
                
                // Remove from queue
                this.pendingOperations.shift();
                await this.removePendingOperation(operation.id);
                
                console.log(`Successfully processed queued operation: ${operation.collection}`);
            } catch (error) {
                operation.retries++;
                
                if (operation.retries >= this.MAX_RETRIES) {
                    // Max retries reached, remove from queue
                    console.error(`Max retries reached for operation:`, operation);
                    this.pendingOperations.shift();
                    await this.removePendingOperation(operation.id);
                    
                    // Show error to user
                    Utils.showNotification(
                        `Failed to sync ${operation.collection} after ${this.MAX_RETRIES} attempts. Please try again.`,
                        'error'
                    );
                } else {
                    // Retry with exponential backoff
                    const delay = this.RETRY_DELAY * Math.pow(2, operation.retries);
                    console.log(`Retrying operation in ${delay}ms (attempt ${operation.retries}/${this.MAX_RETRIES})`);
                    
                    setTimeout(() => {
                        this.processQueue();
                    }, delay);
                }
            }
        }
        
        this.isProcessingQueue = false;
    },
    
    /**
     * Remove pending operation from IndexedDB
     */
    removePendingOperation: async function(operationId) {
        if (!this.db) return;
        
        try {
            const transaction = this.db.transaction(['pendingOperations'], 'readwrite');
            const store = transaction.objectStore('pendingOperations');
            await store.delete(operationId);
        } catch (error) {
            console.error('Error removing pending operation:', error);
        }
    },
    
    /**
     * Update sync status
     */
    updateSyncStatus: async function(collection, status) {
        if (!this.db) return;
        
        try {
            const transaction = this.db.transaction(['syncStatus'], 'readwrite');
            const store = transaction.objectStore('syncStatus');
            await store.put({
                collection: collection,
                status: status,
                lastSynced: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating sync status:', error);
        }
    },
    
    /**
     * Get sync status
     */
    getSyncStatus: async function(collection) {
        if (!this.db) return null;
        
        try {
            const transaction = this.db.transaction(['syncStatus'], 'readonly');
            const store = transaction.objectStore('syncStatus');
            const request = store.get(collection);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting sync status:', error);
            return null;
        }
    },
    
    /**
     * Initialize connection monitoring
     */
    initConnectionMonitoring: function() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('Connection restored - processing queued operations');
            Utils.showNotification('Connection restored. Syncing pending changes...', 'info');
            this.processQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('Connection lost - operations will be queued');
            Utils.showNotification('Connection lost. Changes will be saved when connection is restored.', 'warning');
        });
        
        // Initial status
        this.isOnline = navigator.onLine;
    },
    
    /**
     * Retry operation with exponential backoff
     */
    retryOperation: async function(operation, retryCount = 0) {
        if (retryCount >= this.MAX_RETRIES) {
            throw new Error(`Operation failed after ${this.MAX_RETRIES} retries`);
        }
        
        try {
            return await operation();
        } catch (error) {
            if (retryCount < this.MAX_RETRIES - 1) {
                const delay = this.RETRY_DELAY * Math.pow(2, retryCount);
                console.log(`Retrying operation in ${delay}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.retryOperation(operation, retryCount + 1);
            }
            throw error;
        }
    },
    
    /**
     * Validate data before save
     */
    validateData: function(collection, data) {
        const validators = {
            loads: (load) => {
                // For updates, loadNumber might not be in the payload (only changed fields)
                // Only validate loadNumber for new loads (when id is not present)
                if (!load.id && !load.loadNumber) {
                    throw new Error('Load number is required');
                }
                // Rate validation is optional for updates (might be updating other fields)
                // Only validate rate for new loads
                if (!load.id && !load.rate && !load.rate?.total) {
                    throw new Error('Load rate is required');
                }
                return true;
            },
            drivers: (driver) => {
                if (!driver.firstName || !driver.lastName) {
                    throw new Error('Driver name is required');
                }
                return true;
            },
            customers: (customer) => {
                if (!customer.company?.name && !customer.customerNumber) {
                    throw new Error('Customer name or number is required');
                }
                return true;
            },
            expenses: (expense) => {
                // For updates, amount and type might not be in the payload (only changed fields)
                // Only validate for new expenses (when id is not present)
                if (!expense.id) {
                    if (!expense.amount || expense.amount <= 0) {
                        throw new Error('Expense amount must be greater than 0');
                    }
                    if (!expense.type) {
                        throw new Error('Expense type is required');
                    }
                }
                // For updates, if amount is provided, validate it's positive
                if (expense.amount !== undefined && expense.amount <= 0) {
                    throw new Error('Expense amount must be greater than 0');
                }
                return true;
            }
        };
        
        const validator = validators[collection];
        if (validator) {
            return validator(data);
        }
        
        return true; // No validator = valid
    },
    
    /**
     * Create optimistic update with rollback
     */
    createOptimisticUpdate: function(collection, operation, rollback) {
        return {
            execute: async () => {
                try {
                    // Execute operation
                    await operation();
                } catch (error) {
                    // Rollback on error
                    if (rollback) {
                        await rollback();
                    }
                    throw error;
                }
            },
            collection: collection
        };
    },
    
    /**
     * Wrapper function to add stability features to any operation
     */
    wrapOperation: async function(collection, operation, options = {}) {
        const {
            showLoading = true,
            loadingMessage = 'Saving...',
            validate = true,
            retry = true,
            queueOnOffline = true
        } = options;
        
        // Show loading state
        if (showLoading) {
            Utils.showLoadingState(loadingMessage);
        }
        
        try {
            // Validate data if validator exists
            if (validate && options.data) {
                this.validateData(collection, options.data);
            }
            
            // Execute with retry if enabled
            let result;
            if (retry && typeof DataStability !== 'undefined') {
                result = await this.retryOperation(operation);
            } else {
                result = await operation();
            }
            
            // Hide loading state
            if (showLoading) {
                Utils.hideLoadingState();
            }
            
            return result;
        } catch (error) {
            // Hide loading state
            if (showLoading) {
                Utils.hideLoadingState();
            }
            
            // Queue for retry if offline
            if (queueOnOffline && !this.isOnline && options.queueOperation) {
                const operationId = this.queueOperation({
                    execute: options.queueOperation,
                    collection: collection
                });
                Utils.showNotification('Connection lost. Changes will be saved when connection is restored.', 'warning');
                return { queued: true, id: `pending_${operationId}` };
            }
            
            throw error;
        }
    },
    
    /**
     * Resolve sync conflicts between local and remote data
     */
    resolveConflict: function(localData, remoteData, strategy = 'last_write_wins') {
        switch (strategy) {
            case 'last_write_wins':
                // Compare timestamps
                const localTime = new Date(localData.updatedAt || localData.createdAt || 0);
                const remoteTime = new Date(remoteData.updatedAt || remoteData.createdAt || 0);
                return remoteTime > localTime ? remoteData : localData;
                
            case 'merge':
                // Merge both datasets, remote takes precedence for conflicts
                return {
                    ...localData,
                    ...remoteData,
                    // Preserve local metadata
                    _localUpdated: localData.updatedAt,
                    _remoteUpdated: remoteData.updatedAt,
                    _merged: true
                };
                
            case 'local_wins':
                return localData;
                
            case 'remote_wins':
                return remoteData;
                
            default:
                return remoteData; // Default to remote
        }
    },
    
    /**
     * Check for conflicts and resolve them
     */
    checkAndResolveConflicts: async function(collection, localData) {
        if (!this.db) return localData;
        
        try {
            // Get remote data from IndexedDB (which should have latest sync timestamp)
            const transaction = this.db.transaction([collection], 'readonly');
            const store = transaction.objectStore(collection);
            const request = store.getAll();
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const remoteData = request.result;
                    
                    // Check each item for conflicts
                    const resolved = localData.map(localItem => {
                        const remoteItem = remoteData.find(r => r.id === localItem.id);
                        if (!remoteItem) return localItem;
                        
                        // Check if there's a conflict (different updatedAt)
                        const localTime = new Date(localItem.updatedAt || localItem.createdAt || 0);
                        const remoteTime = new Date(remoteItem.updatedAt || remoteItem.createdAt || 0);
                        
                        if (Math.abs(localTime - remoteTime) > 1000) { // More than 1 second difference
                            // Conflict detected - resolve it
                            return this.resolveConflict(localItem, remoteItem);
                        }
                        
                        return localItem; // No conflict
                    });
                    
                    resolve(resolved);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error checking conflicts:', error);
            return localData; // Return original if conflict check fails
        }
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        try {
            await DataStability.init();
            DataStability.initConnectionMonitoring();
            console.log('Data stability module initialized');
        } catch (error) {
            console.error('Failed to initialize data stability module:', error);
        }
    });
}

