/**
 * Next.js Configuration for Triton Food Works Agricultural Dashboard
 * 
 * This configuration file sets up Next.js for optimal performance and development
 * experience for the agricultural dashboard application.
 * 
 * Key Features:
 * - React Strict Mode for better development experience
 * - Optimized for Google Sheets integration
 * - Ready for Vercel deployment
 * - Production-ready optimizations
 * 
 * @type {import('next').NextConfig}
 * @author Triton Food Works
 * @version 1.0.0
 */
const nextConfig = {
  /**
   * Enable React Strict Mode
   * 
   * React Strict Mode is a development tool that:
   * - Identifies components with unsafe lifecycles
   * - Warns about legacy string ref API usage
   * - Warns about deprecated findDOMNode usage
   * - Detects unexpected side effects
   * - Helps ensure components are reusable
   * 
   * Benefits for agricultural dashboard:
   * - Better error handling for real-time data updates
   * - Improved component reliability for financial calculations
   * - Enhanced debugging for Google Sheets integration
   */
  reactStrictMode: true,

  /**
   * Additional configuration options that could be added:
   * 
   * Performance optimizations:
   * - swcMinify: true (faster minification)
   * - compress: true (gzip compression)
   * 
   * Image optimization:
   * - images: { domains: ['docs.google.com'] }
   * 
   * Environment variables:
   * - env: { CUSTOM_KEY: process.env.CUSTOM_KEY }
   * 
   * Bundle analysis:
   * - webpack configuration for bundle analyzer
   * 
   * Security headers:
   * - headers() function for CSP and security
   * 
   * API routes:
   * - Custom API route configuration
   */
};

export default nextConfig;

/**
 * Usage Notes:
 * 
 * 1. Development Mode:
 *    - Run: npm run dev
 *    - Hot reloading enabled
 *    - React DevTools support
 *    - Error overlay for debugging
 * 
 * 2. Production Build:
 *    - Run: npm run build
 *    - Automatic code splitting
 *    - Image optimization
 *    - Static generation where possible
 * 
 * 3. Vercel Deployment:
 *    - Automatic deployment on git push
 *    - Environment variables configured in dashboard
 *    - Edge functions support
 *    - Global CDN distribution
 * 
 * 4. Google Sheets Integration:
 *    - Client-side data fetching
 *    - Published sheets support
 *    - XLSX parsing capabilities
 *    - Real-time sync functionality
 */

