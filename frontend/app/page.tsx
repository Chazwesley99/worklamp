'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { SignupModal } from '@/components/auth/SignupModal';
import { LoginModal } from '@/components/auth/LoginModal';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Project Management Built for Developers
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Streamline your development workflow with task tracking, bug management, team
            collaboration, and real-time updates—all in one place.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button size="lg" onClick={() => setShowSignup(true)} className="px-8 py-3">
              Get Started Free
            </Button>
            <Link
              href="/pricing"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
            >
              View Pricing
            </Link>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            title="Task Management"
            description="Organize work with categories, priorities, and milestone tracking. Keep your team aligned on what matters most."
            icon="✓"
          />
          <FeatureCard
            title="Bug Tracking"
            description="Report bugs with screenshots, track progress, and enable public voting to prioritize fixes."
            icon="🐛"
          />
          <FeatureCard
            title="Feature Requests"
            description="Collect ideas from your team and users. Vote on features to build what matters most."
            icon="💡"
          />
          <FeatureCard
            title="Team Collaboration"
            description="Real-time chat channels with permission controls. Keep conversations organized by project."
            icon="💬"
          />
          <FeatureCard
            title="Milestone Timeline"
            description="Visualize project phases with timeline views. Lock versions and track change orders."
            icon="📅"
          />
          <FeatureCard
            title="Real-Time Updates"
            description="See changes instantly without refreshing. Stay in sync with your team automatically."
            icon="⚡"
          />
        </div>

        {/* Benefits Section */}
        <div className="mt-24 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Why Development Teams Choose Worklamp
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Self-Hosted Security
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All services run on your infrastructure. Your data stays under your control with
                  local authentication and optional cloud storage.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Real-Time Collaboration
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  See updates instantly as your team works. No more refreshing pages or missing
                  important changes.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Role-Based Access
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Granular permissions for owners, admins, developers, and auditors. Control who
                  sees what.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Developer-Focused
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Built by developers, for developers. Minimal clicks, keyboard shortcuts, and
                  efficient workflows.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Ready to streamline your workflow?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Start with our free tier. No credit card required.
          </p>
          <Button size="lg" onClick={() => setShowSignup(true)} className="px-8 py-3">
            Get Started Free
          </Button>
        </div>
      </div>

      {/* Auth Modals */}
      <SignupModal
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        onSwitchToLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
      />
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
        }}
      />
    </MarketingLayout>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
