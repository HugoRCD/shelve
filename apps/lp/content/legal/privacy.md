---
title: "Privacy Policy"
description: "How Shelve collects, uses, and protects your personal information"
lastUpdated: "2025-06-22"
effectiveDate: "2025-06-22"
---

# Privacy Policy

**Last updated: {{ $doc.lastUpdated }}**  
**Effective date: {{ $doc.effectiveDate }}**

This Privacy Policy describes how Hugo Richard ("we," "us," or "our") collects, uses, and protects your information when you use the Shelve platform, including our web application (app.shelve.cloud), landing page (shelve.cloud), CLI tool, and Vault service (vault.shelve.cloud).

## 1. Data Controller Information

**Data Controller**: Hugo Richard  
**Email**: contact@shelve.cloud  
**Service**: Shelve - Environment Variable Management Platform  
**Website**: https://shelve.cloud  
**Application**: https://app.shelve.cloud

## 2. Information We Collect

### 2.1 Account and Authentication Data

When you create an account on Shelve, we collect and store your email address as your primary identifier and communication channel, along with your chosen username which must be unique across the platform. You can optionally provide a profile avatar, and we record which authentication method you used to create your account (GitHub OAuth, Google OAuth, or Email with one-time password).

We also maintain your user role for access control purposes, timestamps of when your account was created and last updated, your onboarding completion status, and whether you've used our command-line interface tool.

### 2.2 Authentication Tokens and Sessions

For CLI access, we generate encrypted authentication tokens that you can create and manage through your account settings. Each token has a user-defined name for identification purposes, and we track when tokens are created and last used for security monitoring. These tokens follow the format `she_[user_id]_[random_string]`.

When you use OAuth authentication with [GitHub](https://github.com) or [Google](https://google.com), we temporarily store the access tokens in secure sessions to maintain your authentication state. For email-based authentication, we generate temporary one-time password codes that automatically expire after a short period for security purposes.

### 2.3 Project and Team Data

We store information about the teams and projects you create or participate in. For teams, this includes the team name, a URL-friendly unique identifier, optional custom team branding, and timestamps tracking when teams are created and updated.

For projects within teams, we collect the project name, optional description, optional links to GitHub repositories, project management tools, or project websites, optional prefixes for environment variables, and custom project logos. We also maintain records of team memberships, tracking which users belong to which teams and their roles within those teams (owner, admin, or member).

### 2.4 Environment Variables and Secrets

The core of our service involves storing your environment variables and secrets securely. We collect the variable names (such as "DATABASE_URL" or "API_KEY") and their corresponding secret values, which are encrypted at rest using AES-256 encryption via [Iron-WebCrypto](https://github.com/hapijs/iron). We track which environments each variable belongs to (such as production, staging, or development) and maintain audit trails with creation and update timestamps.

We also store information about the different environments you create, including their names and which team owns each environment.

### 2.5 GitHub Integration Data

When you connect [GitHub](https://github.com) to Shelve, we store the installation details including a unique identifier for your [GitHub App](https://docs.github.com/en/apps) installation, whether it's connected to your personal account or an organization, your GitHub user identifier, and the list of repositories you've granted us access to.

### 2.6 Usage Statistics and Analytics

**Platform Analytics** (via [Plausible Analytics](https://plausible.io)):
- **Page Views**: Which pages you visit on [shelve.cloud](https://shelve.cloud) and [app.shelve.cloud](https://app.shelve.cloud)
- **Referrer Information**: How you discovered our platform
- **Browser Information**: Browser type and version for compatibility
- **Operating System**: For feature compatibility
- **Geographic Location**: Country-level only (no precise location)
- **Session Duration**: Time spent using the platform

**Internal Usage Tracking**:
- **Push Operations**: Number of times you've uploaded environment variables
- **Pull Operations**: Number of times you've downloaded environment variables
- **CLI Usage**: Tracking of command-line tool interactions
- **API Calls**: For rate limiting and abuse prevention
- **Feature Usage**: Which features are most used for product development

### 2.7 Technical and Security Data

**Authentication Logs**:
- **Login Timestamps**: When you access the platform
- **IP Addresses**: For security monitoring and fraud prevention
- **Session Data**: Secure session management via encrypted cookies
- **Failed Login Attempts**: Security monitoring

**API Usage**:
- **Request Logs**: API endpoint usage for debugging and optimization
- **Error Logs**: Application errors for troubleshooting
- **Performance Metrics**: Response times and system health

### 2.8 Communication Data

**Support and Contact**:
- **Email Correspondence**: Support requests sent to contact@shelve.cloud
- **Welcome Emails**: Automated onboarding communications via Resend
- **Notification Preferences**: Email subscription settings
- **System Notifications**: Critical account and security alerts

### 2.9 Vault Service Data

When using our secure sharing service at vault.shelve.cloud, we temporarily store encrypted data with configurable expiration settings. This includes the number of reads allowed, time-to-live settings, access timestamps, remaining read counts, and unique identifiers for shared secrets.

## 3. How We Collect Information

### 3.1 Direct Collection
- **Account Registration**: Information you provide when creating an account
- **Profile Updates**: Changes you make to your account settings
- **Content Upload**: Environment variables and project data you store
- **Support Requests**: Communications you send to our support channels

### 3.2 Automatic Collection
- **Analytics**: Via [Plausible Analytics](https://plausible.io) script (analytics.hrcd.fr)
- **Application Logs**: Server-side logging for debugging and security
- **API Interactions**: All API calls are logged for security and optimization
- **Session Management**: Automatic session tracking for authenticated users

### 3.3 Third-Party OAuth
- **GitHub OAuth**: Profile information from [GitHub](https://github.com) (email, username, avatar)
- **Google OAuth**: Profile information from [Google](https://google.com) (email, name, avatar)

## 4. How We Use Your Information

### 4.1 Core Service Provision
- **Authentication**: Verify your identity and manage access
- **Data Storage**: Securely store your environment variables and project data
- **CLI Access**: Enable command-line tool functionality
- **Team Collaboration**: Facilitate sharing and collaboration features
- **GitHub Integration**: Sync environment variables with [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

### 4.2 Platform Improvement
- **Analytics**: Understand how users interact with our platform
- **Performance Optimization**: Improve speed and reliability
- **Feature Development**: Build new features based on usage patterns
- **Bug Fixes**: Identify and resolve technical issues

### 4.3 Security and Compliance
- **Fraud Prevention**: Monitor for suspicious activity
- **Access Control**: Enforce permissions and security policies
- **Audit Trails**: Maintain logs for security investigation
- **Compliance**: Meet legal and regulatory requirements

### 4.4 Communication
- **Welcome Messages**: Onboard new users effectively
- **System Notifications**: Inform you of important changes or issues
- **Support**: Respond to your questions and requests
- **Updates**: Notify you of new features or changes (with consent)

## 5. Data Encryption and Security

### 5.1 Encryption at Rest
- **Environment Variables**: All secret values encrypted using [Iron-WebCrypto](https://github.com/hapijs/iron) with AES-256
- **API Tokens**: Encrypted using the same encryption key as environment variables
- **Vault Secrets**: Temporary encrypted storage for secure sharing
- **Database**: Hosted on [Neon.tech](https://neon.tech) with encryption at rest

### 5.2 Encryption in Transit
- **HTTPS/TLS**: All data transmission encrypted via [SSL/TLS 1.3](https://tools.ietf.org/html/rfc8446)
- **GitHub API**: Secrets encrypted using [GitHub's public key](https://docs.github.com/en/rest/actions/secrets) before transmission
- **Database Connections**: Encrypted connections to [PostgreSQL](https://www.postgresql.org) database

### 5.3 Security Measures
- **Encryption Key Management**: Master encryption key stored securely, never exposed
- **Session Security**: Secure session management with HttpOnly cookies
- **Access Controls**: Role-based permissions and authentication requirements
- **Regular Audits**: Ongoing security assessments and improvements

### 5.4 Infrastructure Security
- **Vercel Hosting**: [SOC 2 Type II](https://vercel.com/security) compliant hosting provider
- **Neon.tech Database**: [ISO 27701](https://neon.tech/security) certified PostgreSQL hosting
- **CDN Security**: Secure content delivery with DDoS protection

## 6. Third-Party Services and Data Sharing

### 6.1 Essential Service Providers

**[Vercel](https://vercel.com)** (Hosting and Infrastructure):
- **Data Shared**: Application code, static assets, server logs
- **Purpose**: Platform hosting and content delivery
- **Location**: Primarily European regions (Frankfurt, London, Paris)
- **Safeguards**: [GDPR compliant](https://vercel.com/legal/privacy-policy), [EU-U.S. Data Privacy Framework](https://vercel.com/security) certified

**[Neon.tech](https://neon.tech)** (Database Services):
- **Data Shared**: All database content (encrypted environment variables, user data)
- **Purpose**: Primary data storage and management
- **Location**: European regions available (Frankfurt, London)
- **Safeguards**: [ISO 27701 certified](https://neon.tech/security), [GDPR compliant](https://neon.tech/privacy-policy), Data Processing Agreement

**[Resend](https://resend.com)** (Email Communications):
- **Data Shared**: Email addresses, usernames for welcome emails
- **Purpose**: Transactional email delivery and OTP codes
- **Safeguards**: [GDPR compliant](https://resend.com/legal/privacy-policy) email service

### 6.2 Analytics and Monitoring

**[Plausible Analytics](https://plausible.io)**:
- **Data Shared**: Website usage data (no personal identifiers)
- **Purpose**: Privacy-focused website analytics
- **Privacy Features**: [No cookies](https://plausible.io/data-policy), no personal data collection, [GDPR compliant](https://plausible.io/privacy)
- **Location**: [European Union servers](https://plausible.io/blog/google-analytics-gdpr)

### 6.3 Integration Services

**[GitHub](https://github.com)** (When you connect your account):
- **Data Shared**: Environment variables you choose to sync
- **Purpose**: Synchronize secrets with [GitHub Actions](https://github.com/features/actions) and repositories
- **Process**: Variables encrypted with [GitHub's public key](https://docs.github.com/en/rest/actions/secrets) before transmission
- **Control**: You control which variables and repositories are synced

**[Google](https://google.com)/[GitHub](https://github.com) OAuth**:
- **Data Received**: Profile information (email, name, avatar) for authentication
- **Tokens**: [OAuth tokens](https://oauth.net/2/) stored securely for API access (if needed)

### 6.4 Legal and Compliance Sharing

We may share information when required by law:
- **Legal Process**: Court orders, subpoenas, or legal requests
- **Law Enforcement**: Cooperation with legitimate law enforcement requests
- **Regulatory Compliance**: Meeting legal obligations in France and EU
- **Safety**: Protecting the rights and safety of our users and others

## 7. Data Retention and Deletion

### 7.1 Account Data
- **Active Accounts**: Retained while your account is active
- **Deleted Accounts**: All personal data permanently deleted within 30 days
- **Audit Logs**: Security logs retained for 90 days for fraud prevention

### 7.2 Environment Variables
- **Project Data**: Retained while projects exist and you have access
- **Deleted Projects**: Environment variables permanently deleted immediately
- **Version History**: No version history maintained for security

### 7.3 Analytics Data
- **[Plausible Analytics](https://plausible.io)**: Anonymized usage data retained for [26 months](https://plausible.io/data-policy)
- **Server Logs**: Technical logs retained for 30 days for debugging

### 7.4 Temporary Data
- **OTP Codes**: Automatically deleted after expiration (15 minutes)
- **Session Data**: Cleared when you log out or sessions expire
- **Vault Secrets**: Automatically deleted after expiration or read limit reached

## 8. Your Rights Under GDPR

As a data subject under GDPR, you have the following rights:

### 8.1 Right of Access
- Request a copy of all personal data we hold about you
- Available through your account settings or by contacting [contact@shelve.cloud](mailto:contact@shelve.cloud)

### 8.2 Right of Rectification
- Correct inaccurate or incomplete personal data
- Update your profile information directly in your account settings

### 8.3 Right of Erasure ("Right to be Forgotten")
- Request deletion of your personal data
- Available through account deletion in settings
- Immediate removal of all environment variables and project data

### 8.4 Right of Data Portability
- Request your data in a machine-readable format
- Export functionality available for environment variables and project data
- [JSON format](https://www.json.org/) export available through the application

### 8.5 Right to Object
- Object to processing of your personal data for marketing purposes
- All marketing communications are opt-in only

### 8.6 Right to Restrict Processing
- Request limitation of how we process your data
- Available by contacting [contact@shelve.cloud](mailto:contact@shelve.cloud)

## 9. Cookies and Tracking

### 9.1 Essential Cookies
- **Authentication**: Secure session management and login state
- **Preferences**: User interface preferences and settings
- **CSRF Protection**: Security tokens to prevent cross-site request forgery

### 9.2 Analytics
- **[Plausible Analytics](https://plausible.io)**: Privacy-focused analytics without personal tracking
- **No Third-Party Trackers**: We do not use [Google Analytics](https://analytics.google.com), [Facebook Pixel](https://www.facebook.com/business/tools/facebook-pixel), or similar tracking

### 9.3 Cookie Management
- Essential cookies required for platform functionality
- Analytics can be disabled through your browser settings
- No advertising or marketing cookies used

## 10. International Data Transfers

### 10.1 Data Location
- **Primary Storage**: European regions (Germany, UK) through [Neon.tech](https://neon.tech)
- **Hosting**: [Vercel](https://vercel.com) with European edge locations preferred
- **Backups**: Encrypted backups in [EU regions](https://commission.europa.eu/law/law-topic/data-protection_en)

### 10.2 Transfer Safeguards
- **[Standard Contractual Clauses](https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/standard-contractual-clauses-scc_en)**: EU-approved data transfer mechanisms
- **[Adequacy Decisions](https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/adequacy-decisions_en)**: Transfers only to countries with adequate protection
- **Encryption**: All data encrypted during transfer and at rest

### 10.3 US Data Transfers
- **[Vercel](https://vercel.com)**: [EU-U.S. Data Privacy Framework](https://www.dataprivacyframework.gov) certified
- **[GitHub](https://github.com)**: Only when you explicitly choose to sync data
- **[Resend](https://resend.com)**: [GDPR compliant](https://resend.com/legal/privacy-policy) with appropriate safeguards

## 11. Data Security Incidents

### 11.1 Incident Response
- **Detection**: Automated monitoring and alerting systems
- **Assessment**: Rapid evaluation of scope and impact
- **Containment**: Immediate steps to prevent further unauthorized access
- **Notification**: Users informed within 72 hours if high risk to rights and freedoms

### 11.2 Security Measures
- **Regular Updates**: System and dependency updates applied promptly
- **Penetration Testing**: Regular security assessments
- **Access Controls**: Minimal access principle for all systems
- **Monitoring**: Continuous security monitoring and alerting

## 12. Children's Privacy

### 12.1 Age Restrictions
- **Minimum Age**: 13 years old (16 in EU where required)
- **Verification**: We do not knowingly collect data from children under the minimum age
- **Parental Consent**: Required for users under 16 in applicable jurisdictions

### 12.2 Educational Use
- **School Accounts**: Special considerations for educational institutions
- **Parental Controls**: Information available for parents and guardians
- **Data Minimization**: Limited data collection for users under 18

## 13. Business Transfers

### 13.1 Merger or Acquisition
- **Advance Notice**: 30 days notice before any business transfer
- **Data Protection**: Ensuring acquirer maintains same privacy standards
- **User Choice**: Option to delete account before transfer

### 13.2 Asset Sale
- **Limited Scope**: Only anonymized usage data transferred if technically necessary
- **Personal Data**: Requires explicit consent for transfer of personal information

## 14. Updates to This Policy

### 14.1 Change Notification
- **Email Notice**: Significant changes communicated via email
- **Website Notice**: Updates posted prominently on our website
- **Version History**: Previous versions available upon request

### 14.2 Continued Use
- **Acceptance**: Continued use indicates acceptance of updated terms
- **Objection**: Right to object or delete account if you disagree with changes

## 15. Contact Information and Complaints

### 15.1 Data Protection Contact
- **Email**: contact@shelve.cloud
- **Subject Line**: "Privacy Inquiry" for faster processing
- **Response Time**: Within 72 hours for GDPR requests

### 15.2 Supervisory Authority
If you believe we have not adequately addressed your privacy concerns, you have the right to lodge a complaint with the supervisory authority in your country. In France, this is the [Commission Nationale de l'Informatique et des Libertés (CNIL)](https://www.cnil.fr/).

**CNIL Contact Information**:
- Website: [https://www.cnil.fr/](https://www.cnil.fr/)
- Address: 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07

## 16. Technical Implementation Details

### 16.1 API Security
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Authentication Required**: All API endpoints require valid authentication
- **HTTPS Only**: No unencrypted communication allowed
- **Input Validation**: All user input validated and sanitized

### 16.2 Database Security
- **Connection Encryption**: All database connections encrypted
- **Access Controls**: Database access restricted to application only
- **Regular Backups**: Encrypted backups with secure retention
- **No Plain Text Storage**: All sensitive data encrypted at column level

### 16.3 Application Security
- **Content Security Policy**: Prevents XSS and code injection attacks
- **CSRF Protection**: All state-changing operations protected
- **Secure Headers**: HSTS, X-Frame-Options, and other security headers
- **Dependency Management**: Regular updates and vulnerability scanning

---

*This Privacy Policy was last updated on {{ $doc.lastUpdated }}. For questions about this policy or our privacy practices, please contact us at contact@shelve.cloud.*