# AgentPlate

A modern web application boilerplate built with Next.js 13+, featuring authentication, role-based access control, and agent framework integration.

## Features

### Authentication
- Secure authentication with Supabase
- Email/password authentication
- Password reset functionality
- Session management with "Remember Me" option
- Protected routes
- Email verification support

### Role-Based Access Control (RBAC)
- Default roles (user, admin)
- Automatic role assignment for new users
- Role-based route protection
- Row Level Security (RLS) policies
- Admin-only role management

### Modern Stack
- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- Supabase Backend
- Server Components
- API Routes

### Developer Experience
- Agent Framework Integration
- User Management
- Workflow Management
- Development Tools

## Test Accounts

The system comes with pre-configured test accounts:

### Admin Account
- Email: admin@admin.com
- Password: password
- Role: Administrator
- Access: Full system access including user management and admin panel

### Test User Account
- Email: user@user.com
- Password: password
- Role: Standard User
- Access: Basic user features and dashboard

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- Supabase account
- Supabase CLI (for database setup)

### Environment Variables
Create a `.env.local` file with:

```env
# Required for authentication
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Required for admin operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
Installation
Clone the repository:
git clone https://github.com/yourusername/agentplate.git
cd agentplate
Install dependencies:
npm install
Set up the database schema and roles:
npm run setup-roles
Start the development server:
npm run dev
Project Structure
src/
├── app/                    # Next.js 13+ App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── signup/        # Signup page
│   │   ├── forgot-password/ # Password reset request
│   │   └── reset-password/  # Password reset confirmation
│   ├── api/               # API routes
│   │   └── auth/          # Authentication endpoints
│   └── (protected)/       # Protected routes
│       ├── user/          # User dashboard
│       └── admin/         # Admin panel
├── hooks/                 # Custom React hooks
│   └── useAuth.ts        # Authentication hook
├── lib/                  # Utility functions
│   ├── supabase.ts      # Supabase client
│   └── roles.ts         # Role management
└── middleware.ts        # Auth middleware

scripts/
├── setup-roles.sql      # Database schema setup
├── create-admin.ts      # Admin user creation
└── create-test-accounts.js # Test account setup
Available Scripts
npm run dev - Start development server
npm run build - Build for production
npm start - Start production server
npm run lint - Run linting
npm run setup-roles - Initialize database schema and roles
npm run create-admin - Create an admin user
npm run create-accounts - Create test accounts
Authentication Flow
Users can sign up with email/password
New users automatically get the 'user' role
Email verification (optional)
Login with email/password
Password reset available via email
"Remember Me" option for persistent sessions
Role-Based Access
User Role: Default role for all registered users
Access to user dashboard
Profile management
Agent management
Admin Role: Administrative access
User management
Role management
System settings
Access to admin panel
Security Features
Row Level Security (RLS) policies
Role-based route protection
Secure session management
Password reset flow
Admin-only operations protection
Contributing
Fork the repository
Create your feature branch
Commit your changes
Push to the branch
Create a new Pull Request
License
This project is licensed under the MIT License - see the LICENSE file for details.


You can copy this entire content and update your README.md file with it. Would you like me to explain any part of it?
