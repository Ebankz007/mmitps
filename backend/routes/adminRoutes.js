const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/pg/adminUserController');
const adminPlansController = require('../controllers/pg/adminPlansController');
const adminSubscriptionController = require('../controllers/pg/adminSubscriptionController');
const adminServicesController = require('../controllers/pg/adminServicesController');
const systemController = require('../controllers/pg/systemController');
const adminFeatureController = require('../controllers/pg/adminFeatureController');
const adminPaymentController = require('../controllers/pg/adminPaymentController');
const adminAPIManagerController = require('../controllers/pg/adminAPIManagerController');
const adminTradingController = require('../controllers/pg/adminTradingController');
const walletController = require('../controllers/pg/walletController');
const adminEducationController = require('../controllers/pg/adminEducationController');
const adminEmailController = require('../controllers/pg/adminEmailController');
const couponController = require('../controllers/pg/couponController');
const { uploadLimiter } = require('../middleware/rateLimit');
const { protect, authorize } = require('../middleware/pg/auth');

router.use(protect);
router.use(authorize('admin', 'super_admin'));

// User Management
router.get('/users', adminUserController.getUsers);
router.post('/users', authorize('super_admin'), adminUserController.createStaff); // Create staff
router.patch('/users/:id/status', adminUserController.updateUserStatus);
router.patch('/users/:id/role', authorize('super_admin'), adminUserController.updateUserRole); // Update role

// System Logs
router.get('/logs', adminUserController.getSystemLogs);

// Plans Management
router.get('/plans', adminPlansController.getAllPlans);
router.post('/plans', adminPlansController.createPlan);
router.get('/plans/:id', adminPlansController.getPlanById);
router.put('/plans/:id', adminPlansController.updatePlan);
router.delete('/plans/:id', adminPlansController.deletePlan);
router.patch('/plans/:id/toggle', adminPlansController.togglePlanStatus);

// Subscriptions Management
router.get('/subscriptions', adminSubscriptionController.getAllSubscriptions);
router.post('/subscriptions', adminSubscriptionController.createSubscription);
router.get('/subscriptions/stats', adminSubscriptionController.getSubscriptionStats);
router.get('/subscriptions/:id', adminSubscriptionController.getSubscriptionById);
router.put('/subscriptions/:id', adminSubscriptionController.updateSubscription);
router.delete('/subscriptions/:id/cancel', adminSubscriptionController.cancelSubscription);
router.patch('/subscriptions/:id/extend', adminSubscriptionController.extendSubscription);

// Services Management
router.get('/services', adminServicesController.getAllServices);
router.post('/services', adminServicesController.addService);
router.put('/services/:serviceName', adminServicesController.updateService);
router.delete('/services/:serviceName', adminServicesController.removeService);
router.post('/services/:serviceName/health', adminServicesController.testServiceHealth);

// System Settings
router.get('/settings', systemController.getAllSettings);
router.get('/settings/geo-restrictions', systemController.getGeoRestrictions);
router.put('/settings/geo-restrictions', systemController.updateGeoRestrictions);
router.put('/settings/:key', systemController.updateSetting);

// System Health & Diagnostics
router.get('/system/health', systemController.getDatabaseHealth);
router.post('/system/db-repair', systemController.repairDatabaseConnection);

// Features Management
router.get('/features', adminFeatureController.getAllFeatures);
router.post('/features', adminFeatureController.addFeatureFlag);
router.put('/features/:featureName', adminFeatureController.updateFeature);
router.get('/rate-limits', adminFeatureController.getRateLimits);
router.put('/rate-limits/:planId', adminFeatureController.updateRateLimits);

// Payment Config
router.get('/payment-config', adminPaymentController.getPaymentConfig);
router.get('/payment', adminPaymentController.getPaymentConfig); // Alias for frontend
router.post('/payment-config', adminPaymentController.addPaymentProvider);
router.put('/payment-config/:provider', adminPaymentController.updatePaymentConfig);
router.put('/payment', adminPaymentController.bulkUpdatePaymentConfig); // Support frontend bulk update
router.patch('/payment-config/:provider/toggle', adminPaymentController.togglePaymentProvider);
router.post('/payment-config/:provider/test', adminPaymentController.testPaymentConnection);

// API Service Manager (Superadmin only)
router.get('/api-manager', authorize('super_admin'), adminAPIManagerController.getConfig);
router.put('/api-manager', authorize('super_admin'), adminAPIManagerController.updateConfig);
router.post('/api-manager/toggle-mock', authorize('super_admin'), adminAPIManagerController.toggleMockMode);
router.patch('/api-manager/provider-key', authorize('super_admin'), adminAPIManagerController.updateProviderKey);
router.post('/api-manager/service', authorize('super_admin'), adminAPIManagerController.addService);
router.put('/api-manager/:category/:name', authorize('super_admin'), adminAPIManagerController.updateSpecificService);
router.delete('/api-manager/:category/:name', authorize('super_admin'), adminAPIManagerController.deleteService);
router.post('/api-manager/:category/:name/test', authorize('super_admin'), adminAPIManagerController.testServiceConnection);
router.put('/api-manager/section/:section', authorize('super_admin'), adminAPIManagerController.updateSection);
router.patch('/api-manager/property', authorize('super_admin'), adminAPIManagerController.updateNestedProperty);

// Trading Management
router.get('/trading/providers', adminTradingController.getAllProviders);
router.get('/trading/provider/user/:userId', adminTradingController.getProviderByUserId);
router.get('/user/:userId/accounts', adminTradingController.getAccountsByUserId);
router.patch('/user/:userId/provider-toggle', adminTradingController.toggleProviderStatus);
router.patch('/trading/provider/:id/verify', adminTradingController.toggleVerification);
router.patch('/trading/provider/:id/status', adminTradingController.updateProviderStatus);
router.get('/trading/subscriptions', adminTradingController.getAllSubscriptions);

// C-Book Management
router.post('/trading/c-book/follow', adminTradingController.createCBookSubscription);
router.post('/trading/accounts', protect, authorize('admin'), adminTradingController.addTradingAccount);

// Financial Management
router.get('/financial/currencies', walletController.getSupportedCurrencies);
router.post('/financial/currencies', walletController.addSupportedCurrency);
router.get('/financial/wallets', walletController.getUserWallets);
router.put('/financial/users/:userId/wallet', walletController.adminUpdateWallet);
router.get('/financial/coupons', couponController.adminGetCoupons);
router.post('/financial/coupons', couponController.adminCreateCoupon);

// Education CMS
router.get('/education/courses', adminEducationController.getAllCourses);
router.post('/education/courses', adminEducationController.createCourse);
router.get('/education/courses/:id', adminEducationController.getCourseById);
router.put('/education/courses/:id', adminEducationController.updateCourse);
router.delete('/education/courses/:id', adminEducationController.deleteCourse);
router.patch('/education/courses/:id/toggle', adminEducationController.togglePublish);
router.get('/education/courses/:id/stats', adminEducationController.getCourseStats);
// Modules
router.post('/education/courses/:id/modules', adminEducationController.addModule);
router.put('/education/courses/:id/modules/:moduleId', adminEducationController.updateModule);
router.delete('/education/courses/:id/modules/:moduleId', adminEducationController.deleteModule);
// Lessons
router.post('/education/courses/:id/modules/:moduleId/lessons', adminEducationController.addLesson);
router.put('/education/courses/:id/modules/:moduleId/lessons/:lessonId', adminEducationController.updateLesson);
router.delete('/education/courses/:id/modules/:moduleId/lessons/:lessonId', adminEducationController.deleteLesson);
// File Upload
router.post('/education/upload', uploadLimiter, adminEducationController.upload.single('file'), adminEducationController.uploadLessonFile);

// ── Email Management ─────────────────────────────────────────────────────────
router.get('/email/config',                  adminEmailController.getEmailConfig);
router.put('/email/config',                  authorize('super_admin'), adminEmailController.updateEmailConfig);
router.post('/email/test',                   adminEmailController.sendTestEmail);
router.get('/email/preferences',             adminEmailController.getPreferences);
router.put('/email/preferences',             adminEmailController.updatePreferences);
router.get('/email/user-defaults',           adminEmailController.getUserDefaults);
router.put('/email/user-defaults',           adminEmailController.updateUserDefaults);
router.get('/email/templates',               adminEmailController.getAllTemplates);
router.get('/email/templates/:key',          adminEmailController.getTemplate);
router.put('/email/templates/:key',          adminEmailController.updateTemplate);
router.post('/email/templates/:key/reset',   adminEmailController.resetTemplate);

module.exports = router;