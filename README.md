# BeepRunner 🏃‍♂️

BeepRunner is a specialized shuttle run timer app built with Expo React Native. It provides both Standard Beep Test (20m regulation) and Personal Beep Test (customizable for any space) modes for effective cardiovascular endurance training.

## Features

- **Standard Beep Test**: Regulation 20m shuttle run with fixed 9-level progression
- **Personal Beep Test**: Space-calibrated version with adaptive difficulty  
- **Audio Cues**: Professional beep sounds and voice guidance
- **Progress Tracking**: Workout history and personal best tracking
- **Cross-Platform**: iOS, Android, and web support

## Get Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Testing

BeepRunner includes a comprehensive test suite to ensure reliability and prevent regressions.

```bash
# Run all tests
npm run test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

For detailed testing information, see [TESTING.md](./TESTING.md).

## Development

This project follows test-driven development practices. All features must include corresponding tests and pass quality gates before completion.

- **Code Quality**: ESLint with Expo configuration
- **Testing**: Jest with React Native Testing Library
- **Coverage**: 80%+ overall, 90%+ for business logic
- **Documentation**: Comprehensive guides in CLAUDE.md and PRD.md

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
