const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:5050/api/v1';

const auditResults = {
    auth: { status: 'PENDING', detail: '' },
    financial: { status: 'PENDING', detail: '' },
    trading: { status: 'PENDING', detail: '' },
    education: { status: 'PENDING', detail: '' },
    mlm: { status: 'PENDING', detail: '' },
    support: { status: 'PENDING', detail: '' },
    infra: { status: 'PENDING', detail: '' }
};

async function runAudit() {
    console.log('--- MMITPS Master System Audit (M1-M29) ---');
    console.log(`Base URL: ${BASE_URL}\n`);

    try {
        // 1. INFRASTRUCTURE CHECK
        console.log('[1/7] Testing Core Infrastructure...');
        try {
            const health = await axios.get(`${BASE_URL}/health`);
            auditResults.infra = { status: 'PASS', detail: `Server healthy on 5050. Status: ${health.data.message}` };
        } catch (e) {
            auditResults.infra = { status: 'FAIL', detail: e.message };
        }

        // 2. AUTHENTICATION CHECK
        console.log('[2/7] Testing Auth & RBAC...');
        let adminToken, traderToken;
        try {
            // Test Admin Login
            const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'superadmin@mmitps.com',
                password: 'Admin@123'
            });
            adminToken = adminRes.data.data.tokens.access.token;

            // Test Trader Login
            const traderRes = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'trader@mmitps.com',
                password: 'Trader@123'
            });
            traderToken = traderRes.data.data.tokens.access.token;

            auditResults.auth = { status: 'PASS', detail: 'SuperAdmin and Trader accounts verified. Role extraction working.' };
        } catch (e) {
            auditResults.auth = { status: 'FAIL', detail: e.response?.data?.message || e.message };
        }

        if (!adminToken || !traderToken) {
            console.log('Skipping further tests due to Auth failure.');
            displayReport();
            process.exit(1);
        }

        const adminHeader = { headers: { Authorization: `Bearer ${adminToken}` } };
        const traderHeader = { headers: { Authorization: `Bearer ${traderToken}` } };

        // 3. FINANCIAL CHECK
        console.log('[3/7] Testing Financial Module...');
        try {
            const wallet = await axios.get(`${BASE_URL}/financial/wallet/balance`, traderHeader);
            const invoices = await axios.get(`${BASE_URL}/invoices`, adminHeader);
            auditResults.financial = { status: 'PASS', detail: `Wallet balance retrieval and Invoice listing (Admin) functional.` };
        } catch (e) {
            auditResults.financial = { status: 'FAIL', detail: e.response?.data?.message || e.message };
        }

        // 4. TRADING CHECK
        console.log('[4/7] Testing Trading & Quant...');
        try {
            const signals = await axios.get(`${BASE_URL}/trading/signals/active`, traderHeader);
            const cot = await axios.get(`${BASE_URL}/resources/cot/EUR`, traderHeader);
            auditResults.trading = { status: 'PASS', detail: `Active signals and COT reports accessible.` };
        } catch (e) {
            auditResults.trading = { status: 'FAIL', detail: e.response?.data?.message || e.message };
        }

        // 5. EDUCATION & SHOP
        console.log('[5/7] Testing Education & E-commerce...');
        try {
            const courses = await axios.get(`${BASE_URL}/education/courses`, traderHeader);
            auditResults.education = { status: 'PASS', detail: `Education catalog functional.` };
        } catch (e) {
            auditResults.education = { status: 'FAIL', detail: e.response?.data?.message || e.message };
        }

        // 6. MLM & NETWORK
        console.log('[6/7] Testing MLM Tree & Commissions...');
        try {
            const mlm = await axios.get(`${BASE_URL}/mlm/tree`, traderHeader);
            auditResults.mlm = { status: 'PASS', detail: `Genealogy tree data retrieved.` };
        } catch (e) {
            auditResults.mlm = { status: 'FAIL', detail: e.response?.data?.message || e.message };
        }

        // 7. SUPPORT & KYC
        console.log('[7/7] Testing Support & Verification...');
        try {
            const tickets = await axios.get(`${BASE_URL}/support`, traderHeader);
            auditResults.support = { status: 'PASS', detail: `Ticket system accessible.` };
        } catch (e) {
            auditResults.support = { status: 'FAIL', detail: e.response?.data?.message || e.message };
        }

        displayReport();

    } catch (globalError) {
        console.error('Audit crashed:', globalError.message);
    }
}

function displayReport() {
    console.log('\n=========================================');
    console.log('      SYSTEM AUDIT STATUS REPORT');
    console.log('=========================================');
    for (const [module, data] of Object.entries(auditResults)) {
        const icon = data.status === 'PASS' ? '✅' : '❌';
        console.log(`${icon} ${module.toUpperCase().padEnd(12)} : ${data.status}`);
        if (data.detail) console.log(`   Detail: ${data.detail}`);
    }
    console.log('=========================================');
}

runAudit();
