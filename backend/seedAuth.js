/**
 * seedAuth.js — PostgreSQL edition.
 * Idempotent: upserts auth users (superadmin/admin/trader/analyst) by username.
 * Run: node backend/seedAuth.js
 */
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const UserRepository = require('./repositories/pg/UserRepository');
const { pool } = require('../db');

const SEED_USERS = [
  {
    username: 'superadmin',
    email: 'superadmin@mmitps.com',
    password: 'Admin@123',
    role: 'super_admin',
    profile: { firstName: 'Super', lastName: 'Admin' },
    isActive: true,
    emailVerified: true,
  },
  {
    username: 'admin',
    email: 'admin@mmitps.com',
    password: 'Admin@123',
    role: 'admin',
    profile: { firstName: 'System', lastName: 'Administrator' },
    isActive: true,
    emailVerified: true,
  },
  {
    username: 'trader',
    email: 'trader@mmitps.com',
    password: 'Trader@123',
    role: 'user',
    profile: { firstName: 'Demo', lastName: 'Trader' },
    isActive: true,
    emailVerified: true,
  },
  {
    username: 'analyst',
    email: 'analyst@mmitps.com',
    password: 'Analyst@123',
    role: 'user',
    profile: { firstName: 'Data', lastName: 'Analyst' },
    isActive: true,
    emailVerified: true,
  },
];

const seedUsers = async () => {
  try {
    const salt = await bcrypt.genSalt(10);

    for (const data of SEED_USERS) {
      const passwordHash = await bcrypt.hash(data.password, salt);

      const existing = await UserRepository.findOne({ username: data.username });
      if (existing) {
        await UserRepository.update(existing.id, {
          email: data.email,
          password: passwordHash,
          role: data.role,
          profile: data.profile,
          isActive: data.isActive,
          emailVerified: data.emailVerified,
        });
        console.log(`Updated user: ${data.username} (${data.role})`);
      } else {
        await UserRepository.create({
          ...data,
          password: passwordHash,
          referralCode: `${data.username.toUpperCase()}_REF`,
        });
        console.log(`Created user: ${data.username} (${data.role})`);
      }
    }

    console.log('Successfully seeded authentication users (PostgreSQL).');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    await pool.end();
    process.exit(1);
  }
};

seedUsers();