/**
 * Root Layout Component for Triton Food Works Agricultural Dashboard
 * 
 * This is the root layout that wraps all pages in the Next.js App Router.
 * It defines the basic HTML structure, metadata, fonts, and global styles
 * for the entire agricultural dashboard application.
 * 
 * Key Features:
 * - Google Fonts integration (Inter font family)
 * - Global CSS and Tailwind styles
 * - SEO metadata configuration
 * - Responsive viewport setup
 * - Custom favicon with agricultural branding
 * - Full-height layout optimization
 * 
 * @author Triton Food Works
 * @version 1.0.0
 */

import { Inter } from 'next/font/google'
import React from "react";
import "./globals.css";

/**
 * Google Fonts Configuration - Inter Font Family
 * 
 * Inter is a modern, highly readable typeface designed for digital interfaces.
 * It's optimized for UI design and provides excellent readability across
 * different screen sizes and resolutions.
 * 
 * Benefits for Agricultural Dashboard:
 * - Excellent readability for data-heavy interfaces
 * - Professional appearance for business applications
 * - Good performance with variable font loading
 * - Wide character support including numbers and symbols
 * - Consistent rendering across different browsers
 * 
 * Configuration:
 * - subsets: ['latin'] - Loads Latin character set (covers English)
 * - Automatic font optimization by Next.js
 * - Self-hosted font files for better performance
 * - Preloaded font for faster rendering
 */
const inter = Inter({ subsets: ['latin'] })

/**
 * Metadata Configuration for SEO and Social Sharing
 * 
 * Defines how the application appears in search engines,
 * social media platforms, and browser tabs.
 * 
 * SEO Benefits:
 * - Clear, descriptive title for search engines
 * - Informative description for search results
 * - Better discoverability for agricultural businesses
 * - Professional branding in browser tabs
 */
export const metadata = {
  // Page title - appears in browser tab and search results
  title: "Triton Food Works Masterbook",
  
  // Meta description - appears in search engine results
  // Optimized for agricultural business searches
  description: "Real-time Excel Dashboard with Two-way Sync",
};

/**
 * Root Layout Component
 * 
 * This component wraps all pages and provides the basic HTML structure.
 * It's rendered once and shared across all routes in the application.
 * 
 * Props:
 * @param children - The page content to be rendered inside the layout
 * 
 * Layout Structure:
 * - HTML document with language specification
 * - Head section with viewport and favicon
 * - Body with font, styling, and content area
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;  // TypeScript type for React components/elements
}) {
  return (
    // HTML root element with language attribute for accessibility
    <html lang="en">
      <head>
        {/* 
          Responsive Viewport Configuration
          
          Ensures proper rendering and touch zooming on mobile devices:
          - width=device-width: Use device's actual width
          - initial-scale=1: Set initial zoom level to 100%
          
          Critical for agricultural dashboard mobile accessibility:
          - Field workers can access data on mobile devices
          - Touch-friendly interface scaling
          - Proper text size on different screen sizes
        */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* 
          Custom Favicon with SVG and Emoji
          
          Creates a favicon using SVG and emoji for branding:
          - 🏢 Building emoji represents agricultural business
          - SVG format for crisp rendering at any size
          - Data URI for embedded favicon (no external file needed)
          - Professional appearance in browser tabs
          
          Benefits:
          - Instant recognition in browser tabs
          - Agricultural/business theme consistency
          - No additional HTTP request for favicon
          - Works across all modern browsers
        */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏢</text></svg>" />
      </head>
      
      {/* 
        Body Element with Styling and Font
        
        Key styling decisions:
        - Inter font family for professional appearance
        - Zero margin/padding for full-screen layout
        - Minimum height of 100vh for full viewport coverage
        - Clean, minimal base styling
      */}
      <body 
        className={inter.className}  // Apply Inter font from Google Fonts
        style={{ 
          margin: 0,           // Remove default browser margins
          padding: 0,          // Remove default browser padding
          minHeight: "100vh"   // Ensure full viewport height coverage
        }}
      >
        {/* 
          Children Content Area
          
          This is where all page content gets rendered:
          - Dashboard components
          - Data tables and charts
          - Forms and interactive elements
          - Loading states and error boundaries
          
          The layout provides the foundation while children
          provide the specific page content.
        */}
        {children}
      </body>
    </html>
  );
}

/**
 * Layout Behavior and Features:
 * 
 * 1. Font Loading:
 *    - Inter font is preloaded for optimal performance
 *    - Font display is optimized to prevent layout shift
 *    - Fallback fonts ensure text visibility during loading
 * 
 * 2. Responsive Design:
 *    - Viewport meta tag enables proper mobile scaling
 *    - CSS Grid and Flexbox work correctly across devices
 *    - Touch targets are appropriately sized
 * 
 * 3. Performance:
 *    - Minimal inline styles for faster rendering
 *    - CSS is loaded from globals.css for caching
 *    - Font optimization reduces cumulative layout shift
 * 
 * 4. SEO Optimization:
 *    - Semantic HTML structure
 *    - Proper meta tags for search engines
 *    - Language attribute for accessibility
 * 
 * 5. Accessibility:
 *    - Language attribute for screen readers
 *    - Proper font sizing and contrast
 *    - Mobile-friendly touch targets
 * 
 * 6. Agricultural Dashboard Integration:
 *    - Full-height layout accommodates dashboard components
 *    - Professional styling suitable for business use
 *    - Mobile optimization for field data entry
 *    - Branding consistency with agricultural theme
 * 
 * Usage in Dashboard:
 * - This layout wraps the main dashboard page (page.tsx)
 * - Provides consistent branding across all routes
 * - Ensures proper mobile responsiveness
 * - Maintains professional appearance for business users
 */

