'use client';

import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { ContactForm } from '@/components/contact/ContactForm';

export default function AboutPage() {
  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            About Worklamp
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Project management built by developers, for developers
          </p>
        </div>

        {/* Mission */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Our Mission</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Worklamp was created to solve a common problem: development teams need powerful
              project management tools, but most solutions are either too complex, too expensive, or
              don't integrate well with developer workflows.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We believe that project management software should enhance productivity, not hinder
              it. That's why we built Worklamp with a focus on simplicity, speed, and developer
              experience.
            </p>
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            What Makes Us Different
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Self-Hosted Security
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                All services run on your own infrastructure. Your data never leaves your control. We
                support local authentication and optional cloud storage integration.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Real-Time by Default
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                See updates instantly as your team works. No more refreshing pages or wondering if
                you're looking at stale data. Everything updates in real-time.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Developer-First Design
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Built with developers in mind. Minimal clicks, keyboard shortcuts, dark mode by
                default, and workflows that make sense for technical teams.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Fair Pricing
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start free and only pay for what you use. No per-seat pricing traps. Pay based on
                concurrent users and project count.
              </p>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Core Features
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Task Management
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Organize work with categories, priorities, and milestone tracking
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Bug Tracking
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Report bugs with screenshots and enable public voting
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Feature Requests
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Collect and prioritize ideas from your team and users
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Team Collaboration
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time chat channels with permission controls
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Milestone Timeline
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visualize project phases with version locking
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Role-Based Access
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Granular permissions for owners, admins, developers, and auditors
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Built With Modern Technology
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Worklamp is built with a modern, scalable tech stack designed for performance and
              reliability:
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Frontend</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Next.js 14+</li>
                  <li>• React 18+</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Backend</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Node.js</li>
                  <li>• Express.js</li>
                  <li>• PostgreSQL</li>
                  <li>• Redis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Real-Time</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Socket.io</li>
                  <li>• WebSockets</li>
                  <li>• Redis Pub/Sub</li>
                  <li>• Horizontal Scaling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Get in Touch
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Have questions or feedback? We'd love to hear from you.
          </p>
          <div className="max-w-2xl mx-auto">
            <ContactForm />
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
