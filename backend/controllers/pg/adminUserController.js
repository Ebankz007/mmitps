/**
 * AdminUserController — PostgreSQL edition.
 * Admin user management + system logs (mirrors Mongo adminController).
 */
const UserRepository = require('../../repositories/pg/UserRepository');
const ActivityLogRepository = require('../../repositories/pg/ActivityLogRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const bcrypt = require('bcryptjs');

/** GET /admin/users */
exports.getUsers = catchAsync(async (req, res) => {
  const users = await UserRepository.findAll(req.query, {
    page: req.query.page,
    limit: req.query.limit,
  });
  res.status(200).json(new ApiResponse(true, users, 'Users retrieved'));
});

/** PATCH /admin/users/:id/status */
exports.updateUserStatus = catchAsync(async (req, res) => {
  const user = await UserRepository.update(req.params.id, { isActive: req.body.status === 'active' });

  await ActivityLogRepository.create({
    userId: req.user.id,
    action: 'update_user_status',
    category: 'admin',
    description: `Updated user ${req.params.id} status to ${req.body.status}`,
  });

  res.status(200).json(new ApiResponse(true, user, 'User status updated'));
});

/** GET /admin/logs */
exports.getSystemLogs = catchAsync(async (req, res) => {
  const logs = await ActivityLogRepository.findAll({}, {
    sort: 'createdAt',
    direction: 'desc',
    page: req.query.page,
    limit: req.query.limit,
  });
  res.status(200).json(new ApiResponse(true, logs, 'System logs retrieved'));
});

/** POST /admin/users (super_admin) */
exports.createStaff = catchAsync(async (req, res) => {
  const { email, password, role, username, firstName, lastName } = req.body;

  if (await UserRepository.emailExists(email)) {
    throw ApiError.badRequest('Email already registered');
  }

  const user = await UserRepository.create({
    email,
    password: await bcrypt.hash(password, 10),
    role: role || 'support',
    username: username || email.split('@')[0],
    profile: { firstName: firstName || null, lastName: lastName || null },
    isActive: true,
    emailVerified: true,
  });

  await ActivityLogRepository.create({
    userId: req.user.id,
    action: 'create_staff',
    category: 'admin',
    description: `Created staff account: ${user.email} with role ${user.role}`,
  });

  res.status(201).json(new ApiResponse(true, user, 'Staff account created successfully'));
});

/** PATCH /admin/users/:id/role (super_admin) */
exports.updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await UserRepository.update(id, { role });

  await ActivityLogRepository.create({
    userId: req.user.id,
    action: 'update_user_role',
    category: 'admin',
    description: `Updated user ${id} role to ${role}`,
  });

  res.status(200).json(new ApiResponse(true, user, 'User role updated successfully'));
});