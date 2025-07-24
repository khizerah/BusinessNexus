# Business Nexus - Networking Platform

## Overview

Business Nexus is a networking platform designed to connect entrepreneurs and investors. The application features a full-stack architecture with separate dashboards for investors and entrepreneurs, real-time messaging capabilities, profile management, and collaboration request functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monolithic full-stack architecture with clear separation between frontend and backend concerns:

- **Frontend**: React.js with TypeScript, using Vite for development and building
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket integration for live messaging
- **UI Framework**: Shadcn/ui components with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management, React Context for auth
- **Routing**: Wouter for client-side routing

## Key Components

### Frontend Architecture
- **Component Structure**: Uses Shadcn/ui design system with custom components
- **Pages**: Role-based dashboards, authentication, profiles, and chat functionality
- **Styling**: Tailwind CSS with CSS variables for theming
- **Type Safety**: Full TypeScript implementation with shared types

### Backend Architecture
- **API Structure**: RESTful endpoints with Express.js
- **Authentication**: Session-based authentication with bcrypt password hashing
- **WebSocket Server**: Real-time messaging using WebSocket Server
- **Database Layer**: Drizzle ORM with connection pooling via Neon serverless

### Database Schema
- **Users**: Core user data with role differentiation (investor/entrepreneur)
- **Profiles**: Extended profile information with role-specific fields
- **Collaboration Requests**: Connection requests between users
- **Messages**: Chat system with user-to-user messaging

## Data Flow

1. **Authentication Flow**: Users register/login → Session created → Role-based dashboard redirect
2. **Dashboard Flow**: Role-specific data fetching → Display relevant users/requests
3. **Messaging Flow**: WebSocket connection → Real-time message exchange
4. **Collaboration Flow**: Request creation → Status management → Acceptance/Decline

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection via Neon
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **drizzle-orm**: Type-safe database ORM
- **bcrypt**: Password hashing
- **ws**: WebSocket implementation

### Development Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Backend bundling for production

## Deployment Strategy

The application is configured for deployment with:

- **Build Process**: Vite builds frontend to `dist/public`, ESBuild bundles backend to `dist`
- **Environment Variables**: Database URL configuration required
- **Production Setup**: Single server deployment with static file serving
- **Development Mode**: Vite dev server with HMR and Replit integration

### Key Architectural Decisions

1. **Monolithic Structure**: Chosen for rapid development and simplified deployment over microservices
2. **Session-based Auth**: Simpler implementation than JWT for this use case
3. **Drizzle ORM**: Type-safe database operations with good PostgreSQL support
4. **WebSocket for Chat**: Real-time messaging requirements over polling
5. **Shared Types**: Common type definitions between frontend and backend for consistency
6. **Role-based Routing**: Clear separation of investor and entrepreneur experiences

The application prioritizes developer experience with hot reloading, type safety, and clear separation of concerns while maintaining a simple deployment model suitable for prototyping and small-scale production use.