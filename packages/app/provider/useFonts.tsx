/**
 * Simple hook that always returns true since we're using default system fonts
 * and not loading any custom fonts.
 */
export function useFonts() {
  // Always return true since we're not loading any custom fonts
  return true;
}
