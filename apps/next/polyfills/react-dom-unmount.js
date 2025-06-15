/**
 * Polyfill for react-dom/unmountComponentAtNode which was removed in React 19
 * This provides a compatibility layer for react-native-web
 */

import { createRoot } from 'react-dom/client';

// Export a function that mimics the old unmountComponentAtNode API
export default function unmountComponentAtNode(container) {
  // In React 19, we can use createRoot and then unmount
  // This is a simple polyfill that may not handle all edge cases
  if (container._reactRootContainer) {
    return true;
  }
  
  try {
    const root = createRoot(container);
    root.unmount();
    return true;
  } catch (e) {
    console.error('Error unmounting component:', e);
    return false;
  }
}

// Also export as named export for different import styles
export { unmountComponentAtNode };
