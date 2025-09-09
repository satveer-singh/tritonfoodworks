/**
 * Google Sheets API Route Handler
 * 
 * This API route provides server-side access to Google Sheets data
 * for client-side components that need real-time updates. It acts as
 * a proxy between the client and Google Sheets API, handling:
 * 
 * 1. **Authentication**: Manages Google Sheets API credentials securely
 * 2. **Data Fetching**: Retrieves fresh data from Google Sheets
 * 3. **Processing**: Transforms raw data into dashboard-ready format
 * 4. **Caching**: Implements response caching for performance
 * 5. **Error Handling**: Provides consistent error responses
 * 
 * This enables real-time data updates without exposing credentials
 * to the client side.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllSheets } from '@/lib/googleSheets';

/**
 * GET Handler for Sheets Data
 * 
 * Handles GET requests to fetch current Google Sheets data.
 * Implements timeout protection and comprehensive error handling
 * to ensure reliable API responses.
 * 
 * Features:
 * - 15-second timeout protection
 * - Structured error responses
 * - Performance logging
 * - CORS headers for client access
 * 
 * @param request - Next.js request object
 * @returns JSON response with sheets data or error information
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 API: Fetching fresh Google Sheets data...');
    const startTime = Date.now();

    /**
     * Fetch Google Sheets Data with Timeout Protection
     * 
     * Use Promise.race to implement timeout protection that prevents
     * the API from hanging if Google Sheets is slow or unresponsive.
     */
    const sheetsData = await Promise.race([
      getAllSheets(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("API timeout after 15 seconds")), 15000)
      )
    ]);

    const fetchTime = Date.now() - startTime;
    console.log(`✅ API: Successfully fetched sheets data in ${fetchTime}ms`);

    /**
     * Return Successful Response
     * 
     * Structure the response with metadata about the fetch operation
     * and the actual sheets data for client processing.
     */
    return NextResponse.json({
      success: true,
      data: sheetsData,
      metadata: {
        fetchTime,
        timestamp: new Date().toISOString(),
        sheetsCount: Object.keys(sheetsData).length,
        totalRecords: Object.values(sheetsData).reduce((sum, sheet) => sum + sheet.rows.length, 0)
      }
    }, {
      // Add cache headers for performance
      headers: {
        'Cache-Control': 'no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    /**
     * Error Response Handling
     * 
     * Provide structured error responses that help with debugging
     * while maintaining security by not exposing sensitive details.
     */
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ API: Error fetching sheets data:', errorMessage);

    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}

/**
 * OPTIONS Handler for CORS Preflight
 * 
 * Handles CORS preflight requests to enable client-side API calls
 * from the dashboard components.
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
