# Minecraft Bedrock Addon Creator

## Overview

The Minecraft Bedrock Addon Creator is a comprehensive web-based development platform for creating custom Minecraft: Bedrock Edition addons. The application provides an intuitive interface for building entities, blocks, items, recipes, and other game content without requiring extensive JSON knowledge. It features visual builders, documentation, tutorials, and tools for packaging complete addon projects.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query for server state and local state with custom hooks
- **UI Components**: Radix UI primitives with shadcn/ui design system for consistent, accessible components
- **Styling**: Tailwind CSS with custom CSS variables for theming and dark mode support
- **Build Tool**: Vite for fast development and optimized production builds

### Component Structure
- **Builders**: Interactive form-based builders for entities, blocks, items, recipes, loot tables, biomes, spawn rules, and client entities
- **Tools**: Advanced utilities including texture creator with canvas manipulation, script studio for JavaScript development, addon packager for export, and JSON validator
- **Documentation**: Comprehensive guides covering core concepts, entity systems, block creation, item development, and scripting APIs
- **Tutorial System**: Interactive learning modules with step-by-step guidance and progress tracking

### Backend Architecture
- **Framework**: Express.js server with TypeScript
- **API Design**: RESTful endpoints for health checks, addon validation, and project management
- **Development Setup**: Vite middleware integration for hot module replacement during development
- **Error Handling**: Centralized error middleware with structured error responses

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: User management system with unique usernames and secure password storage
- **Local Storage**: Browser localStorage for persisting user preferences and work-in-progress addon data
- **Memory Storage**: In-memory storage implementation for development and testing scenarios

### Validation System
- **JSON Validation**: Comprehensive validation for all Minecraft addon file formats
- **Type Safety**: Zod schemas for runtime type checking and validation
- **Error Reporting**: Detailed validation feedback with specific error messages and suggestions

### Canvas and Graphics
- **Texture Creation**: Custom canvas-based image editor with layers, brushes, and drawing tools
- **Image Processing**: Client-side image manipulation and export capabilities
- **Grid System**: Pixel-perfect editing with customizable grid overlays

### Export and Packaging
- **Addon Structure**: Automatic generation of proper Minecraft addon folder structures
- **Manifest Generation**: Dynamic creation of behavior pack and resource pack manifests
- **File Bundling**: Complete addon packaging with proper file organization and compression

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database hosting with connection pooling
- **Database URL**: Environment-based configuration for database connections

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Fast JavaScript bundling for production builds
- **TypeScript**: Static type checking and compilation

### UI Libraries
- **Radix UI**: Unstyled, accessible component primitives for complex UI patterns
- **Lucide React**: Icon library providing consistent iconography
- **React Query**: Data fetching and caching library for server state management

### Styling and Theming
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Class Variance Authority**: Utility for creating variant-based component APIs
- **CLSX**: Conditional className utility for dynamic styling

### Canvas and Graphics
- **HTML5 Canvas**: Native browser canvas API for texture creation and editing
- **Custom Canvas Hooks**: React hooks for canvas state management and drawing operations

### Build and Development
- **Vite**: Fast build tool with hot module replacement and plugin ecosystem
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins
- **TSX**: TypeScript execution for development server

### Minecraft Integration
- **Minecraft Documentation**: Integration with official Minecraft: Bedrock Edition documentation
- **JSON Templates**: Pre-built templates for common addon patterns and structures
- **Validation Rules**: Minecraft-specific validation for addon file formats