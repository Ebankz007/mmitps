const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const User = require('./backend/models/User');
const KYCDocument = require('./backend/models/KYC/KYCDocument');
const KYCService = require('./backend/services/KYCService');
const AMLService = require('./backend/services/AMLService');

dotenv.config({ path: './backend/.env' });

const verifyKYCSystem = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mmitps';
        await mongoose.connect(mongoUri);
        console.log(`✅ Connected to MongoDB at ${mongoUri}`);

        // 1. Create Test User
        const testEmail = `kyctest_${Date.now()}@example.com`;
        const user = await User.create({
            username: `kyctest_${Date.now()}`,
            email: testEmail,
            password: 'password123',
            name: 'KYC Test User',
            role: 'user'
        });
        console.log(`✅ Created test user: ${user.username}`);

        // 2. Create Dummy File
        const dummyFilePath = path.join(__dirname, 'backend/uploads/documents', `test_doc_${user._id}.jpg`);
        // Ensure dir exists
        const uploadDir = path.dirname(dummyFilePath);
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        fs.writeFileSync(dummyFilePath, 'dummy file content');

        const mockFile = {
            path: dummyFilePath,
            filename: `test_doc_${user._id}.jpg`,
            size: 1024,
            mimetype: 'image/jpeg'
        };

        // 3. Submit Document (Service Layer)
        console.log('🔄 Submitting Document...');
        const doc = await KYCService.submitDocument(user._id, mockFile, 'passport', {
            documentNumber: 'AB123456',
            issuingCountry: 'US'
        });
        console.log('✅ Document Submitted:', doc._id, doc.status);

        // 4. Verify Pending Status
        const pendingDocs = await KYCService.getPendingDocuments();
        const found = pendingDocs.find(d => d._id.toString() === doc._id.toString());
        if (found) {
            console.log('✅ PASS: Document found in pending list');
        } else {
            console.error('❌ FAIL: Document not found in pending list');
        }

        // 5. Admin Review (Approve)
        console.log('🔄 Approving Document...');
        const approvedDoc = await KYCService.reviewDocument(doc._id, 'approved', user._id, 'Looks good'); // Self-approving for test
        console.log('✅ Document Status:', approvedDoc.status);

        if (approvedDoc.status === 'approved') {
            console.log('✅ PASS: Document approved successfully');
        } else {
            console.error('❌ FAIL: Document not approved');
        }

        // 6. AML Check
        console.log('🔄 Running AML Check...');
        const amlCheck = await AMLService.performCheck(user._id);
        console.log('✅ AML Check Result:', amlCheck.status, amlCheck.riskLevel);

        // Cleanup
        await User.deleteOne({ _id: user._id });
        await KYCDocument.deleteOne({ _id: doc._id });
        // fs.unlinkSync(dummyFilePath); // Keep for inspection if needed, or delete

        console.log('✨ Verification Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during verification:', error);
        process.exit(1);
    }
};

verifyKYCSystem();
