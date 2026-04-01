// Database Test Script
// สำหรับทดสอบการเชื่อมต่อกับฐานข้อมูล

const admin = require('firebase-admin');
const express = require('express');
require('dotenv').config();

// Initialize Firebase Admin
let serviceAccount;
try {
    serviceAccount = require('./service-account-key.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized for testing');
} catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    process.exit(1);
}

const db = admin.firestore();

// Test functions
async function testDatabaseConnection() {
    try {
        console.log('🔍 Testing database connection...');
        
        // Test basic connection
        const testDoc = await db.collection('test').doc('connection-test').set({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            test: true
        });
        
        console.log('✅ Database connection successful');
        
        // Clean up
        await testDoc.delete();
        
        return { success: true, message: 'Database connection test passed' };
    } catch (error) {
        console.error('❌ Database connection test failed:', error);
        return { success: false, message: `Database connection test failed: ${error.message}` };
    }
}

async function testMoviesCollection() {
    try {
        console.log('🎬 Testing movies collection...');
        
        // Test movies collection
        const moviesSnapshot = await db.collection('movies').limit(5).get();
        const movies = moviesSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title || 'No title',
            category: doc.data().category || 'No category',
            createdAt: doc.data().createdAt?.toDate() || null
        }));
        
        console.log(`✅ Movies collection test: Found ${movies.length} movies`);
        
        return { 
            success: true, 
            message: `Movies collection test passed: ${movies.length} movies found`,
            data: movies
        };
    } catch (error) {
        console.error('❌ Movies collection test failed:', error);
        return { success: false, message: `Movies collection test failed: ${error.message}` };
    }
}

async function testUsersCollection() {
    try {
        console.log('👥 Testing users collection...');
        
        // Test users collection
        const usersSnapshot = await db.collection('users').limit(5).get();
        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            email: doc.data().email || 'No email',
            createdAt: doc.data().createdAt?.toDate() || null
        }));
        
        console.log(`✅ Users collection test: Found ${users.length} users`);
        
        return { 
            success: true, 
            message: `Users collection test passed: ${users.length} users found`,
            data: users
        };
    } catch (error) {
        console.error('❌ Users collection test failed:', error);
        return { success: false, message: `Users collection test failed: ${error.message}` };
    }
}

async function testWriteOperations() {
    try {
        console.log('📝 Testing write operations...');
        
        // Test write operation
        const testDoc = await db.collection('test').doc('write-test').set({
            title: 'Test Movie',
            description: 'Test Description',
            category: 'test',
            year: 2024,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Test update operation
        await testDoc.update({
            description: 'Updated Description',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Test read operation
        const updatedDoc = await testDoc.get();
        
        // Clean up
        await testDoc.delete();
        
        console.log('✅ Write operations test successful');
        
        return { 
            success: true, 
            message: 'Write operations test passed',
            data: updatedDoc.data()
        };
    } catch (error) {
        console.error('❌ Write operations test failed:', error);
        return { success: false, message: `Write operations test failed: ${error.message}` };
    }
}

async function testQueryPerformance() {
    try {
        console.log('⚡ Testing query performance...');
        
        const startTime = Date.now();
        
        // Test simple query
        const query1 = await db.collection('movies').limit(10).get();
        const query1Time = Date.now() - startTime;
        
        // Test complex query
        const startTime2 = Date.now();
        const query2 = await db.collection('movies')
            .where('category', '==', 'action')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        const query2Time = Date.now() - startTime2;
        
        // Test indexed query (if indexes exist)
        const startTime3 = Date.now();
        const query3 = await db.collection('movies')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();
        const query3Time = Date.now() - startTime3;
        
        console.log(`✅ Query performance test completed`);
        console.log(`  - Simple query: ${query1Time}ms`);
        console.log(`  - Complex query: ${query2Time}ms`);
        console.log(`  - Indexed query: ${query3Time}ms`);
        
        return { 
            success: true, 
            message: `Query performance test passed`,
            data: {
                simpleQuery: query1Time,
                complexQuery: query2Time,
                indexedQuery: query3Time
            }
        };
    } catch (error) {
        console.error('❌ Query performance test failed:', error);
        return { success: false, message: `Query performance test failed: ${error.message}` };
    }
}

async function testRealtimeListeners() {
    try {
        console.log('⚡ Testing realtime listeners...');
        
        let updateCount = 0;
        const maxUpdates = 3;
        
        // Set up realtime listener
        const unsubscribe = db.collection('movies').onSnapshot((snapshot) => {
            updateCount++;
            console.log(`📡 Realtime update #${updateCount}: ${snapshot.size} documents`);
            
            if (updateCount >= maxUpdates) {
                unsubscribe();
            }
        });
        
        // Add a test document to trigger listener
        const testDoc = await db.collection('test').doc('realtime-test').set({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            test: true
        });
        
        // Wait for updates
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Clean up
        await testDoc.delete();
        
        console.log(`✅ Realtime listeners test: ${updateCount} updates received`);
        
        return { 
            success: true, 
            message: `Realtime listeners test passed: ${updateCount} updates received`
        };
    } catch (error) {
        console.error('❌ Realtime listeners test failed:', error);
        return { success: false, message: `Realtime listeners test failed: ${error.message}` };
    }
}

async function testBatchOperations() {
    try {
        console.log('📦 Testing batch operations...');
        
        const batch = db.batch();
        
        // Add multiple documents
        for (let i = 1; i <= 5; i++) {
            batch.set(db.collection('test').doc(`batch-${i}`), {
                title: `Test Movie ${i}`,
                test: true,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Commit batch
        await batch.commit();
        
        console.log('✅ Batch operations test: 5 documents added');
        
        // Clean up
        const deleteBatch = db.batch();
        for (let i = 1; i <= 5; i++) {
            deleteBatch.delete(db.collection('test').doc(`batch-${i}`));
        }
        await deleteBatch.commit();
        
        return { 
            success: true, 
            message: 'Batch operations test passed: 5 documents added and deleted'
        };
    } catch (error) {
        console.error('❌ Batch operations test failed:', error);
        return { success: false, message: `Batch operations test failed: ${error.message}` };
    }
}

async function testSecurityRules() {
    try {
        console.log('🔒 Testing security rules...');
        
        // Test unauthorized access
        try {
            await db.collection('users').add({
                email: 'test@example.com',
                password: 'password123'
            });
            return { success: false, message: 'Security rules test failed: Unauthorized write succeeded' };
        } catch (error) {
            // Expected to fail
            console.log('✅ Security rules test: Unauthorized write correctly blocked');
        }
        
        // Test read access
        try {
            const snapshot = await db.collection('users').limit(1).get();
            console.log(`✅ Security rules test: Read access allowed (${snapshot.size} documents)`);
        } catch (error) {
            console.error('❌ Security rules test failed:', error);
            return { success: false, message: `Security rules test failed: ${error.message}` };
        }
        
        return { 
            success: true, 
            message: 'Security rules test passed: Unauthorized writes blocked, reads allowed'
        };
    } catch (error) {
        console.error('❌ Security rules test failed:', error);
        return { success: false, message: `Security rules test failed: ${error.message}` };
    }
}

// Run all tests
async function runAllTests() {
    console.log('🔍 Running all database tests...\n');
    
    const tests = [
        { name: 'Database Connection', fn: testDatabaseConnection },
        { name: 'Movies Collection', fn: testMoviesCollection },
        { name: 'Users Collection', fn: testUsersCollection },
        { name: 'Write Operations', fn: testWriteOperations },
        { name: 'Query Performance', fn: testQueryPerformance },
        { name: 'Realtime Listeners', fn: testRealtimeListeners },
        { name: 'Batch Operations', fn: testBatchOperations },
        { name: 'Security Rules', fn: testSecurityRules }
    ];
    
    const results = [];
    
    for (const test of tests) {
        console.log(`\n🧪 Running ${test.name} test...`);
        
        try {
            const result = await test.fn();
            results.push({ name: test.name, ...result });
            console.log(`✅ ${test.name}: ${result.message}`);
        } catch (error) {
            results.push({ name: test.name, success: false, message: error.message });
            console.error(`❌ ${test.name}: ${error.message}`);
        }
    }
    
    console.log('\n📊 Test Results Summary:');
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.length - successCount;
    
    console.log(`✅ Passed: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    
    if (errorCount > 0) {
        console.log('\n❌ Failed Tests:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`  - ${r.name}: ${r.message}`);
        });
    }
    
    return results;
}

// Export functions for use in other files
module.exports = {
    testDatabaseConnection,
    testMoviesCollection,
    testUsersCollection,
    testWriteOperations,
    testQueryPerformance,
    testRealtimeListeners,
    testBatchOperations,
    testSecurityRules,
    runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().then(() => {
        console.log('\n🎉 All tests completed!');
        process.exit(0);
    }).catch((error) => {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    });
}

console.log('🔍 Database Test Script loaded');
