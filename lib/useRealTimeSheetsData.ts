/**
 * Real-Time Google Sheets Data Hook
 * 
 * Custom React hook that provides real-time data fetchi      const startTime = Date.now();
      console.log(`🔄 [useRealTimeSheetsData] ${isRefresh ? 'Refreshing' : 'Loading'} sheets data (attempt ${attempt})...`); from Google Sheets
 * with automatic refresh capabilities. This hook enables dashboard components
 * to stay synchronized with the latest data from Google Sheets.
 * 
 * Features:
 * 1. **Automatic Refresh**: Periodic data fetching at configurable intervals
 * 2. **Manual Refresh**: On-demand data refresh functionality
 * 3. **Loading States**: Comprehensive loading and error state management
 * 4. **Connection Status**: Real-time connection health monitoring
 * 5. **Performance Tracking**: Fetch time monitoring and optimization
 * 6. **Error Recovery**: Automatic retry logic with exponential backoff
 * 
 * This hook abstracts the complexity of real-time data management,
 * providing a simple interface for components to access fresh data.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook State Interface
 * 
 * Defines the structure of data and state returned by the hook
 */
interface SheetsDataHook {
  data: any;                    // Current sheets data
  loading: boolean;             // Initial loading state
  error: string | null;         // Error message if any
  refreshing: boolean;          // Refresh in progress state
  lastUpdated: string;          // Last successful update timestamp
  connectionStatus: 'connected' | 'disconnected' | 'connecting'; // Connection health
  refreshData: () => Promise<void>; // Manual refresh function
  fetchTime: number;            // Last fetch duration in milliseconds
}

/**
 * Hook Configuration Options
 */
interface UseRealTimeSheetsOptions {
  refreshInterval?: number;     // Auto-refresh interval in milliseconds (default: 30000 = 30s)
  enableAutoRefresh?: boolean;  // Enable/disable automatic refresh (default: true)
  retryAttempts?: number;      // Number of retry attempts on failure (default: 3)
  retryDelay?: number;         // Base delay between retries in milliseconds (default: 1000)
}

/**
 * Real-Time Sheets Data Hook
 * 
 * @param options - Configuration options for the hook behavior
 * @returns Object containing data, loading states, and control functions
 */
export function useRealTimeSheetsData(options: UseRealTimeSheetsOptions = {}): SheetsDataHook {
  // Extract options with defaults
  const {
    refreshInterval = 30000,    // 30 seconds default
    enableAutoRefresh = true,
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  /**
   * Hook State Management
   * 
   * Manage all aspects of data fetching and UI state
   */
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [fetchTime, setFetchTime] = useState<number>(0);

  // Refs for cleanup and interval management
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Data Fetching Function with Retry Logic
   * 
   * Handles the actual data fetching with comprehensive error handling,
   * retry logic, and performance monitoring.
   */
  const fetchData = useCallback(async (isRefresh = false, attempt = 1): Promise<void> => {
    try {
      // Set loading states
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);
      
      setConnectionStatus('connecting');
      setError(null);

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      const startTime = Date.now();
      console.log(`🔄 ${isRefresh ? 'Refreshing' : 'Loading'} sheets data (attempt ${attempt})...`);

      /**
       * Fetch Data from API Route
       * 
       * Call our API route that handles Google Sheets integration
       * with timeout and abort signal support
       */
      const response = await fetch('/api/sheets', {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      const fetchDuration = Date.now() - startTime;
      setFetchTime(fetchDuration);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      /**
       * Update State with Fresh Data
       * 
       * Set all state variables with the new data and reset error states
       */
      setData(result.data);
      setLastUpdated(new Date().toISOString());
      setConnectionStatus('connected');
      setError(null);
      
      console.log(`✅ Successfully ${isRefresh ? 'refreshed' : 'loaded'} sheets data in ${fetchDuration}ms`);
      console.log(`📊 Data summary: ${result.metadata.sheetsCount} sheets, ${result.metadata.totalRecords} records`);

    } catch (err) {
      /**
       * Error Handling with Retry Logic
       * 
       * Implement exponential backoff retry strategy for transient failures
       */
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Don't treat aborted requests as errors
      if (errorMessage.includes('aborted')) {
        console.log('🔄 Request was aborted (new request started)');
        return;
      }

      console.error(`❌ Error fetching sheets data (attempt ${attempt}):`, errorMessage);

      // Retry logic with exponential backoff
      if (attempt < retryAttempts) {
        const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`🔄 Retrying in ${delay}ms... (attempt ${attempt + 1}/${retryAttempts})`);
        
        setTimeout(() => {
          fetchData(isRefresh, attempt + 1);
        }, delay);
        return;
      }

      // Final failure after all retries
      setError(errorMessage);
      setConnectionStatus('disconnected');
      console.error(`❌ Failed to fetch data after ${retryAttempts} attempts`);

    } finally {
      // Clean up loading states
      setLoading(false);
      setRefreshing(false);
      abortControllerRef.current = null;
    }
  }, [retryAttempts, retryDelay]);

  /**
   * Manual Refresh Function
   * 
   * Allows components to trigger manual data refresh
   */
  const refreshData = useCallback(async (): Promise<void> => {
    await fetchData(true);
  }, [fetchData]);

  /**
   * Initial Data Load Effect
   * 
   * Fetch data when the hook is first used
   */
  useEffect(() => {
    console.log('🚀 [useRealTimeSheetsData] Hook initialized - starting initial data fetch');
    fetchData(false);
  }, [fetchData]);

  /**
   * Auto-Refresh Interval Effect
   * 
   * Set up automatic refresh interval if enabled
   */
  useEffect(() => {
    if (!enableAutoRefresh || refreshInterval <= 0) {
      console.log('⏸️ [useRealTimeSheetsData] Auto-refresh disabled');
      return;
    }

    console.log(`⏰ [useRealTimeSheetsData] Setting up auto-refresh every ${refreshInterval / 1000} seconds`);

    intervalRef.current = setInterval(() => {
      if (!loading && !refreshing) {
        console.log('⏰ [useRealTimeSheetsData] Auto-refresh triggered');
        fetchData(true);
      } else {
        console.log('⏸️ [useRealTimeSheetsData] Auto-refresh skipped - already loading or refreshing');
      }
    }, refreshInterval);

    // Cleanup interval on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        console.log('🧹 [useRealTimeSheetsData] Cleaning up auto-refresh interval');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enableAutoRefresh, refreshInterval, loading, refreshing, fetchData]);

  /**
   * Cleanup Effect
   * 
   * Clean up resources when component unmounts
   */
  useEffect(() => {
    return () => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /**
   * Return Hook Interface
   * 
   * Provide all data and control functions to consuming components
   */
  return {
    data,
    loading,
    error,
    refreshing,
    lastUpdated,
    connectionStatus,
    refreshData,
    fetchTime
  };
}

/**
 * Default Export for Convenience
 */
export default useRealTimeSheetsData;
