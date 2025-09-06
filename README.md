# Triton Food Works Masterbook (Next.js + Google Sheets)

A comprehensive agricultural dashboard that analyzes Google Sheets data to generate real-time metrics and visualizations for Triton Food Works operations.

## Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- A Google Cloud project with the Google Sheets API enabled
- A Service Account with a JSON key
- Your spreadsheet shared with the Service Account's email (Viewer is enough)

## Setup

1. Enable the Google Sheets API in your GCP project.
2. Create a Service Account and generate a JSON key.
3. Share your spreadsheet with the Service Account email (from step 2).
4. Copy `.env.local.example` to `.env.local` and fill values:

```
GOOGLE_SHEETS_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
```

Notes:
- Keep the `\n` escapes in the private key as shown above. The app converts them at runtime.
- Spreadsheet ID is the value between `/d/` and `/edit` in the sheet URL.

## Install & Run

```
npm install
npm run dev
```

Then open http://localhost:3000

## How It Works

- Server-side function (`lib/googleSheets.ts`) authenticates using a JWT (Service Account) and fetches all tabs via `batchGet`.
- API route (`app/api/sheets/route.ts`) returns a JSON mapping of tab name to rows.
- The page (`app/page.tsx`) processes the data with specialized agriculture-focused functions:
  - `calculateProductionMetrics`: Analyzes batches and harvest data
  - `calculateHarvestMetrics`: Determines quality scores and logistics performance
  - `detectSheetType`: Classifies sheets based on agricultural patterns
  - `generateDynamicDashboard`: Creates comprehensive data structure for visualization
- The `TritonMasterbook` component renders an interactive dashboard with summary cards, metrics, and sheets overview.

## Expected Sheet Structure

The application is designed to work with agricultural data in Google Sheets. It expects:

- **Batches**: Contains information about production batches with columns like BatchID, Crop, SownDate, ExpectedHarvest
- **Harvest_Log**: Records of harvests with columns like Date, QtyHarvested(kg), Rejected(kg)
- **Post_Harvest**: Logistics information with columns like SortingStart, PackagingEnd, OnTime(0/1)
- **Revenue/Expense Sheets**: Financial data with monetary values in columns containing '₹'

The application automatically detects patterns in your sheet names and columns to categorize them appropriately.

