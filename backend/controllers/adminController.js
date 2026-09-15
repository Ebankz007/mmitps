const AdminService = require('../services/admin/AdminService');
const AuditService = require('../services/admin/AuditService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

exports.getUsers = catchAsync(async (req, res) => {
    const users = await AdminService.getAllUsers(req.query, req.pagination);
    res.status(200).json(new ApiResponse(true, users, 'Users retrieved'));
});

exports.updateUserStatus = catchAsync(async (req, res) => {
    const user = await AdminService.updateUserStatus(req.params.id, req.body.status);

    // Log admin action
    await AuditService.log(req.user._id, 'update_user_status', 'admin', `Updated user ${req.params.id} status to ${req.body.status}`);

    res.status(200).json(new ApiResponse(true, user, 'User status updated'));
});

exports.getSystemLogs = catchAsync(async (req, res) => {
    const logs = await AuditService.getLogs(req.query, req.pagination);
    res.status(200).json(new ApiResponse(true, logs, 'System logs retrieved'));
});

exports.createStaff = catchAsync(async (req, res) => {
    const user = await AdminService.createStaff(req.body);

    // Log admin action
    await AuditService.log(req.user._id, 'create_staff', 'admin', `Created staff account: ${user.email} with role ${user.role}`);

    res.status(201).json(new ApiResponse(true, user, 'Staff account created successfully'));
});

exports.updateUserRole = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    
    const user = await AdminService.updateUserRole(id, role);

    // Log admin action
    await AuditService.log(req.user._id, 'update_user_role', 'admin', `Updated user ${id} role to ${role}`);

    res.status(200).json(new ApiResponse(true, user, 'User role updated successfully'));
});
