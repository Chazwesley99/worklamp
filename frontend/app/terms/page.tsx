'use client';

import { MarketingLayout } from '@/components/layout/MarketingLayout';

export default function TermsPage() {
  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Terms and Conditions
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              By accessing and using Worklamp ("the Service"), you accept and agree to be bound by
              the terms and provisions of this agreement. If you do not agree to these Terms and
              Conditions, please do not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              2. Description of Service
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Worklamp is a self-hosted project management and collaboration platform designed for
              development teams. The Service provides tools for task management, bug tracking,
              feature requests, team communication, and project planning.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              3. User Accounts
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              3.1 Account Creation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              To use certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4 space-y-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              3.2 Account Eligibility
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You must be at least 13 years old to use the Service. By using the Service, you
              represent and warrant that you meet this age requirement.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              3.3 Email Verification
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              For email-based accounts, you must verify your email address before accessing certain
              features. We will send a verification link to your provided email address.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              4. Subscription and Payment
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              4.1 Free Tier
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The Free tier provides access to basic features with limitations on project count and
              team size. Free tier accounts are subject to the limitations described on our Pricing
              page.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              4.2 Paid Subscriptions
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Paid subscriptions provide access to additional features and higher limits. Pricing is
              based on:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4 space-y-2">
              <li>Number of concurrent logged-in team members</li>
              <li>Total project count</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              4.3 Billing
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Subscriptions are billed monthly in advance. You authorize us to charge your payment
              method on a recurring basis. Failure to pay may result in suspension or termination of
              your account.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              4.4 Refunds
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Refunds are handled on a case-by-case basis. Please contact us if you believe you are
              entitled to a refund.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              5. User Conduct
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 mb-4 space-y-2">
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Violate the rights of others, including intellectual property rights</li>
              <li>Upload or transmit viruses, malware, or other malicious code</li>
              <li>Attempt to gain unauthorized access to the Service or related systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use the Service to send spam or unsolicited communications</li>
              <li>Impersonate any person or entity</li>
              <li>Collect or harvest information about other users</li>
              <li>Use automated systems to access the Service without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              6. Content and Intellectual Property
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              6.1 Your Content
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You retain all rights to the content you create, upload, or share through the Service
              ("Your Content"). By using the Service, you grant us a limited license to store,
              display, and transmit Your Content as necessary to provide the Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              6.2 Our Intellectual Property
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The Service, including its design, features, and functionality, is owned by Worklamp
              and is protected by copyright, trademark, and other intellectual property laws. You
              may not copy, modify, distribute, or create derivative works based on the Service
              without our express written permission.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              6.3 Content Moderation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              In demo environments, we filter and block profanity and hate speech. We reserve the
              right to remove content that violates these Terms or is otherwise objectionable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              7. Data and Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your use of the Service is also governed by our Privacy Policy. Please review our
              Privacy Policy to understand how we collect, use, and protect your information.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              <strong>Self-Hosted Data:</strong> When you self-host Worklamp, your data remains on
              your infrastructure and under your control. You are responsible for maintaining
              appropriate security measures for your self-hosted instance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              8. Termination
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              8.1 Termination by You
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You may terminate your account at any time by deleting your account through the
              Service or by contacting us. Upon termination, your data will be deleted within 30
              days.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              8.2 Termination by Us
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We may suspend or terminate your account if you violate these Terms, fail to pay
              subscription fees, or for any other reason at our discretion. We will provide notice
              when reasonably possible.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              9. Disclaimers and Limitations of Liability
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              9.1 Service Provided "As Is"
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
              ERROR-FREE, OR SECURE.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              9.2 Limitation of Liability
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WORKLAMP SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
              REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL,
              OR OTHER INTANGIBLE LOSSES.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              10. Indemnification
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You agree to indemnify and hold harmless Worklamp and its officers, directors,
              employees, and agents from any claims, damages, losses, liabilities, and expenses
              (including legal fees) arising from your use of the Service or violation of these
              Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              11. Changes to Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of material
              changes by posting the updated Terms on this page and updating the "Last Updated"
              date. Your continued use of the Service after changes constitutes acceptance of the
              new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              12. Governing Law
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the
              jurisdiction in which Worklamp operates, without regard to its conflict of law
              provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              13. Contact Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If you have any questions about these Terms and Conditions, please contact us through
              the contact form on our About page.
            </p>
          </section>
        </div>
      </div>
    </MarketingLayout>
  );
}
