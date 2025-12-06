# Worklamp

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

A comprehensive project management and collaboration platform built specifically for development teams. Worklamp combines task tracking, bug management, feature requests, team communication, and AI-powered development workflows into a single, secure, self-hosted solution.

## DEMO INFO

Visit: https://worklamp.com

Sign Up with Google (easiest) or a valid email address.
If using email, verify your email and then log in.
You can work on one project and use all functions
The only limitations are the team functions (which are not in production yet)

## ✨ Key Features

### 🎯 Project Management

- **Multi-Project Support** - Manage multiple projects with tenant isolation
- **Milestone Tracking** - Visual timeline with version locking and change order management
- **Task Management** - Organize tasks by categories, priorities, and milestones
- **Custom Workflows** - Flexible status tracking (To Do, In Progress, Done)

### 🐛 Issue Tracking

- **Bug Tracking** - Report bugs with screenshots, URLs, and priority levels
- **Feature Requests** - Collect and prioritize feature ideas with voting
- **Public Access** - Optional public bug/feature tracking for community input
- **Vote System** - Let users vote on bugs and features to prioritize work

### 👥 Team Collaboration

- **Real-Time Chat** - Slack-like team communication with channels
- **Role-Based Access** - Owner, Admin, Developer, and Auditor roles
- **Team Invitations** - Email-based team member invitations
- **Live Updates** - WebSocket-powered real-time dashboard updates

### 🤖 AI-Powered Features

- **Bug Analysis** - AI-powered bug fix suggestions and solutions
- **Feature Specifications** - Auto-generate detailed feature specs
- **AI Agent Prompts** - Generate prompts for AI coding assistants
- **Spec File Integration** - Upload requirements, design, and task files for context

### 🔐 Security & Authentication

- **Multi-Tenant Architecture** - Complete data isolation between tenants
- **Email/Password Auth** - Secure local authentication with bcrypt
- **Google OAuth** - Single sign-on with Google accounts
- **JWT Sessions** - Secure token-based authentication with refresh tokens
- **Role-Based Permissions** - Granular access control for all features

### 📁 File & Configuration Management

- **Project Files** - Upload and manage project documentation
- **Environment Variables** - Secure, encrypted storage for dev/prod configs
- **Personal Notes** - Post-it style notes for quick reminders
- **Image Optimization** - Automatic image compression and optimization

### 📧 Communication

- **Email Notifications** - Notify admins of new bugs and feature requests
- **Email Verification** - Secure account activation
- **Newsletter System** - Built-in newsletter subscription management
- **MJML Templates** - Beautiful, responsive email templates

### 🎨 User Experience

- **Dark/Light Mode** - Theme toggle with localStorage persistence
- **Responsive Design** - Mobile-optimized interface
- **Real-Time Indicators** - Live connection status and "new" badges
- **Minimal UI** - Clean, efficient design with minimal clicks

### 🚀 Developer-Friendly

- **Self-Hosted** - Run on your own infrastructure
- **Docker Support** - Easy deployment with Docker Compose
- **REST API** - Well-documented RESTful API
- **WebSocket Events** - Real-time event system
- **TypeScript** - Full type safety across the stack
- **Property-Based Testing** - Comprehensive test coverage with fast-check

### 📊 Subscription Tiers

- **Free Tier** - 1 project, basic task management
- **Paid Tier** - Unlimited projects, team features, milestones, and chat

## Project Structure

This is a monorepo containing:

- **frontend/** - Next.js 14+ application with TypeScript and App Router
- **backend/** - Express.js API server with TypeScript
- **shared/** - Shared types, constants, and validators

## Prerequisites

- Node.js 20+ LTS
- PostgreSQL 15+
- Redis
- npm or yarn

## Getting Started

### Installation

```bash
# Install dependencies for all workspaces
npm install
```

### Environment Setup

1. Copy the example environment file in the backend:

```bash
cp backend/.env.example backend/.env
```

2. Update the environment variables in `backend/.env` with your configuration.

### Development

```bash
# Run both frontend and backend in development mode
npm run dev

# Run frontend only
npm run dev:frontend

# Run backend only
npm run dev:backend
```

The frontend will be available at http://localhost:3000
The backend API will be available at http://localhost:3001

### Building

```bash
# Build all workspaces
npm run build
```

### Testing

```bash
# Run tests for all workspaces
npm run test
```

### Linting and Formatting

```bash
# Lint all workspaces
npm run lint

# Format all files
npm run format
```

## Tech Stack

### Frontend

- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- React Query (TanStack Query)
- Zustand
- Socket.io-client
- Zod

### Backend

- Node.js 20+
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- Socket.io
- Passport.js
- JWT Authentication

### Testing

- Vitest
- React Testing Library
- Supertest
- fast-check (Property-Based Testing)

## Documentation

See the `/DOCS` directory for detailed documentation:

- API documentation: `/DOCS/api/`
- Testing documentation: `/DOCS/testing/`
- Deployment guides: `/DOCS/deployment/`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### What this means:

- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ⚠️ No warranty provided
- ⚠️ No liability accepted

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Acknowledgments

Built with modern web technologies and best practices for enterprise-grade project management.
