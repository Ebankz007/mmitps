# Changelog

All notable changes to the MMITPS project will be documented in this file.

## [1.1.0] - 2025-05-20

### Added
- **API Services**: Centralized `ApiService` for frontend with 13 specialized service classes (Auth, User, Financial, etc.).
- **Content Management System (CMS)**: Backend architecture with `ContentBlock` model, controller, and routes for managing dynamic content.
- **Certification System**: Backend module to issue and verify course certificates (`/api/v1/certification`).
- **Market Data Proxy**: Backend proxy for fetching live/mock market data (`/api/v1/market-data`) bypassing CORS issues.
- **Email Service**: Nodemailer integration for sending welcome emails and password reset links.
- **Runtime Configuration**: `env-config.js` injection to handle environment variables (API URL) dynamically in the frontend.

### Changed
- **Frontend Architecture**: Refactored `index.html` to un-nest admin and resource pages from the main dashboard container, improving layout stability.
- **Authentication**: Replaced direct `fetch` calls with `AuthService` methods; added token refresh logic.
- **Backend Security**: 
    - Implemented strict CORS with origin whitelisting.
    - Added Helmet content security policy (CSP).
    - Enabled rate limiting for API (300/15min) and Webhooks (60/min).
    - Added input sanitization (NoSQL, XSS, HPP).

### Fixed
- **Navigation**: Removed stale `navigation-diagnostic.js` script.
- **Server**: Fixed duplicate rate limiter declarations and static file serving order.
- **Webhooks**: Standardized webhook signature verification for Paystack, Flutterwave, and Korapay.

## [1.0.0] - Initial Release
- Basic Dashboard Structure
- User Authentication (Login/Register)
- Static Layouts
