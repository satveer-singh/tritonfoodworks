import { google } from "googleapis";
import * as XLSX from 'xlsx';

export type SheetRows = Array<Record<string, string>>;
export type SheetsData = Record<string, { headers: string[]; rows: SheetRows }>;

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

// Create demo data structure that matches real Google Sheets
function createDemoData(): SheetsData {
  return {
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

// Create authenticated sheets client
function createSheetsClient() {
  const clientEmail = getEnv("GOOGLE_SHEETS_CLIENT_EMAIL");
  const privateKeyRaw = getEnv("GOOGLE_SHEETS_PRIVATE_KEY");
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.readonly"
    ],
  });

  return google.sheets({ version: "v4", auth });
}

export async function getAllSheets(): Promise<SheetsData> {
  const spreadsheetId = getEnv("GOOGLE_SHEETS_SPREADSHEET_ID");
  
  // Check if this is a published spreadsheet ID (starts with 2PACX)
  if (spreadsheetId.startsWith('2PACX')) {
    console.log("Using published Google Sheets format");
    try {
      const sheetsData = await fetchPublishedSheet(spreadsheetId);
      // Log detailed data structure to help with debugging
      console.log("🔍 Sheet structure overview:", Object.keys(sheetsData).map(name => {
        const sheet = sheetsData[name];
        return {
          name,
          headerCount: sheet.headers.length,
          rowCount: sheet.rows.length,
          sampleHeaders: sheet.headers.slice(0, 3),
          sampleRow: sheet.rows.length > 0 ? Object.fromEntries(
            Object.entries(sheet.rows[0]).slice(0, 3)
          ) : {}
        };
      }));
      return sheetsData;
    } catch (error) {
      console.error("Error fetching published sheet:", error);
      console.log("Using demo data as fallback...");
      return createDemoData();
    }
  }
  
  // Regular authenticated API access
  try {
    const sheets = createSheetsClient();

    // Get sheet titles
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const titles = (meta.data.sheets || [])
      .map((s) => s.properties?.title)
      .filter((t): t is string => Boolean(t));

    if (titles.length === 0) {
      console.log("No sheets found, using demo data");
      return createDemoData();
    }

    // Fetch values for each tab using ranges = titles
    const values = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: titles,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    });

    const result: SheetsData = {};
    (values.data.valueRanges || []).forEach((range, idx) => {
      const title = titles[idx];
      const rows = range.values || [];
      if (rows.length === 0) {
        result[title] = { headers: [], rows: [] };
        return;
      }
      const headers = rows[0].map((h) => String(h || "").trim());
      const dataRows: SheetRows = rows.slice(1).map((r) => {
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h || `col_${i + 1}`] = r[i] !== undefined && r[i] !== null ? String(r[i]) : "";
        });
        return obj;
      });
      result[title] = { headers, rows: dataRows };
    });

    return result;
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);
    console.log("Google Sheets not accessible. Using demo data for testing...");
    return createDemoData();
  }
}

// Fetch published Google Sheets
async function fetchPublishedSheet(publishedId: string): Promise<SheetsData> {
  const xlsxUrl = `https://docs.google.com/spreadsheets/d/e/${publishedId}/pub?output=xlsx`;
  
  try {
    console.log(`🔄 Attempting to fetch published sheet: ${publishedId}`);
    
    // Try direct fetch first
    let response;
    try {
      console.log(`📡 Direct fetch attempt: ${xlsxUrl}`);
      response = await fetch(xlsxUrl);
      console.log(`📡 Direct fetch response status: ${response.status}`);
    } catch (error) {
      // If direct fetch fails, try with a CORS proxy
      const fetchError = error instanceof Error ? error.message : String(error);
      console.log(`⚠️ Direct fetch failed, trying with CORS proxy: ${fetchError}`);
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(xlsxUrl)}`;
      console.log(`📡 CORS proxy fetch attempt: ${proxyUrl}`);
      response = await fetch(proxyUrl);
      console.log(`📡 CORS proxy response status: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} when fetching ${xlsxUrl}`);
    }
    
    console.log(`✅ Successfully fetched sheet data, processing content...`);

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const result: SheetsData = {};
    
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with raw values to better preserve numbers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        raw: true,
        defval: "" 
      }) as any[][];
      
      if (jsonData.length === 0) {
        result[sheetName] = { headers: [], rows: [] };
        return;
      }
      
      // Ensure we have clean headers
      const headers = jsonData[0].map((h: any) => {
        if (h === undefined || h === null) return "";
        return String(h).trim();
      });
      
      // Log headers for debugging
      console.log(`📋 Sheet "${sheetName}" headers: ${headers.join(', ')}`);
      
      // Process each data row and filter out empty rows
      const dataRows: SheetRows = [];
      let consecutiveEmptyRows = 0;
      const MAX_CONSECUTIVE_EMPTY = 5; // Stop after 5 consecutive empty rows
      
      for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
        const row = jsonData[rowIndex];
        const obj: Record<string, string> = {};
        let hasData = false;
        
        headers.forEach((header, index) => {
          const cellValue = row[index];
          const columnKey = header || `col_${index + 1}`;
          
          // Ensure we handle all data types properly
          if (cellValue === undefined || cellValue === null) {
            obj[columnKey] = "";
          } else if (typeof cellValue === 'number') {
            // Keep numeric precision for calculations
            obj[columnKey] = String(cellValue);
            if (cellValue !== 0) hasData = true;
          } else {
            const stringValue = String(cellValue).trim();
            obj[columnKey] = stringValue;
            if (stringValue !== "") hasData = true;
          }
        });
        
        // Check if this row has any meaningful data
        if (hasData) {
          dataRows.push(obj);
          consecutiveEmptyRows = 0;
          
          // For debugging the first few rows with data
          if (dataRows.length <= 2) {
            console.log(`📋 Row ${dataRows.length} in sheet "${sheetName}":`, obj);
          }
        } else {
          consecutiveEmptyRows++;
          // Stop processing if we hit too many consecutive empty rows
          if (consecutiveEmptyRows >= MAX_CONSECUTIVE_EMPTY) {
            console.log(`📋 Stopped processing sheet "${sheetName}" after ${consecutiveEmptyRows} consecutive empty rows`);
            break;
          }
        }
      }
      
      result[sheetName] = { headers, rows: dataRows };
    });
    
    console.log("Successfully loaded published Google Sheets data");
    return result;
  } catch (error) {
    console.error("Error fetching published sheet:", error);
    throw error;
  }
}

