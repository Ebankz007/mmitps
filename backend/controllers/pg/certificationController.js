/**
 * certificationController — PostgreSQL edition.
 * Mirrors the Mongo controllers/certificationController.
 */
const CertificateRepository = require('../../repositories/pg/CertificateRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const crypto = require('crypto');

/** CERT-XXXX-XXXX-XXXX unique code (Mongo pre-save hook equivalent). */
function generateCode() {
  const hex = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `CERT-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

exports.verifyCertificate = catchAsync(async (req, res) => {
  const certificate = await CertificateRepository.findActiveByCode(req.params.code);
  if (!certificate) throw new ApiError(404, 'Certificate not found or inactive');
  res.status(200).json(new ApiResponse(true, certificate, 'Certificate verified'));
});

exports.getMyCertificates = catchAsync(async (req, res) => {
  const certificates = await CertificateRepository.findByRecipient(req.user.id);
  res.status(200).json(new ApiResponse(true, certificates, 'Certificates retrieved'));
});

exports.issueCertificate = catchAsync(async (req, res) => {
  const { recipientId, courseId, title } = req.body;
  if (!recipientId || !courseId) throw new ApiError(400, 'recipientId and courseId required');

  const existing = await CertificateRepository.findByRecipientAndCourse(recipientId, courseId);
  if (existing) throw new ApiError(400, 'Certificate already issued for this course');

  const CourseRepository = require('../../repositories/pg/CourseRepository');
  const course = await CourseRepository.findById(courseId);
  if (!course) throw new ApiError(404, 'Course not found');

  const certificate = await CertificateRepository.create({
    recipientId,
    courseId,
    courseName: course.title,
    title: title || 'Course Completion',
    code: generateCode(),
    issueDate: new Date(),
    status: 'active',
  });
  res.status(201).json(new ApiResponse(true, certificate, 'Certificate issued'));
});

exports.getAllCertificates = catchAsync(async (req, res) => {
  const certificates = await CertificateRepository.findAll({}, { populate: 'recipient', sort: '-issueDate' });
  res.status(200).json(new ApiResponse(true, certificates, 'Certificates retrieved'));
});