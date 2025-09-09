/**
 * Tailwind CSS Configuration for Triton Food Works Agricultural Dashboard
 * 
 * This configuration file customizes Tailwind CSS for the agricultural dashboard,
 * providing a modern design system with agricultural-themed colors, animations,
 * and responsive design utilities.
 * 
 * Key Features:
 * - Dark mode support with class-based switching
 * - Custom color palette using CSS variables for theming
 * - Agricultural-themed gradient animations
 * - Responsive container system
 * - Custom border radius system
 * - shadcn/ui compatible design tokens
 * 
 * @type {import('tailwindcss').Config}
 * @author Triton Food Works
 * @version 1.0.0
 */
module.exports = {
  // Enable dark mode using class-based strategy
  // Usage: <html class="dark"> for dark mode
  darkMode: ["class"],
  
  // Content paths - tells Tailwind where to look for class names
  // Covers all possible file locations in Next.js project structure
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',     // Pages directory (if using Pages Router)
    './components/**/*.{js,ts,jsx,tsx,mdx}', // Components directory
    './app/**/*.{js,ts,jsx,tsx,mdx}',       // App directory (App Router)
    './src/**/*.{ts,tsx}',                  // Source directory
  ],
  // No prefix for utility classes (default behavior)
  prefix: "",
  
  theme: {
    // Container configuration for responsive layout
    container: {
      center: true,           // Center containers by default
      padding: "2rem",        // Add horizontal padding
      screens: {
        "2xl": "1400px",      // Custom max-width for 2xl breakpoint
      },
    },
    
    // Extend default Tailwind theme with custom values
    extend: {
      // Custom color system using CSS variables for dynamic theming
      // Colors can be changed at runtime by modifying CSS variables
      colors: {
        // Base UI colors - using HSL format with CSS variables
        border: "hsl(var(--border))",           // Border color for dividers, cards
        input: "hsl(var(--input))",             // Input field background
        ring: "hsl(var(--ring))",               // Focus ring color
        background: "hsl(var(--background))",   // Page background
        foreground: "hsl(var(--foreground))",   // Text color
        
        // Primary brand color - green theme for agricultural focus
        primary: {
          DEFAULT: "hsl(var(--primary))",       // Main brand color
          foreground: "hsl(var(--primary-foreground))", // Text on primary
        },
        // Secondary color - earth tones for agricultural theme
        secondary: {
          DEFAULT: "hsl(var(--secondary))",     // Secondary brand color
          foreground: "hsl(var(--secondary-foreground))", // Text on secondary
        },
        
        // Destructive/error colors - red tones for warnings and errors
        destructive: {
          DEFAULT: "hsl(var(--destructive))",   // Error/danger color
          foreground: "hsl(var(--destructive-foreground))", // Text on error
        },
        
        // Muted colors - subtle background and text colors
        muted: {
          DEFAULT: "hsl(var(--muted))",         // Subtle background
          foreground: "hsl(var(--muted-foreground))", // Subtle text
        },
        // Accent colors - highlight and emphasis colors
        accent: {
          DEFAULT: "hsl(var(--accent))",        // Accent color for highlights
          foreground: "hsl(var(--accent-foreground))", // Text on accent
        },
        
        // Popover/dropdown colors
        popover: {
          DEFAULT: "hsl(var(--popover))",       // Popover background
          foreground: "hsl(var(--popover-foreground))", // Popover text
        },
        
        // Card colors - primary component background
        card: {
          DEFAULT: "hsl(var(--card))",          // Card background
          foreground: "hsl(var(--card-foreground))", // Card text
        },
      },
      
      // Custom border radius system using CSS variables
      // Allows for consistent rounded corners throughout the app
      borderRadius: {
        lg: "var(--radius)",                    // Large radius (8px default)
        md: "calc(var(--radius) - 2px)",       // Medium radius (6px default)
        sm: "calc(var(--radius) - 4px)",       // Small radius (4px default)
      },
      
      // Custom animations for enhanced user experience
      // Includes agricultural-themed transitions and micro-interactions
      animation: {
        // Custom dashboard animations
        'slide-in-right': 'slideInRight 0.3s ease-out',  // Cards sliding in
        'fade-in': 'fadeIn 0.2s ease-in-out',            // Gentle fade transitions
        'scale-in': 'scaleIn 0.2s ease-out',             // Scale up animations
        
        // shadcn/ui accordion animations
        "accordion-down": "accordion-down 0.2s ease-out", // Expand animation
        "accordion-up": "accordion-up 0.2s ease-out",     // Collapse animation
      },
      
      // Keyframe definitions for custom animations
      // Each keyframe defines the animation steps for smooth transitions
      keyframes: {
        // Slide in from right - used for dashboard cards appearing
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },  // Start off-screen right
          '100%': { transform: 'translateX(0)', opacity: '1' },   // End in position
        },
        
        // Simple fade in - used for content loading
        fadeIn: {
          '0%': { opacity: '0' },      // Start transparent
          '100%': { opacity: '1' },    // End fully visible
        },
        
        // Scale in with fade - used for interactive elements
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },  // Start slightly smaller
          '100%': { transform: 'scale(1)', opacity: '1' },  // End normal size
        },
        // Accordion animations for collapsible content (shadcn/ui)
        "accordion-down": {
          from: { height: "0" },                                    // Start collapsed
          to: { height: "var(--radix-accordion-content-height)" },  // Expand to content height
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" }, // Start expanded
          to: { height: "0" },                                       // Collapse to zero
        },
      },
    },
  },
  
  // Plugins extend Tailwind's functionality
  plugins: [
    require("tailwindcss-animate"),  // Adds animation utilities and improved keyframes
  ],
}

/**
 * CSS Variables Usage:
 * 
 * The color system relies on CSS variables defined in globals.css:
 * - Light mode: Default color values
 * - Dark mode: Alternative values under .dark class
 * 
 * Example usage:
 * - bg-background: Uses var(--background)
 * - text-foreground: Uses var(--foreground)
 * - border-border: Uses var(--border)
 * 
 * Animation classes:
 * - animate-fade-in: Gentle fade in effect
 * - animate-slide-in-right: Slide from right
 * - animate-scale-in: Scale up with fade
 * 
 * Responsive breakpoints:
 * - sm: 640px  (Small devices)
 * - md: 768px  (Medium devices)
 * - lg: 1024px (Large devices)
 * - xl: 1280px (Extra large)
 * - 2xl: 1400px (Custom max width)
 */

