/**
 * Responsive utility functions and constants
 * Use these for consistent responsive behavior across the app
 */

export const BREAKPOINTS = {
  sm: 640,   // Small devices (landscape phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024, // Large devices (desktops)
  xl: 1280, // Extra large devices
  '2xl': 1536, // 2X large devices
};

/**
 * Common responsive class patterns
 */
export const RESPONSIVE_CLASSES = {
  // Container padding
  containerPadding: 'px-4 sm:px-6 lg:px-8',
  
  // Grid layouts
  grid1: 'grid grid-cols-1',
  grid2: 'grid grid-cols-1 sm:grid-cols-2',
  grid3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  grid4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  
  // Flex layouts
  flexRow: 'flex flex-col sm:flex-row',
  flexCol: 'flex flex-col',
  
  // Text sizes
  heading1: 'text-2xl sm:text-3xl lg:text-4xl',
  heading2: 'text-xl sm:text-2xl lg:text-3xl',
  heading3: 'text-lg sm:text-xl lg:text-2xl',
  body: 'text-sm sm:text-base',
  
  // Spacing
  sectionGap: 'space-y-4 sm:space-y-6 lg:space-y-8',
  cardGap: 'gap-4 sm:gap-6',
  
  // Buttons
  button: 'px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base',
  buttonFull: 'w-full sm:w-auto',
};

/**
 * Check if current viewport is mobile
 */
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.md;
};

/**
 * Check if current viewport is tablet
 */
export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
};

/**
 * Check if current viewport is desktop
 */
export const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.lg;
};

