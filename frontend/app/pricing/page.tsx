'use client';

import Link from 'next/link';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { Button } from '@/components/ui/Button';

export default function PricingPage() {
  return (
    <MarketingLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Free</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">$0</span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Perfect for individuals and small projects
            </p>

            <ul className="space-y-4 mb-8">
              <Feature included>1 project</Feature>
              <Feature included>Basic task management</Feature>
              <Feature included>To-do lists with categories</Feature>
              <Feature included>Task priorities and assignments</Feature>
              <Feature included>Email/password authentication</Feature>
              <Feature included>Google OAuth login</Feature>
              <Feature included>Profile management</Feature>
              <Feature>Team collaboration</Feature>
              <Feature>Milestone timeline</Feature>
              <Feature>Bug tracking</Feature>
              <Feature>Feature requests</Feature>
              <Feature>Team chat channels</Feature>
            </ul>

            <Link href="/dashboard" className="block">
              <Button variant="outline" className="w-full">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Paid Tier */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-500 dark:border-blue-400 p-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Pro</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">$29</span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">per concurrent user</p>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              For growing teams that need advanced features
            </p>

            <ul className="space-y-4 mb-8">
              <Feature included>Unlimited projects</Feature>
              <Feature included>Everything in Free, plus:</Feature>
              <Feature included>Team collaboration</Feature>
              <Feature included>Milestone timeline visualization</Feature>
              <Feature included>Version locking & change orders</Feature>
              <Feature included>Bug tracking with images</Feature>
              <Feature included>Public bug voting</Feature>
              <Feature included>Feature request tracking</Feature>
              <Feature included>Public feature voting</Feature>
              <Feature included>Team chat channels</Feature>
              <Feature included>Permission-controlled channels</Feature>
              <Feature included>Real-time updates</Feature>
              <Feature included>Environment variable tracking</Feature>
              <Feature included>Role-based access control</Feature>
              <Feature included>Admin, developer, auditor roles</Feature>
            </ul>

            <Link href="/dashboard" className="block">
              <Button className="w-full">Start Pro Trial</Button>
            </Link>
          </div>
        </div>

        {/* Pricing Details */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            Pricing Details
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  What counts as a concurrent user?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You only pay for team members who are actively logged in at the same time. If you
                  have 10 team members but only 5 are ever online simultaneously, you only pay for 5
                  users.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  How does project pricing work?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  The Pro tier includes unlimited projects. The Free tier is limited to 1 project,
                  perfect for personal use or trying out the platform.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Can I upgrade or downgrade anytime?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes! You can upgrade to Pro at any time to unlock all features. Downgrading to
                  Free will limit you to 1 project and basic features.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  The Free tier is available forever with no credit card required. You can also try
                  the Pro tier features in our demo environment before committing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Feature Comparison
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Free
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <ComparisonRow feature="Projects" free="1" pro="Unlimited" />
                <ComparisonRow feature="Task Management" free="✓" pro="✓" />
                <ComparisonRow feature="Team Members" free="1" pro="Unlimited" />
                <ComparisonRow feature="Milestone Timeline" free="—" pro="✓" />
                <ComparisonRow feature="Bug Tracking" free="—" pro="✓" />
                <ComparisonRow feature="Feature Requests" free="—" pro="✓" />
                <ComparisonRow feature="Team Chat" free="—" pro="✓" />
                <ComparisonRow feature="Real-time Updates" free="—" pro="✓" />
                <ComparisonRow feature="Public Voting" free="—" pro="✓" />
                <ComparisonRow feature="Environment Variables" free="—" pro="✓" />
                <ComparisonRow feature="Role-based Access" free="—" pro="✓" />
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join teams already using Worklamp to streamline their development workflow.
          </p>
          <Link href="/dashboard" className="inline-block">
            <Button size="lg">Start Free Today</Button>
          </Link>
        </div>
      </div>
    </MarketingLayout>
  );
}

interface FeatureProps {
  children: React.ReactNode;
  included?: boolean;
}

function Feature({ children, included = false }: FeatureProps) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
          included
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-600'
        }`}
      >
        {included ? '✓' : '×'}
      </span>
      <span
        className={
          included
            ? 'text-gray-900 dark:text-gray-100'
            : 'text-gray-500 dark:text-gray-500 line-through'
        }
      >
        {children}
      </span>
    </li>
  );
}

interface ComparisonRowProps {
  feature: string;
  free: string;
  pro: string;
}

function ComparisonRow({ feature, free, pro }: ComparisonRowProps) {
  return (
    <tr>
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{feature}</td>
      <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-400">{free}</td>
      <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-400">{pro}</td>
    </tr>
  );
}
