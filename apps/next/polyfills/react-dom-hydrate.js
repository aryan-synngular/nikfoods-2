/**
 * Polyfill for react-dom/hydrate which was removed in React 19
 * This provides a compatibility layer for react-native-web
 */

import { hydrateRoot } from 'react-dom/client';

// Export a function that mimics the old hydrate API
export default function hydrate(element, container) {
  // hydrateRoot is the React 19 replacement for hydrate
  hydrateRoot(container, element);
  return null;
}

// Also export as named export for different import styles
export { hydrate };
