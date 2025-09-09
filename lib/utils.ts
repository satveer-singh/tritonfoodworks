/**
 * Utility Functions Library
 * 
 * This module provides essential utility functions used throughout the
 * agricultural dashboard application. These utilities handle common
 * operations like CSS class merging and conditional styling.
 * 
 * The functions here are designed to be:
 * - Reusable across components
 * - Type-safe with TypeScript
 * - Performance optimized
 * - Framework agnostic
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Class Name Utility Function
 * 
 * Combines and merges CSS class names intelligently using clsx and
 * tailwind-merge libraries. This utility is essential for conditional
 * styling and dynamic class application in React components.
 * 
 * Features:
 * - **Conditional Classes**: Apply classes based on conditions
 * - **Tailwind Conflict Resolution**: Automatically resolves conflicting Tailwind classes
 * - **Type Safety**: Full TypeScript support for class name inputs
 * - **Performance**: Optimized class string generation
 * 
 * Example Usage:
 * ```typescript
 * cn('px-4 py-2', isActive && 'bg-blue-500', 'hover:bg-blue-600')
 * cn('text-sm', { 'font-bold': isBold, 'text-red-500': hasError })
 * ```
 * 
 * @param inputs - Variable arguments of class values (strings, objects, arrays)
 * @returns Merged and optimized class name string
 * 
 * Technical Details:
 * - Uses `clsx` for conditional class handling and normalization
 * - Uses `twMerge` to resolve Tailwind CSS class conflicts intelligently
 * - Handles various input types: strings, objects, arrays, booleans
 * - Removes duplicate classes and resolves Tailwind utility conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
