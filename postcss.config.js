/**
 * PostCSS Configuration for Triton Food Works Agricultural Dashboard
 * 
 * PostCSS is a tool for transforming CSS with JavaScript plugins.
 * This configuration sets up the essential plugins for the agricultural dashboard
 * to ensure cross-browser compatibility and optimal CSS processing.
 * 
 * Key Features:
 * - Tailwind CSS integration for utility-first styling
 * - Autoprefixer for cross-browser CSS compatibility
 * - Optimized build process for production
 * 
 * @author Triton Food Works
 * @version 1.0.0
 */
module.exports = {
  plugins: {
    /**
     * Tailwind CSS Plugin
     * 
     * Processes Tailwind directives and generates utility classes.
     * 
     * What it does:
     * - Processes @tailwind base, components, utilities directives
     * - Generates utility classes based on tailwind.config.js
     * - Purges unused CSS in production for smaller bundle size
     * - Handles responsive breakpoints and state variants
     * 
     * Benefits for dashboard:
     * - Consistent spacing and typography system
     * - Responsive design utilities
     * - Agricultural-themed color palette
     * - Dark mode support
     * - Custom animations for data visualization
     */
    tailwindcss: {},

    /**
     * Autoprefixer Plugin
     * 
     * Automatically adds vendor prefixes to CSS properties
     * based on browser support requirements.
     * 
     * What it does:
     * - Adds -webkit-, -moz-, -ms- prefixes where needed
     * - Uses browserslist configuration or defaults
     * - Removes outdated prefixes automatically
     * - Optimizes CSS for target browsers
     * 
     * Benefits for dashboard:
     * - Ensures CSS animations work across browsers
     * - Grid layout compatibility for data tables
     * - Flexbox support for responsive cards
     * - Transform properties for smooth transitions
     * 
     * Supported browsers (default):
     * - Chrome >= 60
     * - Firefox >= 60
     * - Safari >= 12
     * - Edge >= 79
     */
    autoprefixer: {},
  },
}

/**
 * Processing Order:
 * 
 * 1. Tailwind CSS processes utility classes
 * 2. Autoprefixer adds vendor prefixes
 * 3. Next.js optimizes and minifies CSS
 * 4. Final CSS is served to browsers
 * 
 * File Processing:
 * - globals.css: Main stylesheet with Tailwind directives
 * - Component styles: Processed inline or as CSS modules
 * - shadcn/ui styles: Utility classes processed by Tailwind
 * 
 * Development vs Production:
 * - Development: Full CSS with debug info
 * - Production: Minified CSS with unused styles removed
 * 
 * Browser Support:
 * The configuration ensures compatibility with modern browsers
 * while maintaining performance and reducing bundle size.
 */
