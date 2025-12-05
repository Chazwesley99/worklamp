# Worklamp

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

Comprehensive project management and collaboration platform for development teams.

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
