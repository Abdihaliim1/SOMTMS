// Direct Firebase cleanup script - Run with Node.js
// This will delete ALL test data from Firebase

const admin = require('firebase-admin');

// You'll need to add your Firebase service account key here
// For now, this is a template - the actual cleanup should be run through the web interface

console.log('🧹 FIREBASE CLEANUP SCRIPT');
console.log('');
console.log('⚠️  IMPORTANT: This script requires Firebase Admin SDK setup.');
console.log('');
console.log('To run the cleanup, please:');
console.log('1. Open your browser');
console.log('2. Navigate to your TMS application');
console.log('3. Open browser console (F12)');
console.log('4. Run: cleanupMockData()');
console.log('5. Confirm the deletion');
console.log('');
console.log('OR');
console.log('');
console.log('1. Open index.html in your browser');
console.log('2. Click "Clean All Data" button');
console.log('3. Confirm the deletion');
console.log('');
console.log('This will delete ALL test data including:');
console.log('- All drivers (test names)');
console.log('- All trucks (test vehicles)');
console.log('- All loads (test shipments)');
console.log('- All customers (test companies)');
console.log('- All expenses (test costs)');
console.log('- All settlements (test payments)');
console.log('- All invoices (test billing)');
console.log('');
console.log('After cleanup, your system will be ready for real data! 🚀');
