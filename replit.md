# AI Receptionist SaaS Platform

## Overview

This is a full-stack, multi-tenant SaaS platform for AI receptionists built with modern web technologies. The platform handles inbound calls using Vapi.ai voice agents, captures leads, and notifies business owners via SMS through Twilio. It features a secure dashboard for managing AI agents, viewing leads, and configuring business settings.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **API Design**: RESTful endpoints with middleware-based authentication

### Database Architecture
- **Primary Database**: PostgreSQL via Neon Database with connection pooling
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Management**: Drizzle Kit for migrations and schema synchronization

## Key Components

### Authentication System
- **Provider**: Replit Auth using OpenID Connect protocol
- **Session Storage**: PostgreSQL sessions table for scalability
- **User Management**: Database-backed user profiles with business settings
- **Security**: Secure session cookies with HTTPS enforcement

### AI Voice Agent Integration
- **Service**: Vapi.ai for voice AI capabilities
- **Configuration**: Dynamic agent setup with custom prompts, voices, and FAQs
- **Webhook Handling**: Real-time call event processing and lead capture
- **Phone Numbers**: Vapi-managed phone numbers for each business

### Lead Management System
- **Capture**: Automatic lead extraction from voice calls
- **Storage**: PostgreSQL leads table with comprehensive data fields
- **Features**: Lead favoriting, filtering, and search capabilities
- **Notifications**: SMS alerts via Twilio for new leads

### SMS Notification Service
- **Provider**: Twilio Messaging API
- **Features**: Formatted lead notifications with call recordings
- **Delivery**: Real-time SMS alerts to business owners
- **Fallback**: Configurable backup notification delays

### File Storage
- **Recordings**: Local file system storage in `/recordings/` directory
- **Upload Handling**: Multer middleware for file uploads
- **Access Control**: Authenticated access to recording files

## Data Flow

### Call Handling Flow
1. Inbound call received by Vapi phone number
2. Vapi AI agent processes call using custom business prompts
3. Lead information captured during conversation
4. Webhook notification sent to platform endpoint
5. Lead data stored in PostgreSQL database
6. SMS notification sent to business owner via Twilio
7. Call recording saved to local storage

### User Authentication Flow
1. User initiates login via Replit Auth
2. OpenID Connect authentication with Replit
3. User session created and stored in PostgreSQL
4. JWT tokens managed for API access
5. Session validation on protected routes

### Dashboard Data Flow
1. React Query fetches data from Express API endpoints
2. Authentication middleware validates user sessions  
3. Database queries executed via Drizzle ORM
4. JSON responses returned to frontend
5. UI updates reactively with TanStack Query

## External Dependencies

### Core Services
- **Vapi.ai**: Voice AI agent platform for call handling
- **Twilio**: SMS messaging service for notifications
- **Neon Database**: Managed PostgreSQL hosting
- **Replit Auth**: Authentication and user management

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and developer experience
- **Drizzle**: Database ORM and schema management
- **ESBuild**: Production bundling for server code

### UI Framework
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide Icons**: Consistent icon library

## Deployment Strategy

### Development Environment
- **Runtime**: Replit development environment
- **Hot Reload**: Vite HMR for frontend, tsx for backend
- **Database**: Neon Database with development credentials
- **File Storage**: Local filesystem in Replit container

### Production Build
- **Frontend**: Vite build to `dist/public` directory
- **Backend**: ESBuild bundle to `dist/index.js`
- **Static Assets**: Served by Express in production mode
- **Process Management**: Single Node.js process handling both API and static files

### Environment Configuration
- **Variables**: Database URL, API keys, session secrets
- **Security**: HTTPS enforcement, secure cookies, CORS configuration
- **Monitoring**: Request logging and error handling middleware

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```