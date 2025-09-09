# 🌱 Triton Food Works Agricultural Dashboard

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/satveer-singh/webexceldashboard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

A modern, real-time agricultural operations dashboard that syncs with Google Sheets to provide comprehensive insights into farming activities, from sowing to revenue tracking. **✨ Now with live real-time updates every 30 seconds!**

## ✨ Features

- 🔄 **Real-time Data Sync** - Automatic synchronization with Google Sheets
- 📊 **Comprehensive Tracking** - Monitor batches, harvests, sourcing, and revenue
- 🎨 **Modern UI/UX** - Built with shadcn/ui and Tailwind CSS
- 📱 **Responsive Design** - Works seamlessly on all devices
- ⚡ **High Performance** - Optimized for speed and efficiency
- 🔒 **Secure** - No sensitive data stored client-side

## 🚀 Live Demo

**Production URL**: [https://webexceldashboard-jmxkiqax2-satveer-singhs-projects-0a7b8b33.vercel.app/](https://webexceldashboard-jmxkiqax2-satveer-singhs-projects-0a7b8b33.vercel.app/)

## 📋 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Google Sheets with published access

### Installation

```bash
# Clone repository
git clone https://github.com/satveer-singh/webexceldashboard.git
cd webexceldashboard

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Google Sheets ID

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 🛠 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Data Source**: Google Sheets API
- **Deployment**: Vercel

## 📊 Dashboard Sections

### Overview
- Live metrics and KPIs
- Quick stats on active batches
- Revenue and expense summaries
- Team performance indicators

### Batch Management
- Track seed batches from sowing to harvest
- Monitor growth progress and status
- Team assignment and area management

### Harvest Tracking
- Log harvest quantities and quality grades
- Track team member performance
- Time and efficiency metrics

### Financial Management
- Sourcing and procurement records
- Expense tracking and categorization
- Revenue estimates and actual sales
- Profit/loss analysis

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Required: Published Google Sheets ID
GOOGLE_SHEETS_SPREADSHEET_ID=2PACX-1vQFIol8mqUV0RZNQAma8swIP_ecyNrZpYTCqJ_biXF7p6JQncYM9USG8skMORWnWg

# Optional: For private sheets
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@example.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
"
```

### Google Sheets Setup

1. **Publish Your Sheet**:
   - File → Share → Publish to web
   - Select "Entire Document" and "Web page"
   - Copy the published URL and extract the ID

2. **Required Sheet Structure**:
   The dashboard expects these sheet names:
   - `Settings` - Crop varieties and pricing
   - `Batches` - Seed batch tracking
   - `Harvest_Log` - Harvest records
   - `Sourcing_Log` - Vendor purchases
   - `Procurement_Log` - Equipment and supplies
   - `Expense_Log` - Operational expenses
   - `Post_Harvest` - Processing and delivery
   - `Revenue_Estimate` - Sales and revenue
   - `Dashboard` - Summary metrics

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard page
├── components/            # React components
│   ├── ModernExcelDashboard.tsx  # Main dashboard
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities
│   ├── googleSheets.ts   # Google Sheets integration
│   └── utils.ts          # Helper functions
├── public/               # Static assets
└── types/                # TypeScript definitions
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/satveer-singh/webexceldashboard)

1. Click the "Deploy" button above
2. Configure environment variables in Vercel dashboard
3. Deploy automatically triggers on git push

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to other platforms
npm run export  # For static export
```

## 🔍 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

## 📚 Documentation

- **[📖 Complete Documentation](./DOCUMENTATION.md)** - Comprehensive project documentation
- **[🔌 API Reference](./API_REFERENCE.md)** - API endpoints and data schemas
- **[🚀 Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Detailed deployment instructions
- **[🛠 Developer Guide](./DEVELOPER_GUIDE.md)** - Development setup and guidelines

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./DEVELOPER_GUIDE.md#contributing) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following our [code standards](./DEVELOPER_GUIDE.md#code-standards)
4. Commit your changes: `git commit -m 'feat: add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/satveer-singh/webexceldashboard/issues) page to:
- Report bugs
- Request new features  
- Ask questions
- Share feedback

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About Triton Food Works

**Triton Food Works** is an agricultural technology company focused on optimizing farm operations through data-driven insights and modern technology solutions.

### Contact Information
- **Website**: [tritonfoodworks.com](https://tritonfoodworks.com)
- **Email**: info@tritonfoodworks.com
- **Developer**: [Satveer Singh](https://github.com/satveer-singh)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - Icon library
- [Vercel](https://vercel.com/) - Deployment platform

## 📈 Roadmap

### Version 1.1 (Q4 2024)
- [ ] Advanced analytics dashboard
- [ ] Mobile app companion
- [ ] Offline support
- [ ] Export functionality

### Version 1.2 (Q1 2025)
- [ ] Multi-tenant support
- [ ] Advanced reporting
- [ ] Integration APIs
- [ ] Machine learning insights

---

<div align="center">

**[⭐ Star this repository](https://github.com/satveer-singh/webexceldashboard) if you find it helpful!**

Made with ❤️ for modern agriculture

</div>

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

