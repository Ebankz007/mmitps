/**
 * seedFinancials.js — PostgreSQL edition.
 * Seeds demo wallets + transactions for admin and superadmin.
 * Idempotent: clears only the two seed users' financial rows, then recreates.
 * Run: node backend/seedFinancials.js
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const UserRepository = require('./repositories/pg/UserRepository');
const WalletRepository = require('./repositories/pg/WalletRepository');
const TransactionRepository = require('./repositories/pg/TransactionRepository');
const { pool } = require('../db');

const SEED_USERNAMES = ['admin', 'superadmin'];

const WALLET_BALANCES = [
  { currency: 'USD', amount: 15420.5, frozen: 0 },
  { currency: 'EUR', amount: 2500.0, frozen: 0 },
  { currency: 'BTC', amount: 0.25, frozen: 0.05 },
];

const seedFinancials = async () => {
  try {
    for (const username of SEED_USERNAMES) {
      console.log(`🌱 Seeding data for ${username}...`);

      const user = await UserRepository.findOne({ username });
      if (!user) {
        console.log(`   ⚠️  User '${username}' not found — skipping. Run seedAuth.js first.`);
        continue;
      }

      // Clear existing financial rows for this user (idempotent)
      const existingTxs = await TransactionRepository.findByUserId(user.id);
      for (const tx of existingTxs) {
        await TransactionRepository.delete(tx.id);
      }
      await pool.query('DELETE FROM wallets WHERE user_id = $1', [user.id]);

      // 1. Create Wallet
      const wallet = await WalletRepository.updateBalance(user.id, 'USD', 0); // find-or-create
      await pool.query(
        'UPDATE wallets SET balances = $1 WHERE user_id = $2',
        [JSON.stringify(WALLET_BALANCES), user.id]
      );
      console.log(`   Wallet created with ${WALLET_BALANCES.length} balances`);

      // 2. Create Transactions
      const stamp = Date.now();
      await TransactionRepository.create({
        userId: user.id,
        type: 'deposit',
        amount: 10000,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'bank_transfer',
        reference: `DEP-${stamp}-1`,
        description: 'Initial balance funding',
        completedAt: new Date(),
      });
      await TransactionRepository.create({
        userId: user.id,
        type: 'withdrawal',
        amount: 500,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'crypto',
        reference: `WTH-${stamp}-1`,
        description: 'Direct profit withdrawal',
        completedAt: new Date(),
      });
      await TransactionRepository.create({
        userId: user.id,
        type: 'transfer_in',
        amount: 5920.5,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'internal',
        reference: `TRF-${stamp}-1`,
        description: 'Commission yield deposit',
        completedAt: new Date(),
      });
      console.log(`   3 transactions created`);
    }

    console.log('✅ Financial Data Seeded Successfully (PostgreSQL)!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding financials: ${error.message}`);
    await pool.end();
    process.exit(1);
  }
};

seedFinancials();