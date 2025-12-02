'use client';

import { MarketingLayout } from '@/components/layout/MarketingLayout';

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">Privacy Policy</h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Worklamp ("we," "our," or "us") is committed to protecting your privacy. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your information when you
              use our project management platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              2. Information We Collect
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              2.1 Information You Provide
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We collect information that you voluntarily provide when using our services:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4 space-y-2">
              <li>Account information (name, email address, password)</li>
              <li>Profile information (avatar, display name)</li>
              <li>Project data (tasks, bugs, features, comments, messages)</li>
              <li>Team information (team member invitations, roles)</li>
              <li>Payment information (processed by third-party payment processors)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              2.2 Information Collected Automatically
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              When you use Worklamp, we automatically collect:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4 space-y-2">
              <li>Usage data (features used, actions taken, time spent)</li>
              <li>Device information (browser type, operating system, IP address)</li>
              <li>Log data (access times, pages viewed, errors encountered)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              2.3 OAuth Information
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              When you authenticate using Google OAuth, we receive your email address, name, and
              profile picture from Google. We do not receive or store your Google password.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and manage your account</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>
                Send you marketing communications (only if you've opted in and can opt out anytime)
              </li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              4. Data Storage and Security
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              <strong>Self-Hosted Infrastructure:</strong> Worklamp is designed to run on your own
              infrastructure. When you self-host Worklamp, your data remains on your servers and
              under your control.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              <strong>Security Measures:</strong> We implement industry-standard security measures:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4 space-y-2">
              <li>Passwords are hashed using bcrypt with a cost factor of 12</li>
              <li>Sensitive data is encrypted at rest</li>
              <li>All communications use HTTPS/TLS encryption</li>
              <li>Regular security updates and patches</li>
              <li>Role-based access controls</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              5. Data Sharing and Disclosure
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may
              share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4 space-y-2">
              <li>
                <strong>With your team:</strong> Information you share within your workspace is
                visible to your team members based on their permissions
              </li>
              <li>
                <strong>Service providers:</strong> We may share data with third-party service
                providers who perform services on our behalf (e.g., payment processing, email
                delivery)
              </li>
              <li>
                <strong>Legal requirements:</strong> We may disclose information if required by law
                or in response to valid legal requests
              </li>
              <li>
                <strong>Business transfers:</strong> In the event of a merger, acquisition, or sale
                of assets, your information may be transferred
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              6. Email Communications
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              <strong>Opt-In Required:</strong> We only send marketing emails to users who have
              explicitly opted in to receive them. You can opt in during registration or via the
              newsletter subscription form.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              <strong>Unsubscribe:</strong> You can unsubscribe from marketing emails at any time by
              clicking the unsubscribe link in any email or by updating your preferences in your
              account settings.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              <strong>Transactional Emails:</strong> We will still send you important transactional
              emails (e.g., password resets, account notifications) even if you opt out of marketing
              emails.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              <strong>No Selling of Email Lists:</strong> We will never sell or share your email
              address with third parties for marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              7. Your Rights and Choices
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4 space-y-2">
              <li>Access and review your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Delete your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications</li>
              <li>Object to processing of your personal information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              8. Data Retention
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We retain your information for as long as your account is active or as needed to
              provide you services. If you delete your account, we will delete your personal
              information within 30 days, except where we are required to retain it for legal or
              regulatory purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              9. Children's Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Worklamp is not intended for use by children under the age of 13. We do not knowingly
              collect personal information from children under 13. If you believe we have collected
              information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              10. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              11. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If you have any questions about this Privacy Policy, please contact us through the
              contact form on our About page.
            </p>
          </section>
        </div>
      </div>
    </MarketingLayout>
  );
}
