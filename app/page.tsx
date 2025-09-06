import ModernExcelDashboard from '../components/ModernExcelDashboard';
import { getAllSheets, SheetsData } from '../lib/googleSheets';

// Types for better type safety
interface ProductionMetrics {
  activeBatches: number;
  totalExpectedYield: number;
  totalHarvested: number;
  harvestEfficiency: number;
}

interface QualityMetrics {
  rejectionRate: number;
  avgQualityScore: number;
  onTimePercentage: number;
  totalDeliveries: number;
  onTimeDeliveries: number;
  totalHarvested: number;
}

interface FinancialData {
  total: number;
  sources: number;
  categories: number;
  records: number;
  trend: 'neutral' | 'positive' | 'negative';
}

// Utility functions
const cleanNumericValue = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const cleaned = String(value).replace(/[,kg₹$]/g, '');
  return parseFloat(cleaned) || 0;
};

const tryFieldNames = (row: any, fieldNames: string[]): number => {
  for (const field of fieldNames) {
    if (row[field] !== undefined) {
      return cleanNumericValue(row[field]);
    }
  }
  return 0;
};

// Agriculture-specific production metrics calculator
function calculateProductionMetrics(sheetsData: SheetsData): ProductionMetrics {
  const batches = sheetsData?.Batches?.rows || [];
  const harvestLog = sheetsData?.Harvest_Log?.rows || [];
  
  // Log available sheets and their structures for debugging
  console.log(`🌿 Available sheets: ${Object.keys(sheetsData).join(', ')}`);
  
  const activeBatches = batches.filter((row: any) => {
    if (!row.ExpectedHarvest) return false;
    try {
      const expectedDate = new Date(row.ExpectedHarvest);
      return expectedDate >= new Date(); // Not yet harvested
    } catch {
      return false;
    }
  }).length;
  
  // Calculate expected yield with multiple field name patterns
  const expectedYieldFields = ['ExpectedYield(kg)', 'ExpectedYield', 'Expected Yield'];
  const revisedYieldFields = ['RevisedYield(kg)', 'RevisedYield', 'Revised Yield'];
  
  const totalExpectedYield = batches.reduce((sum: number, row: any) => {
    const expected = tryFieldNames(row, expectedYieldFields);
    const revised = tryFieldNames(row, revisedYieldFields);
    return sum + (revised || expected);
  }, 0);
  
  // Calculate harvested quantities
  const harvestedFields = ['QtyHarvested(kg)', 'QtyHarvested', 'Quantity Harvested', 'Harvest Qty'];
  const totalHarvested = harvestLog.reduce((sum: number, row: any) => {
    return sum + tryFieldNames(row, harvestedFields);
  }, 0);
  
  const harvestEfficiency = totalExpectedYield > 0 
    ? parseFloat(((totalHarvested / totalExpectedYield) * 100).toFixed(1))
    : 0;
  
  return { activeBatches, totalExpectedYield, totalHarvested, harvestEfficiency };
}

// Agriculture-specific harvest quality metrics
function calculateHarvestMetrics(sheetsData: SheetsData): QualityMetrics {
  const harvestLog = sheetsData?.Harvest_Log?.rows || [];
  const postHarvest = sheetsData?.Post_Harvest?.rows || [];
  
  const harvestedFields = ['QtyHarvested(kg)', 'QtyHarvested', 'Quantity Harvested', 'Harvest Qty'];
  const rejectedFields = ['Rejected(kg)', 'Rejected', 'Qty Rejected'];
  const acceptedFields = ['Accepted(kg)', 'Accepted', 'Qty Accepted'];
  const qcFields = ['QC', 'Quality', 'QualityScore'];
  
  const qualityData = harvestLog.reduce((acc: any, row: any) => {
    const harvested = tryFieldNames(row, harvestedFields);
    const rejected = tryFieldNames(row, rejectedFields);
    const accepted = tryFieldNames(row, acceptedFields);
    
    acc.totalHarvested += harvested;
    acc.totalRejected += rejected;
    acc.totalAccepted += accepted;
    
    // Quality control score
    const qc = tryFieldNames(row, qcFields);
    if (qc > 0) acc.qcScores.push(qc);
    
    return acc;
  }, { totalHarvested: 0, totalRejected: 0, totalAccepted: 0, qcScores: [] });
  
  const rejectionRate = qualityData.totalHarvested > 0 
    ? parseFloat(((qualityData.totalRejected / qualityData.totalHarvested) * 100).toFixed(1))
    : 0;
  
  const avgQualityScore = qualityData.qcScores.length > 0
    ? parseFloat((qualityData.qcScores.reduce((a: number, b: number) => a + b, 0) / qualityData.qcScores.length).toFixed(1))
    : 0;
  
  // Calculate on-time deliveries
  const onTimeDeliveries = postHarvest.filter(row => {
    const onTimeValue = row['OnTime(0/1)'];
    return String(onTimeValue) === '1';
  }).length;
  
  const totalDeliveries = postHarvest.length;
  const onTimePercentage = totalDeliveries > 0 
    ? parseFloat(((onTimeDeliveries / totalDeliveries) * 100).toFixed(1))
    : 0;
  
  return {
    rejectionRate,
    avgQualityScore,
    onTimePercentage,
    totalDeliveries,
    onTimeDeliveries,
    totalHarvested: qualityData.totalHarvested
  };
}

// Enhanced sheet type detection with agriculture-specific patterns
const SHEET_TYPE_CONFIG = {
  'production-batches': { 
    keywords: ['BATCH'], 
    headers: ['BatchID', 'SownDate'],
    color: 'green',
    icon: '🌱'
  },
  'harvest-tracking': { 
    keywords: ['HARVEST'], 
    headers: ['QtyHarvested', 'HarvestDate'],
    color: 'orange',
    icon: '🌾'
  },
  'sourcing-procurement': { 
    keywords: ['SOURCING', 'PROCUREMENT'], 
    headers: ['Vendor', 'Supplier'],
    color: 'blue',
    icon: '🚚'
  },
  'post-harvest-logistics': { 
    keywords: ['POST_HARVEST', 'POST-HARVEST'], 
    headers: ['Sorting', 'Packaging', 'Transit'],
    color: 'purple',
    icon: '📦'
  },
  'financial-revenue': { 
    keywords: [], 
    headers: ['Revenue', 'Income', 'Sales'],
    color: 'emerald',
    icon: '💰'
  },
  'financial-expense': { 
    keywords: [], 
    headers: ['Expense', 'Cost', 'Amount'],
    color: 'red',
    icon: '💸'
  },
  'production-settings': { 
    keywords: ['SETTINGS'], 
    headers: ['PricePerKg', 'GermDays'],
    color: 'gray',
    icon: '⚙️'
  }
};

function detectSheetType(name: string, headers: string[]): string {
  const nameUpper = name.toUpperCase();
  
  for (const [type, config] of Object.entries(SHEET_TYPE_CONFIG)) {
    const hasKeyword = config.keywords.some(keyword => nameUpper.includes(keyword));
    const hasHeader = config.headers.some(header => 
      headers.some(h => h && h.includes(header))
    );
    
    if (hasKeyword || hasHeader) return type;
  }
  
  return 'general';
}

function getSheetColor(name: string, headers: string[]): string {
  const type = detectSheetType(name, headers);
  return SHEET_TYPE_CONFIG[type as keyof typeof SHEET_TYPE_CONFIG]?.color || 'slate';
}

function getSheetIcon(name: string, headers: string[]): string {
  const type = detectSheetType(name, headers);
  return SHEET_TYPE_CONFIG[type as keyof typeof SHEET_TYPE_CONFIG]?.icon || '📄';
}

// Generate agriculture-focused summary cards
function generateAgriculturalSummaryCards(sheetsData: SheetsData) {
  const production = calculateProductionMetrics(sheetsData);
  const quality = calculateHarvestMetrics(sheetsData);
  const revenue = detectRevenueData(sheetsData);
  const expenses = detectExpenseData(sheetsData);
  const profit = revenue.total - expenses.total;
  
  const cards = [
    {
      title: "Total Revenue",
      value: revenue.total,
      subtitle: `${revenue.sources} revenue streams`,
      type: "financial",
      trend: 'neutral' as const,
      color: "green",
      icon: "TrendingUp"
    },
    {
      title: "Total Expenses",
      value: expenses.total,
      subtitle: `${expenses.categories} expense categories`,
      type: "financial",
      trend: 'neutral' as const,
      color: "red",
      icon: "CreditCard"
    },
    {
      title: "Net Profit",
      value: profit,
      subtitle: profit >= 0 ? "Profitable" : "Loss",
      type: "financial",
      trend: profit >= 0 ? 'positive' as const : 'negative' as const,
      color: profit >= 0 ? "green" : "red",
      icon: profit >= 0 ? "TrendingUp" : "TrendingDown"
    },
    {
      title: "Active Batches",
      value: production.activeBatches,
      subtitle: "Currently growing",
      type: "production",
      trend: 'neutral' as const,
      color: "blue",
      icon: "Package"
    },
    {
      title: "Total Harvested",
      value: quality.totalHarvested,
      subtitle: `${production.harvestEfficiency}% efficiency`,
      type: "production",
      trend: production.harvestEfficiency >= 80 ? 'positive' as const : 'neutral' as const,
      color: "orange",
      icon: "Truck"
    },
    {
      title: "Quality Score",
      value: quality.avgQualityScore,
      subtitle: `${quality.rejectionRate}% rejection rate`,
      type: "quality",
      trend: quality.avgQualityScore >= 7 ? 'positive' as const : 'neutral' as const,
      color: "purple",
      icon: "Award"
    }
  ];
  
  // Add logistics performance if data available
  if (quality.totalDeliveries > 0) {
    cards.push({
      title: "On-Time Delivery",
      value: quality.onTimePercentage,
      subtitle: `${quality.onTimeDeliveries}/${quality.totalDeliveries} deliveries`,
      type: "logistics",
      trend: quality.onTimePercentage >= 90 ? 'positive' as const : 'neutral' as const,
      color: "indigo",
      icon: "Clock"
    });
  }
  
  // Data overview
  const totalRecords = Object.values(sheetsData).reduce((sum, sheet) => sum + sheet.rows.length, 0);
  cards.push({
    title: "Total Records",
    value: totalRecords,
    subtitle: `${Object.keys(sheetsData).length} data sheets`,
    type: "data",
    trend: 'neutral' as const,
    color: "gray",
    icon: "FileText"
  });
  
  return cards;
}

// Financial data detection with agriculture context
function detectFinancialData(sheetsData: SheetsData, isRevenue: boolean): FinancialData {
  const searchFields = isRevenue 
    ? ['revenue', 'income', 'sales']
    : ['expense', 'cost', 'amount', 'outstanding'];
  
  let total = 0;
  let sources = 0;
  let categories = new Set();
  let records = 0;
  
  Object.entries(sheetsData).forEach(([sheetName, sheetData]) => {
    if (!sheetData?.rows?.length || !sheetData.headers) return;
    
    const relevantColumns = sheetData.headers.filter(header => 
      header && searchFields.some(field => 
        header.toLowerCase().includes(field) || 
        (header.includes('₹') && (isRevenue ? header.toLowerCase().includes('revenue') : !header.toLowerCase().includes('revenue')))
      )
    );
    
    if (relevantColumns.length > 0) {
      sources++;
      
      sheetData.rows.forEach((row: any) => {
        relevantColumns.forEach(col => {
          const value = cleanNumericValue(row[col]);
          if (value > 0) {
            total += value;
            records++;
            
            // Categorize by available fields
            ['Crop', 'Variety', 'Type', 'Department', 'Vendor', 'Description'].forEach(field => {
              if (row[field]) categories.add(row[field]);
            });
          }
        });
      });
    }
  });
  
  return { total, sources, categories: categories.size, records, trend: 'neutral' };
}

function detectRevenueData(sheetsData: SheetsData): FinancialData {
  return detectFinancialData(sheetsData, true);
}

function detectExpenseData(sheetsData: SheetsData): FinancialData {
  return detectFinancialData(sheetsData, false);
}

// Calculate comprehensive financial metrics
function calculateFinancialMetrics(sheetsData: SheetsData) {
  const revenue = detectRevenueData(sheetsData);
  const expenses = detectExpenseData(sheetsData);
  
  const profit = revenue.total - expenses.total;
  const profitMargin = revenue.total > 0 ? parseFloat(((profit / revenue.total) * 100).toFixed(2)) : 0;
  
  return {
    revenue: revenue.total,
    expenses: expenses.total,
    profit,
    profitMargin,
    revenueStreams: revenue.sources,
    expenseCategories: expenses.categories
  };
}

// Comprehensive dynamic structure generator with agriculture focus
async function generateDynamicDashboard(sheetsData: SheetsData) {
  const production = calculateProductionMetrics(sheetsData);
  const quality = calculateHarvestMetrics(sheetsData);
  const financial = calculateFinancialMetrics(sheetsData);
  const totalRecords = Object.values(sheetsData).reduce((sum, sheet) => sum + sheet.rows.length, 0);
  
  return {
    metadata: {
      title: "Triton Food Works Masterbook",
      totalSheets: Object.keys(sheetsData).length,
      totalRecords,
      lastUpdated: new Date().toISOString(),
      businessType: 'Agriculture & Food Processing',
      connectionStatus: 'connected'
    },
    
    production,
    quality,
    revenue: detectRevenueData(sheetsData),
    expenses: detectExpenseData(sheetsData),
    summaryCards: generateAgriculturalSummaryCards(sheetsData),
    financial,
    financialMetrics: financial,
    
    operationalMetrics: {
      total: totalRecords,
      active: production.activeBatches,
      completed: 0,
      pending: 0,
      completionRate: 0
    },
    
    sheets: Object.entries(sheetsData).map(([name, data]) => ({
      name,
      type: detectSheetType(name, data.headers),
      records: data.rows.length,
      headers: data.headers,
      color: getSheetColor(name, data.headers),
      icon: getSheetIcon(name, data.headers),
      lastRecord: data.rows.length > 0 ? data.rows[data.rows.length - 1] : null
    })),
    
    sheetsConfig: Object.entries(sheetsData).map(([name, data]) => ({
      name,
      type: detectSheetType(name, data.headers),
      icon: getSheetIcon(name, data.headers),
      color: getSheetColor(name, data.headers),
      recordCount: data.rows.length,
      headers: data.headers,
      keyColumns: data.headers.slice(0, 3),
      metrics: {}
    })),
    
    rawData: sheetsData
  };
}

export default async function Home() {
  try {
    const sheetsData = await Promise.race([
      getAllSheets(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout fetching sheets data")), 15000)
      )
    ]) as SheetsData;
    
    if (!sheetsData || typeof sheetsData !== 'object' || Object.keys(sheetsData).length === 0) {
      throw new Error("No sheets found in the Google Sheets data");
    }
    
    const dashboardData = await generateDynamicDashboard(sheetsData);
    return <ModernExcelDashboard data={dashboardData} />;
    
  } catch (error) {
    console.error('❌ Error fetching data:', error instanceof Error ? error.message : String(error));
    
    const fallbackData = {
      metadata: {
        title: "Triton Food Works Masterbook",
        totalSheets: 0,
        totalRecords: 0,
        lastUpdated: new Date().toISOString(),
        businessType: 'Agriculture & Food Processing',
        connectionStatus: 'disconnected'
      },
      production: { activeBatches: 0, totalExpectedYield: 0, totalHarvested: 0, harvestEfficiency: 0 },
      quality: { rejectionRate: 0, avgQualityScore: 0, onTimePercentage: 0, totalDeliveries: 0, onTimeDeliveries: 0, totalHarvested: 0 },
      revenue: { total: 0, sources: 0, categories: 0, records: 0, trend: 'neutral' as const },
      expenses: { total: 0, sources: 0, categories: 0, records: 0, trend: 'neutral' as const },
      summaryCards: [{
        title: "Error Loading Data",
        value: 0,
        subtitle: "Please check connection",
        type: "error",
        trend: "neutral",
        color: "red",
        icon: "AlertCircle"
      }],
      financial: { revenue: 0, expenses: 0, profit: 0, profitMargin: 0, revenueStreams: 0, expenseCategories: 0 },
      financialMetrics: { revenue: 0, expenses: 0, profit: 0, profitMargin: 0, revenueStreams: 0, expenseCategories: 0 },
      operationalMetrics: { total: 0, active: 0, completed: 0, pending: 0, completionRate: 0 },
      sheetsConfig: [],
      rawData: {},
      sheets: []
    };
    
    return <ModernExcelDashboard data={fallbackData} />;
  }
}