import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">Worklamp</span>
            </div>
            <nav className="flex gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Profile
              </Link>
              <Link
                href="/team"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Team
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">Worklamp</h1>
          <p className="text-2xl text-gray-600 dark:text-gray-400 mb-12">
            Project Management Platform for Development Teams
          </p>

          <div className="flex justify-center gap-4 mb-16">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/projects"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              View Projects
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            title="Project Management"
            description="Create and manage multiple projects with team collaboration"
            icon="📁"
            href="/projects"
            status="Available"
          />
          <FeatureCard
            title="User Profiles"
            description="Manage your profile, avatar, and account settings"
            icon="👤"
            href="/profile"
            status="Available"
          />
          <FeatureCard
            title="Team Management"
            description="Invite team members and manage roles and permissions"
            icon="👥"
            href="/team"
            status="Available"
          />
          <FeatureCard
            title="Task Management"
            description="Track tasks with categories, priorities, and assignments"
            icon="✓"
            href="/tasks"
            status="Coming Soon"
          />
          <FeatureCard
            title="Bug Tracking"
            description="Report and track bugs with images and voting"
            icon="🐛"
            href="/bugs"
            status="Coming Soon"
          />
          <FeatureCard
            title="Feature Requests"
            description="Collect and prioritize feature requests from your team"
            icon="💡"
            href="/features"
            status="Coming Soon"
          />
        </div>

        {/* Current Implementation Status */}
        <div className="mt-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            ✅ Currently Implemented Features
          </h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <div>
                <strong>Authentication System:</strong> Email/password and Google OAuth login
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <div>
                <strong>User Profile Management:</strong> Update profile, change password, upload
                avatar
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <div>
                <strong>Tenant & Team Management:</strong> Create tenants, invite members, manage
                roles
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <div>
                <strong>Project Management:</strong> Full CRUD operations, project settings,
                subscription limits
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <div>
                <strong>Dashboard Layout:</strong> Sidebar navigation, notification bell, responsive
                design
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              🚧 In Development
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tasks, Bugs, Features, Milestones, Team Chat, and more coming soon...
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Access
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/projects"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/profile"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Profile
            </Link>
            <Link
              href="/team"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Team
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  status: 'Available' | 'Coming Soon';
}

function FeatureCard({ title, description, icon, href, status }: FeatureCardProps) {
  const isAvailable = status === 'Available';

  return (
    <Link
      href={isAvailable ? href : '#'}
      className={`block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all ${
        isAvailable
          ? 'hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer'
          : 'opacity-60 cursor-not-allowed'
      }`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-3">{description}</p>
      <span
        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
          isAvailable
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
        }`}
      >
        {status}
      </span>
    </Link>
  );
}
