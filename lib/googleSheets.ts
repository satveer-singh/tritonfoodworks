/**
 * Google Sheets Integration Library
 * 
 * This module provides comprehensive integration with Google Sheets API
 * for agricultural data management. It handles:
 * 
 * 1. **Authentication**: Service account and published sheet access
 * 2. **Data Fetching**: Retrieval of all sheets from a spreadsheet
 * 3. **Data Processing**: Raw data transformation and cleaning
 * 4. **Error Handling**: Robust fallback mechanisms
 * 5. **Type Safety**: TypeScript interfaces for data structures
 * 
 * The system supports both private authenticated sheets and public
 * published sheets, making it flexible for different deployment scenarios.
 */

import { google } from "googleapis";
import * as XLSX from 'xlsx';

/**
 * Type Definitions for Google Sheets Data
 * 
 * These interfaces ensure type safety throughout the application
 * and provide clear contracts for data structures.
 */

/** Array of sheet rows, where each row is a key-value record */
export type SheetRows = Array<Record<string, string>>;

/** Complete sheets data structure with headers and rows for each sheet */
export type SheetsData = Record<string, { headers: string[]; rows: SheetRows }>;

/**
 * Environment Variable Getter with Fallbacks
 * 
 * Safely retrieves environment variables with intelligent fallbacks
 * for different deployment scenarios. This is particularly useful
 * for handling both development and production configurations.
 * 
 * @param name - The environment variable name to retrieve
 * @returns The environment variable value
 * @throws Error if required variable is missing and no fallback exists
 */
function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    /**
     * Fallback for Published Google Sheets
     * 
     * For published sheets that don't require authentication,
     * provide a default spreadsheet ID. This enables the system
     * to work with demo data even without full configuration.
     */
    if (name === 'GOOGLE_SHEETS_SPREADSHEET_ID') {
      return '2PACX-1vQFIol8mqUV0RZNQAma8swIP_ecyNrZpYTCqJ_biXF7p6JQncYM9USG8skMORWnWg';
    }
    throw new Error(`Missing env var: ${name}`);
  }
  return v;
}

/**
 * Demo Data Generator for Agricultural Business
 * 
 * Creates realistic sample data that matches the structure and content
 * of actual Google Sheets used in agricultural operations. This demo
 * data serves multiple purposes:
 * 
 * 1. **Development**: Enables local development without real data
 * 2. **Testing**: Provides consistent data for testing scenarios
 * 3. **Demonstrations**: Shows the system's capabilities
 * 4. **Fallback**: Acts as backup when real data is unavailable
 * 
 * The data structure mirrors actual agricultural business operations
 * including revenue tracking, expense management, and production data.
 * 
 * @returns SheetsData object with comprehensive demo data
 */
function createDemoData(): SheetsData {
  return {
    /**
     * Revenue Tracking Sheet
     * 
     * Simulates income streams from various agricultural business activities.
     * Includes different revenue categories and status tracking for financial
     * planning and cash flow management.
     */
    "Revenue Tracking": {
      headers: ["Date", "Source", "Amount", "Category", "Status"],
      rows: [
        { "Date": "2025-09-01", "Source": "Product Sales", "Amount": "₹125,000", "Category": "Sales", "Status": "Completed" },
        { "Date": "2025-09-02", "Source": "Service Revenue", "Amount": "₹85,000", "Category": "Services", "Status": "Completed" },
        { "Date": "2025-09-03", "Source": "Consulting", "Amount": "₹45,000", "Category": "Professional", "Status": "Pending" },
        { "Date": "2025-09-04", "Source": "License Fees", "Amount": "₹30,000", "Category": "Licensing", "Status": "Completed" },
        { "Date": "2025-09-05", "Source": "Subscription", "Amount": "₹75,000", "Category": "Recurring", "Status": "Completed" }
      ]
    },
    
    /**
     * Expense Tracking Sheet
     * 
     * Represents operational costs and expenditures across different
     * business categories. Essential for cost management and profit
     * calculation in agricultural operations.
     */
    "Expense Tracking": {
      headers: ["Date", "Vendor", "Amount", "Category", "Status"],
      rows: [
        { "Date": "2025-09-01", "Vendor": "Office Supplies", "Amount": "₹15,000", "Category": "Operations", "Status": "Paid" },
        { "Date": "2025-09-02", "Vendor": "Marketing Agency", "Amount": "₹45,000", "Category": "Marketing", "Status": "Paid" },
        { "Date": "2025-09-03", "Vendor": "Software Licenses", "Amount": "₹25,000", "Category": "Technology", "Status": "Pending" },
        { "Date": "2025-09-04", "Vendor": "Travel Expenses", "Amount": "₹18,000", "Category": "Travel", "Status": "Paid" },
        { "Date": "2025-09-05", "Vendor": "Utilities", "Amount": "₹12,000", "Category": "Utilities", "Status": "Paid" }
      ]
    },
    
    /**
     * Production Data Sheet
     * 
     * Tracks agricultural production batches including crop types,
     * quantities, and processing status. Critical for production
     * planning and quality control management.
     */
    "Production Data": {
      headers: ["Batch ID", "Product", "Quantity", "Status", "Date"],
      rows: [
        { "Batch ID": "BTH-001", "Product": "Organic Rice", "Quantity": "500 kg", "Status": "Active", "Date": "2025-09-01" },
        { "Batch ID": "BTH-002", "Product": "Wheat Flour", "Quantity": "300 kg", "Status": "Completed", "Date": "2025-09-02" },
        { "Batch ID": "BTH-003", "Product": "Pulses Mix", "Quantity": "200 kg", "Status": "Active", "Date": "2025-09-03" },
        { "Batch ID": "BTH-004", "Product": "Spice Blend", "Quantity": "150 kg", "Status": "Processing", "Date": "2025-09-04" },
        { "Batch ID": "BTH-005", "Product": "Organic Oils", "Quantity": "100 L", "Status": "Active", "Date": "2025-09-05" }
      ]
    },
    
    /**
     * Inventory Management Sheet
     * 
     * Monitors stock levels, minimum requirements, and pricing for
     * raw materials and supplies. Essential for supply chain management
     * and preventing production delays due to stock shortages.
     */
    "Inventory Management": {
      headers: ["Item", "Current Stock", "Minimum Required", "Unit Price", "Status"],
      rows: [
        { "Item": "Raw Rice", "Current Stock": "2500 kg", "Minimum Required": "1000 kg", "Unit Price": "₹45/kg", "Status": "In Stock" },
        { "Item": "Wheat", "Current Stock": "1800 kg", "Minimum Required": "800 kg", "Unit Price": "₹35/kg", "Status": "In Stock" },
        { "Item": "Packaging Materials", "Current Stock": "500 units", "Minimum Required": "200 units", "Unit Price": "₹15/unit", "Status": "Low Stock" },
        { "Item": "Labels", "Current Stock": "1000 units", "Minimum Required": "300 units", "Unit Price": "₹5/unit", "Status": "In Stock" },
        { "Item": "Storage Containers", "Current Stock": "150 units", "Minimum Required": "100 units", "Unit Price": "₹125/unit", "Status": "In Stock" }
      ]
    }
  };
}

/**
 * Google Sheets Authenticated Client Factory
 * 
 * Creates an authenticated Google Sheets API client using service account
 * credentials. This enables programmatic access to private Google Sheets
 * with appropriate permissions for reading spreadsheet data.
 * 
 * Authentication Method: Service Account (JWT)
 * - More secure than OAuth for server-side applications
 * - No user interaction required
 * - Suitable for production environments
 * 
 * Required Environment Variables:
 * - GOOGLE_SHEETS_CLIENT_EMAIL: Service account email address
 * - GOOGLE_SHEETS_PRIVATE_KEY: Service account private key (PEM format)
 * 
 * @returns Authenticated Google Sheets API client instance
 */
function createSheetsClient() {
  // Retrieve service account credentials from environment variables
  const clientEmail = getEnv("GOOGLE_SHEETS_CLIENT_EMAIL");
  const privateKeyRaw = getEnv("GOOGLE_SHEETS_PRIVATE_KEY");
  
  /**
   * Process Private Key Format
   * 
   * Private keys from environment variables often have escaped newlines
   * that need to be converted to actual newline characters for proper
   * JWT authentication to work.
   */
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  /**
   * Create JWT Authentication Client
   * 
   * Configure Google's JWT client with service account credentials
   * and appropriate OAuth2 scopes for accessing Google Sheets and Drive.
   */
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets", // Read/write access to Google Sheets
      "https://www.googleapis.com/auth/drive.readonly" // Read access to Google Drive (for metadata)
    ],
  });

  /**
   * Return Configured Sheets Client
   * 
   * Create and return a Google Sheets API v4 client with the
   * authenticated JWT credentials attached.
   */
  return google.sheets({ version: "v4", auth });
}

/**
 * Get All Sheets Data - Main Entry Point
 * 
 * This is the primary function for retrieving all sheets data from a
 * Google Spreadsheet. It implements intelligent fallback strategies
 * and supports both authenticated and published sheet access methods.
 * 
 * Features:
 * 1. **Auto-Detection**: Detects published vs private sheets
 * 2. **Dual Access Methods**: Supports both API and CSV formats
 * 3. **Robust Fallback**: Falls back to demo data if needed
 * 4. **Detailed Logging**: Provides comprehensive debugging information
 * 5. **Error Handling**: Graceful degradation on failures
 * 
 * @returns Promise<SheetsData> - Complete sheets data structure
 */
export async function getAllSheets(): Promise<SheetsData> {
  const spreadsheetId = getEnv("GOOGLE_SHEETS_SPREADSHEET_ID");
  
  /**
   * Published Sheet Detection and Processing
   * 
   * Published Google Sheets have IDs that start with '2PACX' and can
   * be accessed without authentication via CSV export URLs. This method
   * is simpler and works well for read-only scenarios.
   */
  if (spreadsheetId.startsWith('2PACX')) {
    console.log("🌐 Using published Google Sheets format");
    try {
      const sheetsData = await fetchPublishedSheet(spreadsheetId);
      
      /**
       * Detailed Data Structure Logging
       * 
       * Log comprehensive information about retrieved sheets to help
       * with debugging and understanding the data structure. This is
       * particularly useful for troubleshooting data processing issues.
       */
      console.log("🔍 Sheet structure overview:", Object.keys(sheetsData).map(name => {
        const sheet = sheetsData[name];
        return {
          name, // Sheet name from Google Sheets
          headerCount: sheet.headers.length, // Number of columns
          rowCount: sheet.rows.length, // Number of data rows
          sampleHeaders: sheet.headers.slice(0, 3), // First 3 headers for preview
          sampleRow: sheet.rows.length > 0 ? Object.fromEntries(
            Object.entries(sheet.rows[0]).slice(0, 3) // Sample data from first row
          ) : {}
        };
      }));
      return sheetsData;
    } catch (error) {
      console.error("❌ Error fetching published sheet:", error);
      console.log("🔄 Using demo data as fallback...");
      return createDemoData();
    }
  }
  
  /**
   * Authenticated API Access Path
   * 
   * For private spreadsheets that require authentication, use the
   * Google Sheets API with service account credentials.
   */
  try {
    /**
     * Create Authenticated Client
     * 
     * Initialize the Google Sheets API client with service account
     * authentication for accessing private spreadsheets.
     */
    const sheets = createSheetsClient();

    /**
     * Retrieve Sheet Metadata
     * 
     * First, get the spreadsheet metadata to discover all available
     * sheet tabs/worksheets within the spreadsheet. This allows us to
     * dynamically fetch all sheets without hardcoding sheet names.
     */
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const titles = (meta.data.sheets || [])
      .map((s) => s.properties?.title) // Extract sheet title from properties
      .filter((t): t is string => Boolean(t)); // Filter out empty/null titles

    /**
     * Validate Sheet Availability
     * 
     * If no sheets are found in the spreadsheet, fall back to demo data
     * to ensure the application continues to function.
     */
    if (titles.length === 0) {
      console.log("⚠️ No sheets found, using demo data");
      return createDemoData();
    }

    /**
     * Batch Fetch All Sheet Data
     * 
     * Use the batch get API to efficiently retrieve data from all sheets
     * in a single request. This is more efficient than making individual
     * requests for each sheet.
     * 
     * Configuration:
     * - UNFORMATTED_VALUE: Get raw values for consistent data processing
     * - FORMATTED_STRING: Get dates in readable string format
     */
    const values = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: titles, // Fetch all discovered sheet titles
      valueRenderOption: "UNFORMATTED_VALUE", // Raw numeric values
      dateTimeRenderOption: "FORMATTED_STRING", // Human-readable dates
    });

    /**
     * Process and Structure Sheet Data
     * 
     * Transform the raw API response into our standardized SheetsData
     * format with proper headers and row objects for each sheet.
     */
    const result: SheetsData = {};
    (values.data.valueRanges || []).forEach((range, idx) => {
      const title = titles[idx];
      const rows = range.values || [];
      
      // Handle empty sheets gracefully
      if (rows.length === 0) {
        result[title] = { headers: [], rows: [] };
        return;
      }
      
      /**
       * Extract and Process Headers
       * 
       * First row contains column headers. Clean and normalize them
       * for consistent data access throughout the application.
       */
      const headers = rows[0].map((h) => String(h || "").trim());
      
      /**
       * Transform Data Rows
       * 
       * Convert each data row from array format to object format
       * using headers as keys. This makes data access more intuitive
       * and less error-prone than array indexing.
       */
      const dataRows: SheetRows = rows.slice(1).map((r) => {
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          // Use header as key, with fallback column naming for empty headers
          const key = h || `col_${i + 1}`;
          // Convert all values to strings with null/undefined safety
          obj[key] = r[i] !== undefined && r[i] !== null ? String(r[i]) : "";
        });
        return obj;
      });
      
      result[title] = { headers, rows: dataRows };
    });

    return result;
  } catch (error) {
    /**
     * Error Handling and Fallback
     * 
     * If authenticated access fails (due to credentials, network issues,
     * or permissions), gracefully fall back to demo data to maintain
     * application functionality.
     */
    console.error("❌ Error fetching Google Sheets data:", error);
    console.log("🔄 Google Sheets not accessible. Using demo data for testing...");
    return createDemoData();
  }
}

/**
 * Fetch Published Google Sheets Data
 * 
 * Retrieves data from published Google Sheets using the public XLSX export
 * URL. This method works with sheets that have been published to the web
 * and doesn't require authentication. It includes CORS proxy fallback
 * for situations where direct access is blocked by browser security policies.
 * 
 * Process:
 * 1. Attempt direct fetch from Google's public XLSX export URL
 * 2. Fall back to CORS proxy if direct access is blocked
 * 3. Parse XLSX data using SheetJS library
 * 4. Transform into standardized SheetsData format
 * 
 * @param publishedId - Published sheet ID (starts with 2PACX)
 * @returns Promise<SheetsData> - Processed sheets data
 */
async function fetchPublishedSheet(publishedId: string): Promise<SheetsData> {
  /**
   * Google Sheets Public XLSX Export URL
   * 
   * Published sheets can be accessed via a public URL that exports
   * the entire spreadsheet as an XLSX file. This is more reliable
   * than CSV for multi-sheet spreadsheets.
   */
  const xlsxUrl = `https://docs.google.com/spreadsheets/d/e/${publishedId}/pub?output=xlsx`;
  
  try {
    console.log(`🔄 Attempting to fetch published sheet: ${publishedId}`);
    
    /**
     * Dual Fetch Strategy with CORS Fallback
     * 
     * Try direct fetch first, then fall back to CORS proxy if needed.
     * This handles various network and security configurations.
     */
    let response;
    try {
      console.log(`📡 Direct fetch attempt: ${xlsxUrl}`);
      response = await fetch(xlsxUrl);
      console.log(`📡 Direct fetch response status: ${response.status}`);
    } catch (error) {
      /**
       * CORS Proxy Fallback
       * 
       * If direct fetch fails due to CORS restrictions or network issues,
       * use a public CORS proxy service to access the sheet data.
       */
      const fetchError = error instanceof Error ? error.message : String(error);
      console.log(`⚠️ Direct fetch failed, trying with CORS proxy: ${fetchError}`);
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(xlsxUrl)}`;
      console.log(`📡 CORS proxy fetch attempt: ${proxyUrl}`);
      response = await fetch(proxyUrl);
      console.log(`📡 CORS proxy response status: ${response.status}`);
    }

    /**
     * Validate Response Success
     * 
     * Ensure the HTTP request was successful before proceeding
     * with data processing.
     */
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} when fetching ${xlsxUrl}`);
    }
    
    console.log(`✅ Successfully fetched sheet data, processing content...`);

    /**
     * Parse XLSX Data
     * 
     * Use SheetJS library to parse the downloaded XLSX file into
     * a workbook object that we can extract individual sheets from.
     */
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    /**
     * Process Each Sheet in Workbook
     * 
     * Iterate through all sheets in the workbook and transform each
     * one into our standardized data format.
     */
    const result: SheetsData = {};
    
    workbook.SheetNames.forEach((sheetName) => {
      /**
       * Get Individual Worksheet
       * 
       * Extract the specific worksheet from the workbook for processing.
       * Each sheet is processed independently to maintain data integrity.
       */
      const worksheet = workbook.Sheets[sheetName];
      
      /**
       * Convert XLSX Sheet to JSON Format
       * 
       * Transform the XLSX worksheet into a JSON array format that's
       * easier to work with programmatically. Configuration options:
       * - header: 1 (treat first row as header row)
       * - raw: true (preserve original data types, especially numbers)
       * - defval: "" (use empty string for undefined cells)
       */
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,    // Use first row as headers
        raw: true,    // Preserve numeric precision
        defval: ""    // Default value for empty cells
      }) as any[][];
      
      /**
       * Handle Empty Sheets
       * 
       * If the sheet contains no data, create an empty structure
       * to maintain consistency in the data format.
       */
      if (jsonData.length === 0) {
        result[sheetName] = { headers: [], rows: [] };
        return;
      }
      
      /**
       * Process and Clean Headers
       * 
       * Extract column headers from the first row and clean them up.
       * Handle null/undefined values and trim whitespace for consistency.
       */
      const headers = jsonData[0].map((h: any) => {
        if (h === undefined || h === null) return "";
        return String(h).trim();
      });
      
      // Log headers for debugging data structure issues
      console.log(`📋 Sheet "${sheetName}" headers: ${headers.join(', ')}`);
      
      /**
       * Process Data Rows with Empty Row Detection
       * 
       * Convert each data row from array format to object format using
       * headers as keys. Implement smart empty row detection to stop
       * processing when encountering too many consecutive empty rows.
       */
      const dataRows: SheetRows = [];
      let consecutiveEmptyRows = 0;
      const MAX_CONSECUTIVE_EMPTY = 5; // Stop processing after this many empty rows
      
      for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
        const row = jsonData[rowIndex];
        const obj: Record<string, string> = {};
        let hasData = false; // Track if row contains any actual data
        
        /**
         * Process Each Cell in the Row
         * 
         * Convert each cell value to string format while preserving
         * numeric precision and handling various data types properly.
         */
        headers.forEach((header, index) => {
          const cellValue = row[index];
          const columnKey = header || `col_${index + 1}`; // Fallback column naming
          
          /**
           * Cell Value Type Handling
           * 
           * Handle different data types appropriately:
           * - null/undefined: Convert to empty string
           * - numbers: Preserve as string but maintain precision
           * - strings: Trim whitespace and clean up
           * - other types: Convert to string representation
           */
          if (cellValue === undefined || cellValue === null) {
            obj[columnKey] = "";
          } else if (typeof cellValue === 'number') {
            // Preserve numeric precision for financial/quantity calculations
            obj[columnKey] = String(cellValue);
            if (cellValue !== 0) hasData = true; // Non-zero numbers indicate data
          } else {
            const stringValue = String(cellValue).trim();
            obj[columnKey] = stringValue;
            if (stringValue !== "") hasData = true; // Non-empty strings indicate data
          }
        });
        
        /**
         * Empty Row Detection and Management
         * 
         * Implement intelligent row processing that stops when encountering
         * too many consecutive empty rows. This prevents processing thousands
         * of empty rows in large spreadsheets while still allowing for
         * occasional empty rows within the data.
         */
        if (hasData) {
          dataRows.push(obj);
          consecutiveEmptyRows = 0; // Reset counter when we find data
          
          /**
           * Debug Logging for Data Structure
           * 
           * Log the first few rows with data to help with debugging
           * data structure and format issues.
           */
          if (dataRows.length <= 2) {
            console.log(`📋 Row ${dataRows.length} in sheet "${sheetName}":`, obj);
          }
        } else {
          consecutiveEmptyRows++;
          
          /**
           * Stop Processing at Empty Row Threshold
           * 
           * If we encounter too many consecutive empty rows, assume we've
           * reached the end of the actual data and stop processing to
           * improve performance.
           */
          if (consecutiveEmptyRows >= MAX_CONSECUTIVE_EMPTY) {
            console.log(`📋 Stopped processing sheet "${sheetName}" after ${consecutiveEmptyRows} consecutive empty rows`);
            break;
          }
        }
      }
      
      /**
       * Store Processed Sheet Data
       * 
       * Add the processed sheet data to the result object with
       * standardized headers and rows structure.
       */
      result[sheetName] = { headers, rows: dataRows };
    });
    
    console.log("✅ Successfully loaded published Google Sheets data");
    return result;
  } catch (error) {
    /**
     * Error Handling for Published Sheet Access
     * 
     * If published sheet access fails, re-throw the error to allow
     * the calling function to handle fallback logic (demo data).
     */
    console.error("❌ Error fetching published sheet:", error);
    throw error;
  }
}

