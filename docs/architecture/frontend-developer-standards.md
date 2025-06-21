# Frontend Developer Standards

## Critical Coding Rules

1. **Type Safety**: Always use TypeScript interfaces for props and data models
2. **Hook Dependencies**: Include all dependencies in useEffect dependency arrays
3. **Memory Management**: Clean up timers, subscriptions, and event listeners
4. **Error Boundaries**: Wrap critical components with error handling
5. **Accessibility**: Include testID for testing and accessibilityLabel for screen readers
6. **Performance**: Use React.memo() for expensive component re-renders
7. **Theme Compliance**: Always use ThemedText/ThemedView for consistent styling
8. **Mode Awareness**: Components should adapt to Personal/Standard mode contexts

## Quick Reference

```bash