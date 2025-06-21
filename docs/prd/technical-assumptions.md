# Technical Assumptions

## Repository Structure: Monorepo

Single repository structure using Expo managed workflow enabling:
- Unified development experience across platforms
- Shared business logic and component library
- Streamlined build and deployment processes
- Integrated testing infrastructure

## Service Architecture

**Frontend-focused architecture** with local data persistence:
- React Native Expo application with file-based routing
- SQLite local database for offline-first operation
- Expo Audio for cross-platform audio management
- Component-based architecture with custom hooks for state management

## Testing Requirements

**Comprehensive testing strategy** ensuring application reliability:
- **Unit testing**: Jest framework targeting 90% coverage for business logic
- **Component testing**: React Native Testing Library for UI component verification
- **Integration testing**: End-to-end workflow validation with database operations
- **Performance testing**: Timer accuracy validation within ±50ms tolerance
- **Quality gates**: Mandatory test passage before feature completion

## Additional Technical Assumptions and Requests

- **Expo SDK**: Version 53+ ensuring access to latest React Native capabilities
- **TypeScript**: Strict mode enabled for type safety and developer experience
- **Database**: expo-sqlite for offline data persistence without external dependencies
- **Audio**: expo-audio replacing deprecated expo-av for modern audio management
- **Navigation**: Expo Router with file-based routing for predictable navigation patterns
- **State Management**: Custom React hooks avoiding heavy frameworks for MVP simplicity
- **Build System**: Expo EAS Build for production deployments with platform-specific optimizations
