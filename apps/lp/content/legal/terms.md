---
title: "Terms of Service"
description: "Terms and conditions for using the Shelve platform"
lastUpdated: "2025-06-22"
effectiveDate: "2025-06-22"
---

# Terms of Service

**Last updated: {{ $doc.lastUpdated }}**  
**Effective date: {{ $doc.effectiveDate }}**

These Terms of Service ("Terms") govern your use of the Shelve platform, including our web application (app.shelve.cloud), landing page (shelve.cloud), CLI tool, Vault service (vault.shelve.cloud), and related services (collectively, the "Service") operated by Hugo Richard ("we," "us," or "our").

## 1. Service Provider Information

**Service Provider**: Hugo Richard  
**Email**: contact@shelve.cloud  
**Service**: Shelve - Environment Variable Management Platform  
**Website**: https://shelve.cloud  
**Application**: https://app.shelve.cloud  
**Legal Jurisdiction**: France

## 2. Acceptance of Terms

### 2.1 Agreement
By accessing or using Shelve, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part of these terms, you may not access or use the Service.

### 2.2 Age Requirements
You must be at least 13 years old to use our Service. If you are under 16 and located in the European Union, you must have parental consent to use our Service.

### 2.3 Capacity
You represent that you have the legal capacity to enter into these Terms, either on your own behalf or on behalf of an organization you are authorized to represent.

## 3. Description of Service

### 3.1 Core Platform Features

Shelve is an environment variable management platform that provides:

**Environment Variable Management**:
- Secure storage and management of environment variables
- Support for multiple environments (development, staging, production, etc.)
- Team-based collaboration on environment configurations
- Project organization and management tools

**Command-Line Interface (CLI)**:
- Cross-platform CLI tool for environment variable management
- Secure authentication via API tokens
- Push/pull operations for environment synchronization
- Local configuration management

**[GitHub](https://github.com) Integration**:
- Synchronization with [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub App](https://docs.github.com/en/apps) installation and management
- Repository-specific secret management
- Automated secret deployment to [CI/CD pipelines](https://github.com/features/actions)

**Vault Service**:
- Secure temporary secret sharing (vault.shelve.cloud)
- Time-limited and read-limited secret sharing
- No-account-required secure sharing
- Encrypted storage with automatic expiration

### 3.2 Technical Infrastructure

**Web Application** (app.shelve.cloud):
- User account management and authentication
- Team and project management interfaces
- Environment variable editing and organization
- Integration management and configuration

**API Services**:
- [RESTful API](https://restfulapi.net) for all platform operations
- Token-based authentication for CLI access
- Rate limiting and security controls
- Comprehensive logging and monitoring

**Security Features**:
- [AES-256 encryption](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) for all sensitive data
- [Iron-WebCrypto](https://github.com/hapijs/iron) encryption implementation
- Secure session management
- Multi-factor authentication via email [OTP](https://en.wikipedia.org/wiki/One-time_password)

## 4. User Accounts and Authentication

### 4.1 Account Creation

You may create an account using:
- **Email Authentication**: Registration with email and [OTP](https://en.wikipedia.org/wiki/One-time_password) verification
- **[GitHub OAuth](https://docs.github.com/en/apps/oauth-apps)**: Authentication via your [GitHub](https://github.com) account
- **[Google OAuth](https://developers.google.com/identity/protocols/oauth2)**: Authentication via your [Google](https://google.com) account

### 4.2 Account Information

When creating an account, you must provide a valid email address and choose a unique username. You may optionally add profile information such as an avatar and display name.

### 4.3 Account Security

You are responsible for:
- Maintaining the confidentiality of your account credentials
- All activities that occur under your account
- Immediately notifying us of any unauthorized access
- Using strong authentication methods when available

### 4.4 API Tokens

For CLI access, you may generate API tokens that provide programmatic access to your account. These tokens can be revoked at any time through your account settings and should be kept secure and not shared with unauthorized parties.

## 5. Acceptable Use Policy

### 5.1 Permitted Uses

You may use Shelve to:
- Store and manage environment variables for legitimate software development
- Collaborate with team members on environment configurations
- Integrate with supported third-party services (GitHub, etc.)
- Access the Service through our provided interfaces (web, CLI, API)

### 5.2 Prohibited Uses

You may not:

**Content Restrictions**:
- Store illegal content or data that violates applicable laws
- Store personal data of third parties without proper consent
- Upload malicious code, viruses, or harmful software
- Store content that infringes on intellectual property rights

**Technical Restrictions**:
- Attempt to gain unauthorized access to our systems
- Reverse engineer, decompile, or disassemble our software
- Use automated tools to access the Service beyond normal usage
- Circumvent rate limits or security measures

**Business Restrictions**:
- Resell or redistribute access to the Service without permission
- Use the Service to compete with us directly
- Violate any applicable laws or regulations
- Engage in any form of harassment or abuse

### 5.3 Rate Limits and Fair Use

**API Rate Limits**:
- Standard rate limits apply to prevent abuse
- CLI operations are subject to reasonable usage limits
- Bulk operations may be throttled to ensure service stability

**Storage Limits**:
- No hard limits currently imposed on environment variables
- Reasonable use expected (not for large file storage)
- Right to implement limits with advance notice if needed

## 6. Team and Collaboration Features

### 6.1 Team Management

**Team Creation**:
- Users can create teams for collaborative environment management
- Team owners have full administrative rights
- Teams have unique slugs for identification

**Member Roles**:
- **Owner**: Full control over team settings and members
- **Admin**: Can manage projects and environments, invite members
- **Member**: Can view and edit assigned projects and environments

### 6.2 Project Organization

**Project Structure**:
- Projects belong to teams and contain environment variables
- Support for multiple environments per project
- Optional integration with external repositories

**Access Control**:
- Team-based access to projects and environments
- Role-based permissions for different operations
- Audit trails for all changes and access

## 7. GitHub Integration

### 7.1 GitHub App Installation

When you connect [GitHub](https://github.com):
- You grant Shelve access to specified repositories
- We install a [GitHub App](https://docs.github.com/en/apps) with limited, necessary permissions
- You can control which repositories have access

### 7.2 Secret Synchronization

**Data Flow**:
- Environment variables are encrypted before transmission to [GitHub](https://github.com)
- Synchronization is one-way (Shelve to GitHub)
- You control which variables are synchronized

**Permissions Required**:
- Repository access for secret management
- [Actions secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) read/write permissions
- Organization secrets access (if applicable)

### 7.3 Security Measures

- Secrets are encrypted using [GitHub's public key](https://docs.github.com/en/rest/actions/secrets)
- No plain-text transmission of sensitive data
- Audit logs maintained for all synchronization operations

## 8. Vault Service Terms

### 8.1 Vault Usage

Our Vault service (vault.shelve.cloud) allows:
- Temporary, secure sharing of sensitive information
- No account required for basic usage
- Configurable expiration and read limits

### 8.2 Vault Limitations

Our Vault service has reasonable technical limits for secret size, configurable time-to-live periods, and read limits to ensure system stability and security. The same content restrictions that apply to our main platform also apply to the Vault service, including prohibitions on illegal or harmful content and respect for intellectual property rights.

## 9. Data Ownership and Intellectual Property

### 9.1 Your Data

You retain ownership of:
- All environment variables and project data you store
- Content you create or upload to the platform
- Your account information and preferences

### 9.2 Our Intellectual Property

We retain ownership of:
- The Shelve platform, software, and technology
- Our trademarks, logos, and branding
- Documentation, interfaces, and design elements
- Any improvements or enhancements we develop

### 9.3 License Grant

**To You**: We grant you a limited, non-exclusive, non-transferable license to use the Service according to these Terms.

**To Us**: You grant us the right to host, store, and process your data solely to provide the Service and as described in our Privacy Policy.

## 10. Service Availability and Support

### 10.1 Service Level

**Availability**:
- We strive for high availability but make no guarantees
- Planned maintenance will be announced when possible
- Emergency maintenance may occur without notice

**Support**:
- Community support through our documentation and forums
- Email support at contact@shelve.cloud
- Response times are best-effort basis

### 10.2 Current Service Model

**Free Service**:
- Shelve is currently provided as a free service
- No payment processing or billing currently implemented
- We reserve the right to introduce paid plans in the future with advance notice

**Future Changes**:
- Any introduction of paid features will be communicated clearly
- Existing users will have grandfathering considerations
- Core functionality will remain available in some form

## 11. Privacy and Data Protection

### 11.1 Data Processing

We process your data in accordance with:
- Our detailed Privacy Policy
- Applicable data protection laws (GDPR, etc.)
- Industry best practices for security and privacy

### 11.2 Data Security Measures

**Encryption**:
- [AES-256 encryption](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) for all sensitive data at rest
- [TLS 1.3](https://tools.ietf.org/html/rfc8446) for all data in transit
- Secure key management practices

**Infrastructure**:
- Hosting with [GDPR](https://gdpr.eu)-compliant providers
- Regular security audits and updates
- Monitoring and incident response procedures

## 12. Limitation of Liability

### 12.1 Service Disclaimer

THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

### 12.2 Limitation of Damages

TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR LIABILITY TO YOU IS LIMITED TO THE AMOUNT YOU PAID FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM. SINCE THE SERVICE IS CURRENTLY FREE, THIS AMOUNT IS ZERO.

### 12.3 Exclusion of Damages

WE ARE NOT LIABLE FOR:
- INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES
- LOSS OF DATA, PROFITS, OR BUSINESS OPPORTUNITIES
- DAMAGES RESULTING FROM THIRD-PARTY ACTIONS
- DAMAGES FROM UNAUTHORIZED ACCESS TO YOUR ACCOUNT

## 13. Indemnification

You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from:
- Your use of the Service
- Your violation of these Terms
- Your infringement of third-party rights
- Content you store or transmit through the Service

## 14. Termination

### 14.1 Termination by You

You may terminate your account at any time by:
- Using the account deletion feature in your settings
- Requesting deletion via email to contact@shelve.cloud
- All your data will be permanently deleted within 30 days

### 14.2 Termination by Us

We may terminate or suspend your account if:
- You violate these Terms of Service
- Your account poses a security risk
- Required by law or regulation
- The Service is discontinued (with reasonable notice)

### 14.3 Effect of Termination

Upon termination:
- Your access to the Service will be immediately suspended
- Your data will be deleted according to our retention policies
- These Terms will continue to apply to past use of the Service

## 15. Changes to Service and Terms

### 15.1 Service Changes

We may modify or discontinue the Service with:
- Reasonable advance notice for material changes
- Immediate effect for security or legal reasons
- Efforts to minimize disruption to users

### 15.2 Terms Updates

We may update these Terms:
- With notice via email or platform notification
- Posted changes take effect 30 days after notice
- Continued use constitutes acceptance of updated Terms

## 16. Dispute Resolution

### 16.1 Governing Law

These Terms are governed by French law, without regard to conflict of law principles.

### 16.2 Jurisdiction

Any disputes will be subject to the exclusive jurisdiction of the courts of France.

### 16.3 Alternative Resolution

Before formal legal proceedings, we encourage:
- Direct communication to resolve issues
- Good faith negotiation
- Mediation if necessary

## 17. Compliance and Regulatory

### 17.1 GDPR Compliance

For users in the European Union:
- We comply with [GDPR](https://gdpr.eu) requirements
- You have rights regarding your personal data
- See our [Privacy Policy](/legal/privacy) for detailed information

### 17.2 Export Control

You agree to comply with all applicable export control laws and regulations.

### 17.3 Industry Standards

We follow relevant industry standards for:
- Data security and encryption
- Software development practices
- Infrastructure management

## 18. Technical Specifications

### 18.1 Platform Requirements

Our web application requires a modern browser with [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) enabled, including recent versions of [Chrome](https://www.google.com/chrome/), [Firefox](https://www.mozilla.org/firefox/), [Safari](https://www.apple.com/safari/), or [Edge](https://www.microsoft.com/edge). Our CLI tool provides cross-platform support for [Windows](https://www.microsoft.com/windows), [macOS](https://www.apple.com/macos/), and [Linux](https://www.linux.org), requiring network connectivity for API access and a command-line interface.

### 18.2 API Specifications

Our API requires token-based authentication over [HTTPS](https://en.wikipedia.org/wiki/HTTPS) connections only, with rate limiting enforced to ensure fair usage. We use [JSON](https://www.json.org/) for API communications with [UTF-8](https://en.wikipedia.org/wiki/UTF-8) encoding and follow [RESTful API](https://restfulapi.net) design principles.

## 19. Open Source and Community

### 19.1 Open Source Components

Shelve incorporates open source software:
- We respect all applicable open source licenses
- Contributions to open source components welcome
- Source code available on [GitHub](https://github.com/hugorcd/shelve)

### 19.2 Community Guidelines

When participating in community forums:
- Be respectful and professional
- No spam or promotional content
- Follow applicable laws and regulations

## 20. Miscellaneous

### 20.1 Entire Agreement

These Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding the Service.

### 20.2 Severability

If any provision of these Terms is found invalid, the remaining provisions will continue in full force and effect.

### 20.3 Assignment

You may not assign your rights under these Terms without our consent. We may assign our rights with notice to you.

### 20.4 Force Majeure

We are not liable for delays or failures due to circumstances beyond our reasonable control.

## 21. Contact Information

For questions about these Terms of Service:

**Email**: [contact@shelve.cloud](mailto:contact@shelve.cloud)  
**Subject Line**: "Terms of Service Inquiry"  
**Website**: [https://shelve.cloud](https://shelve.cloud)  
**Documentation**: [https://shelve.cloud/docs](https://shelve.cloud/docs)

**Service Provider**: Hugo Richard  
**Legal Jurisdiction**: France

---

*These Terms of Service were last updated on {{ $doc.lastUpdated }}. For questions about these terms or our services, please contact us at [contact@shelve.cloud](mailto:contact@shelve.cloud).* 