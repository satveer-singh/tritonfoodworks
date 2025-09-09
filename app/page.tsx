/**
 * Main Dashboard Page Component for Triton Food Works Agricultural Dashboard
 * 
 * This is the main entry point for the agricultural dashboard application.
 * It provides real-time data integration from Google Sheets and renders
 * a comprehensive dashboard interface with automatic updates.
 * 
 * Key Features:
 * - Real-time Google Sheets data integration with 30-second refresh
 * - Agricultural-specific metric calculations
 * - Production, quality, and financial analytics
 * - Dynamic dashboard configuration
 * - Comprehensive error handling and fallbacks
 * - Type-safe data processing
 * - Client-side rendering for real-time updates
 * 
 * Architecture:
 * - Client Component using custom real-time data hook
 * - Auto-refreshing data with retry logic
 * - Processes raw Google Sheets data into structured metrics
 * - Generates dynamic dashboard configuration
 * - Handles loading states and connection issues gracefully
 * 
 * @author Triton Food Works
 * @version 2.0.0 - Real-time Client Component
 */

'use client';

import React, { useMemo } from 'react';
import ModernExcelDashboard from '../components/ModernExcelDashboard';
import { useRealTimeSheetsData } from '../lib/useRealTimeSheetsData';

/**
 * Production Metrics Interface
 * 
 * Defines the structure for agricultural production analytics.
 * These metrics track the core production performance indicators
 * that are critical for agricultural business operations.
 */
interface ProductionMetrics {
  activeBatches: number;        // Number of currently growing batches
  totalExpectedYield: number;   // Total expected harvest quantity (kg)
  totalHarvested: number;       // Actual harvested quantity (kg)
  harvestEfficiency: number;    // Percentage of expected vs actual harvest
}

/**
 * Quality Metrics Interface
 * 
 * Defines the structure for harvest quality and logistics performance.
 * These metrics help track the quality control processes and
 * delivery performance of the agricultural operation.
 */
interface QualityMetrics {
  rejectionRate: number;        // Percentage of harvest rejected for quality
  avgQualityScore: number;      // Average quality score (0-100)
  onTimePercentage: number;     // Percentage of on-time deliveries
  totalDeliveries: number;      // Total number of deliveries made
  onTimeDeliveries: number;     // Number of on-time deliveries
  totalHarvested: number;       // Total quantity harvested
}

/**
 * Revenue Data Interface
 * 
 * Defines the structure for revenue analytics tracking all income
 * sources and revenue performance metrics for the agricultural business.
 */
interface RevenueData {
  total: number;                // Total revenue across all sources
  sources: number;              // Number of different revenue sources
  categories: number;           // Number of revenue categories
  records: number;              // Total number of revenue records
  trend: 'up' | 'down' | 'neutral'; // Revenue trend indicator
}

/**
 * Expense Data Interface
 * 
 * Defines the structure for expense analytics tracking all cost
 * categories and expense management metrics for the agricultural business.
 */
interface ExpenseData {
  total: number;                // Total expenses across all categories
  sources: number;              // Number of different expense sources
  categories: number;           // Number of expense categories
  records: number;              // Total number of expense records
  trend: 'up' | 'down' | 'neutral'; // Expense trend indicator
}

/**
 * Financial Metrics Interface
 * 
 * Defines the structure for comprehensive financial performance metrics
 * including profitability analysis and business health indicators.
 */
interface FinancialMetrics {
  revenue: number;              // Total revenue
  expenses: number;             // Total expenses
  profit: number;               // Net profit (revenue - expenses)
  profitMargin: number;         // Profit margin percentage
  revenueStreams: number;       // Number of active revenue streams
  expenseCategories: number;    // Number of expense categories
}

/**
 * Operational Metrics Interface
 * 
 * Defines the structure for operational performance tracking including
 * batch management, completion rates, and operational efficiency metrics.
 */
interface OperationalMetrics {
  total: number;                // Total number of operations/batches
  active: number;               // Currently active operations
  completed: number;            // Completed operations
  pending: number;              // Pending/scheduled operations
  completionRate: number;       // Percentage of completed operations
}

/**
 * Summary Card Interface
 * 
 * Defines the structure for dashboard summary cards that provide
 * quick visual indicators of key business metrics and performance.
 */
interface SummaryCard {
  title: string;                // Card title
  value: number | string;       // Primary metric value
  subtitle: string;             // Secondary information
  type: string;                 // Card type/category
  trend: string;                // Trend indicator
  color: string;                // Visual color theme
  icon: string;                 // Icon identifier
}

/**
 * Sheet Configuration Interface
 * 
 * Defines the structure for Google Sheets configuration including
 * sheet identification, data mapping, and processing parameters.
 */
interface SheetConfig {
  name: string;                 // Sheet display name
  id: string;                   // Sheet identifier
  type: string;                 // Sheet data type/category
  enabled: boolean;             // Whether sheet is active
  lastUpdated: string;          // Last update timestamp
  recordCount: number;          // Number of records in sheet
}

/**
 * Dashboard Data Interface
 * 
 * Defines the complete structure for the dashboard data model including
 * all metrics, configuration, and metadata required for rendering.
 */
interface DashboardData {
  metadata: {
    title: string;
    totalSheets: number;
    totalRecords: number;
    lastUpdated: string;
    businessType: string;
    connectionStatus: string;
  };
  production: ProductionMetrics;
  quality: QualityMetrics;
  revenue: RevenueData;
  expenses: ExpenseData;
  summaryCards: SummaryCard[];
  financial: FinancialMetrics;
  financialMetrics: FinancialMetrics;
  operationalMetrics: OperationalMetrics;
  sheetsConfig: SheetConfig[];
  rawData: any;
  sheets: any[];
}

/**
 * Generate Dynamic Dashboard Configuration
 * 
 * This function transforms raw Google Sheets data into a structured
 * dashboard specifically optimized for agricultural business intelligence.
 * It processes multiple data sources and calculates meaningful metrics
 * for production, quality, financial, and operational performance.
 * 
 * @param sheetsData - Raw data from Google Sheets
 * @returns Structured dashboard data with calculated metrics
 */
function generateDynamicDashboard(sheetsData: any): DashboardData {
  /**
   * Initialize Base Dashboard Structure
   * 
   * Create the foundational dashboard structure with metadata
   * and initialize all metric categories to ensure consistent
   * data structure regardless of available sheet data.
   */
  const dashboardData: DashboardData = {
    metadata: {
      title: "Triton Food Works Masterbook",
      totalSheets: 0,
      totalRecords: 0,
      lastUpdated: new Date().toISOString(),
      businessType: 'Agriculture & Food Processing',
      connectionStatus: 'connected'
    },
    production: { activeBatches: 0, totalExpectedYield: 0, totalHarvested: 0, harvestEfficiency: 0 },
    quality: { rejectionRate: 0, avgQualityScore: 0, onTimePercentage: 0, totalDeliveries: 0, onTimeDeliveries: 0, totalHarvested: 0 },
    revenue: { total: 0, sources: 0, categories: 0, records: 0, trend: 'neutral' as const },
    expenses: { total: 0, sources: 0, categories: 0, records: 0, trend: 'neutral' as const },
    summaryCards: [],
    financial: { revenue: 0, expenses: 0, profit: 0, profitMargin: 0, revenueStreams: 0, expenseCategories: 0 },
    financialMetrics: { revenue: 0, expenses: 0, profit: 0, profitMargin: 0, revenueStreams: 0, expenseCategories: 0 },
    operationalMetrics: { total: 0, active: 0, completed: 0, pending: 0, completionRate: 0 },
    sheetsConfig: [],
    rawData: sheetsData || {},
    sheets: []
  };

  // If no data available, return base structure
  if (!sheetsData || typeof sheetsData !== 'object') {
    return dashboardData;
  }

  /**
   * Process Available Sheets
   * 
   * Iterate through all available sheets and extract metadata
   * including sheet names, record counts, and last update times.
   * This information is used for dashboard configuration and
   * data freshness indicators.
   */
  const sheets = Object.keys(sheetsData);
  dashboardData.metadata.totalSheets = sheets.length;
  dashboardData.sheets = sheets;

  let totalRecords = 0;
  const sheetsConfig: SheetConfig[] = [];

  /**
   * Sheet Metadata Processing
   * 
   * For each sheet, extract and calculate metadata including:
   * - Record count for capacity planning
   * - Data freshness for quality assurance
   * - Sheet type identification for processing logic
   * - Enablement status for selective processing
   */
  sheets.forEach(sheetName => {
    const sheetData = sheetsData[sheetName];
    const recordCount = Array.isArray(sheetData) ? sheetData.length : 0;
    totalRecords += recordCount;

    sheetsConfig.push({
      name: sheetName,
      id: sheetName.toLowerCase().replace(/\s+/g, '_'),
      type: determineSheetType(sheetName),
      enabled: true,
      lastUpdated: new Date().toISOString(),
      recordCount: recordCount
    });
  });

  dashboardData.metadata.totalRecords = totalRecords;
  dashboardData.sheetsConfig = sheetsConfig;

  /**
   * Agricultural Production Analysis
   * 
   * Process production-related sheets to calculate key agricultural
   * performance indicators including batch tracking, yield analysis,
   * and harvest efficiency metrics.
   */
  const productionSheets = sheets.filter(name => 
    name.toLowerCase().includes('production') || 
    name.toLowerCase().includes('harvest') ||
    name.toLowerCase().includes('batch') ||
    name.toLowerCase().includes('crop')
  );

  if (productionSheets.length > 0) {
    let activeBatches = 0;
    let totalExpectedYield = 0;
    let totalHarvested = 0;

    productionSheets.forEach(sheetName => {
      const data = sheetsData[sheetName];
      if (Array.isArray(data)) {
        /**
         * Batch Status Analysis
         * 
         * Count active batches by identifying records with status
         * indicating ongoing production (active, growing, in-progress).
         * This helps track current production capacity utilization.
         */
        activeBatches += data.filter(row => 
          row.status && ['active', 'growing', 'in-progress', 'ongoing'].includes(
            String(row.status).toLowerCase()
          )
        ).length;

        /**
         * Yield Calculation
         * 
         * Sum expected and actual yield values across all production
         * records to calculate total production capacity and actual
         * harvest performance. Handles various field naming conventions.
         */
        data.forEach(row => {
          const expectedYield = extractNumericValue(row, ['expected_yield', 'expectedYield', 'target_yield', 'planned_yield']);
          const harvestedAmount = extractNumericValue(row, ['harvested', 'actual_yield', 'harvest_amount', 'yield']);
          
          totalExpectedYield += expectedYield;
          totalHarvested += harvestedAmount;
        });
      }
    });

    /**
     * Production Efficiency Calculation
     * 
     * Calculate harvest efficiency as the percentage of actual harvest
     * compared to expected yield. This is a critical KPI for agricultural
     * operations as it indicates production optimization effectiveness.
     */
    const harvestEfficiency = totalExpectedYield > 0 ? 
      Math.round((totalHarvested / totalExpectedYield) * 100) : 0;

    dashboardData.production = {
      activeBatches,
      totalExpectedYield: Math.round(totalExpectedYield),
      totalHarvested: Math.round(totalHarvested),
      harvestEfficiency
    };
  }

  /**
   * Quality Control Analysis
   * 
   * Process quality-related data to calculate rejection rates,
   * quality scores, and delivery performance metrics that are
   * critical for maintaining product standards and customer satisfaction.
   */
  const qualitySheets = sheets.filter(name => 
    name.toLowerCase().includes('quality') || 
    name.toLowerCase().includes('inspection') ||
    name.toLowerCase().includes('delivery') ||
    name.toLowerCase().includes('logistics')
  );

  if (qualitySheets.length > 0) {
    let totalDeliveries = 0;
    let onTimeDeliveries = 0;
    let qualityScores: number[] = [];
    let rejectedItems = 0;
    let totalItems = 0;

    qualitySheets.forEach(sheetName => {
      const data = sheetsData[sheetName];
      if (Array.isArray(data)) {
        data.forEach(row => {
          /**
           * Delivery Performance Tracking
           * 
           * Track on-time delivery performance by comparing delivery
           * status against expected delivery standards. This metric
           * directly impacts customer satisfaction and business reputation.
           */
          if (row.delivery_status || row.deliveryStatus) {
            totalDeliveries++;
            const status = String(row.delivery_status || row.deliveryStatus).toLowerCase();
            if (status.includes('on-time') || status.includes('ontime') || status === 'delivered') {
              onTimeDeliveries++;
            }
          }

          /**
           * Quality Score Analysis
           * 
           * Collect quality scores from inspection records to calculate
           * average quality performance. Quality scores help identify
           * production issues and maintain consistency standards.
           */
          const qualityScore = extractNumericValue(row, ['quality_score', 'qualityScore', 'inspection_score', 'grade']);
          if (qualityScore > 0) {
            qualityScores.push(qualityScore);
          }

          /**
           * Rejection Rate Calculation
           * 
           * Track rejected items versus total items processed to
           * calculate rejection rate. High rejection rates indicate
           * quality control issues that need immediate attention.
           */
          const rejected = extractNumericValue(row, ['rejected', 'rejection_count', 'failed_inspection']);
          const total = extractNumericValue(row, ['total_items', 'batch_size', 'quantity']);
          
          rejectedItems += rejected;
          totalItems += total;
        });
      }
    });

    /**
     * Quality Metrics Compilation
     * 
     * Calculate comprehensive quality metrics including:
     * - Average quality score across all inspections
     * - Rejection rate as percentage of total production
     * - On-time delivery percentage for logistics performance
     */
    const avgQualityScore = qualityScores.length > 0 ? 
      Math.round(qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length) : 0;
    
    const rejectionRate = totalItems > 0 ? 
      Math.round((rejectedItems / totalItems) * 100) : 0;
    
    const onTimePercentage = totalDeliveries > 0 ? 
      Math.round((onTimeDeliveries / totalDeliveries) * 100) : 0;

    dashboardData.quality = {
      rejectionRate,
      avgQualityScore,
      onTimePercentage,
      totalDeliveries,
      onTimeDeliveries,
      totalHarvested: dashboardData.production.totalHarvested
    };
  }

  /**
   * Financial Performance Analysis
   * 
   * Process financial data to calculate comprehensive business
   * performance metrics including revenue, expenses, profitability,
   * and financial health indicators critical for business decisions.
   */
  const revenueSheets = sheets.filter(name => 
    name.toLowerCase().includes('revenue') || 
    name.toLowerCase().includes('income') ||
    name.toLowerCase().includes('sales') ||
    name.toLowerCase().includes('earnings')
  );

  const expenseSheets = sheets.filter(name => 
    name.toLowerCase().includes('expense') || 
    name.toLowerCase().includes('cost') ||
    name.toLowerCase().includes('expenditure') ||
    name.toLowerCase().includes('spending')
  );

  let totalRevenue = 0;
  let revenueStreams = 0;
  let revenueCategories = new Set<string>();
  let revenueRecords = 0;

  /**
   * Revenue Analysis Processing
   * 
   * Analyze all revenue-related sheets to calculate:
   * - Total revenue across all income sources
   * - Number of active revenue streams
   * - Revenue diversification metrics
   * - Revenue trend analysis for forecasting
   */
  revenueSheets.forEach(sheetName => {
    const data = sheetsData[sheetName];
    if (Array.isArray(data)) {
      revenueRecords += data.length;
      
      data.forEach(row => {
        const amount = extractNumericValue(row, ['amount', 'revenue', 'income', 'value', 'total']);
        const category = row.category || row.type || row.source || 'Other';
        
        if (amount > 0) {
          totalRevenue += amount;
          revenueStreams++;
          revenueCategories.add(String(category));
        }
      });
    }
  });

  let totalExpenses = 0;
  let expenseSources = 0;
  let expenseCategories = new Set<string>();
  let expenseRecords = 0;

  /**
   * Expense Analysis Processing
   * 
   * Analyze all expense-related sheets to calculate:
   * - Total operational costs across all categories
   * - Number of expense sources for cost management
   * - Expense categorization for budget optimization
   * - Cost trend analysis for financial planning
   */
  expenseSheets.forEach(sheetName => {
    const data = sheetsData[sheetName];
    if (Array.isArray(data)) {
      expenseRecords += data.length;
      
      data.forEach(row => {
        const amount = extractNumericValue(row, ['amount', 'expense', 'cost', 'value', 'total']);
        const category = row.category || row.type || row.source || 'Other';
        
        if (amount > 0) {
          totalExpenses += amount;
          expenseSources++;
          expenseCategories.add(String(category));
        }
      });
    }
  });

  /**
   * Profitability Calculations
   * 
   * Calculate key financial performance indicators:
   * - Net profit (revenue minus expenses)
   * - Profit margin percentage for profitability assessment
   * - Revenue and expense diversification metrics
   * - Financial trend indicators for strategic planning
   */
  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0;

  // Determine financial trends based on profit margin
  const revenueTrend: 'up' | 'down' | 'neutral' = profitMargin > 20 ? 'up' : profitMargin < 5 ? 'down' : 'neutral';
  const expenseTrend: 'up' | 'down' | 'neutral' = totalExpenses > totalRevenue * 0.8 ? 'up' : 'down';

  dashboardData.revenue = {
    total: Math.round(totalRevenue),
    sources: revenueStreams,
    categories: revenueCategories.size,
    records: revenueRecords,
    trend: revenueTrend
  };

  dashboardData.expenses = {
    total: Math.round(totalExpenses),
    sources: expenseSources,
    categories: expenseCategories.size,
    records: expenseRecords,
    trend: expenseTrend
  };

  dashboardData.financial = {
    revenue: Math.round(totalRevenue),
    expenses: Math.round(totalExpenses),
    profit: Math.round(profit),
    profitMargin,
    revenueStreams,
    expenseCategories: expenseCategories.size
  };

  dashboardData.financialMetrics = dashboardData.financial;

  /**
   * Operational Metrics Calculation
   * 
   * Calculate operational performance indicators across all sheets
   * to provide insights into operational efficiency, completion rates,
   * and overall business operational health.
   */
  let totalOperations = 0;
  let activeOperations = 0;
  let completedOperations = 0;
  let pendingOperations = 0;

  sheets.forEach(sheetName => {
    const data = sheetsData[sheetName];
    if (Array.isArray(data)) {
      data.forEach(row => {
        if (row.status) {
          totalOperations++;
          const status = String(row.status).toLowerCase();
          
          if (['active', 'ongoing', 'in-progress', 'processing'].includes(status)) {
            activeOperations++;
          } else if (['completed', 'finished', 'done', 'delivered'].includes(status)) {
            completedOperations++;
          } else if (['pending', 'scheduled', 'planned', 'waiting'].includes(status)) {
            pendingOperations++;
          }
        }
      });
    }
  });

  const completionRate = totalOperations > 0 ? 
    Math.round((completedOperations / totalOperations) * 100) : 0;

  dashboardData.operationalMetrics = {
    total: totalOperations,
    active: activeOperations,
    completed: completedOperations,
    pending: pendingOperations,
    completionRate
  };

  /**
   * Summary Cards Generation
   * 
   * Generate key performance indicator cards that provide quick
   * visual insights into the most important business metrics.
   * These cards are displayed prominently on the dashboard.
   */
  dashboardData.summaryCards = [
    {
      title: "Total Revenue",
      value: `₹${(totalRevenue / 1000).toFixed(1)}K`,
      subtitle: `From ${revenueStreams} sources`,
      type: "revenue",
      trend: revenueTrend,
      color: "green",
      icon: "TrendingUp"
    },
    {
      title: "Active Batches",
      value: dashboardData.production.activeBatches,
      subtitle: `${dashboardData.production.harvestEfficiency}% efficiency`,
      type: "production",
      trend: dashboardData.production.harvestEfficiency > 80 ? "up" : "neutral",
      color: "blue",
      icon: "Leaf"
    },
    {
      title: "Quality Score",
      value: `${dashboardData.quality.avgQualityScore}%`,
      subtitle: `${dashboardData.quality.rejectionRate}% rejection rate`,
      type: "quality",
      trend: dashboardData.quality.avgQualityScore > 80 ? "up" : "down",
      color: "purple",
      icon: "Award"
    },
    {
      title: "Profit Margin",
      value: `${profitMargin}%`,
      subtitle: `₹${(Math.abs(profit) / 1000).toFixed(1)}K ${profit >= 0 ? 'profit' : 'loss'}`,
      type: "financial",
      trend: profitMargin > 15 ? "up" : profitMargin < 5 ? "down" : "neutral",
      color: profit >= 0 ? "green" : "red",
      icon: profit >= 0 ? "TrendingUp" : "TrendingDown"
    }
  ];

  return dashboardData;
}

/**
 * Determine Sheet Type Based on Name
 * 
 * Analyze sheet names to categorize them into functional types
 * for appropriate processing logic and dashboard organization.
 * 
 * @param sheetName - Name of the Google Sheet
 * @returns Sheet type category for processing logic
 */
function determineSheetType(sheetName: string): string {
  const name = sheetName.toLowerCase();
  
  if (name.includes('revenue') || name.includes('income') || name.includes('sales')) {
    return 'revenue';
  } else if (name.includes('expense') || name.includes('cost')) {
    return 'expense';
  } else if (name.includes('production') || name.includes('harvest') || name.includes('batch')) {
    return 'production';
  } else if (name.includes('quality') || name.includes('inspection')) {
    return 'quality';
  } else if (name.includes('delivery') || name.includes('logistics')) {
    return 'logistics';
  } else {
    return 'general';
  }
}

/**
 * Extract Numeric Value from Row Data
 * 
 * Safely extract numeric values from row data using multiple
 * possible field names. Handles various data formats and
 * provides fallback values for missing or invalid data.
 * 
 * @param row - Data row object from Google Sheets
 * @param fieldNames - Array of possible field names to check
 * @returns Numeric value or 0 if not found/invalid
 */
function extractNumericValue(row: any, fieldNames: string[]): number {
  for (const fieldName of fieldNames) {
    if (row[fieldName] !== undefined && row[fieldName] !== null) {
      const value = typeof row[fieldName] === 'string' ? 
        parseFloat(row[fieldName].replace(/[^\d.-]/g, '')) : 
        Number(row[fieldName]);
      
      if (!isNaN(value) && isFinite(value)) {
        return Math.abs(value); // Return absolute value for safety
      }
    }
  }
  return 0;
}

/**
 * Main Dashboard Page Component
 * 
 * The main React component that renders the agricultural dashboard
 * with real-time data updates, loading states, and error handling.
 * 
 * Features:
 * - Real-time data fetching with 30-second intervals
 * - Loading state management
 * - Error handling with graceful fallbacks
 * - Automatic dashboard data processing
 * - Connection status monitoring
 * 
 * @returns JSX element containing the dashboard interface
 */
export default function Home() {
  /**
   * Real-time Data Hook
   * 
   * Use the custom hook to fetch Google Sheets data with automatic
   * refresh, retry logic, and connection monitoring. This provides
   * real-time updates to the dashboard without manual refresh.
   */
  const { data: sheetsData, loading, error, connectionStatus } = useRealTimeSheetsData();

  /**
   * Dashboard Data Processing
   * 
   * Use useMemo to process the raw sheets data into dashboard format
   * only when the data changes. This optimization prevents unnecessary
   * recalculations and improves performance with large datasets.
   */
  const dashboardData = useMemo(() => {
    /**
     * Data Validation Check
     * 
     * Verify that sheets data is available and valid before processing.
     * If data is unavailable, return fallback structure to maintain
     * dashboard functionality and user experience.
     */
    if (!sheetsData || typeof sheetsData !== 'object' || Object.keys(sheetsData).length === 0) {
      /**
       * Fallback Dashboard Data
       * 
       * Create a complete fallback dashboard structure that maintains
       * the same interface as normal dashboard but indicates loading
       * or connection issues to the user.
       */
      return {
        metadata: {
          title: "Triton Food Works Masterbook",
          totalSheets: 0,
          totalRecords: 0,
          lastUpdated: new Date().toISOString(),
          businessType: 'Agriculture & Food Processing',
          connectionStatus: connectionStatus === 'connected' ? 'loading' : 'disconnected'
        },
        production: { activeBatches: 0, totalExpectedYield: 0, totalHarvested: 0, harvestEfficiency: 0 },
        quality: { rejectionRate: 0, avgQualityScore: 0, onTimePercentage: 0, totalDeliveries: 0, onTimeDeliveries: 0, totalHarvested: 0 },
        revenue: { total: 0, sources: 0, categories: 0, records: 0, trend: 'neutral' as const },
        expenses: { total: 0, sources: 0, categories: 0, records: 0, trend: 'neutral' as const },
        summaryCards: loading ? [
          {
            title: "Loading Data...",
            value: "⏳",
            subtitle: "Fetching latest information",
            type: "loading",
            trend: "neutral",
            color: "blue",
            icon: "RefreshCw"
          }
        ] : [
          {
            title: error ? "Connection Error" : "No Data Available",
            value: error ? "❌" : "📊",
            subtitle: error ? "Check internet connection" : "No sheets data found",
            type: "error",
            trend: "neutral",
            color: error ? "red" : "gray",
            icon: error ? "AlertCircle" : "Database"
          }
        ],
        financial: { revenue: 0, expenses: 0, profit: 0, profitMargin: 0, revenueStreams: 0, expenseCategories: 0 },
        financialMetrics: { revenue: 0, expenses: 0, profit: 0, profitMargin: 0, revenueStreams: 0, expenseCategories: 0 },
        operationalMetrics: { total: 0, active: 0, completed: 0, pending: 0, completionRate: 0 },
        sheetsConfig: [],
        rawData: {},
        sheets: []
      };
    }

    /**
     * Process Valid Data
     * 
     * When valid sheets data is available, process it through the
     * dynamic dashboard generation function to create comprehensive
     * agricultural metrics and dashboard configuration.
     */
    return generateDynamicDashboard(sheetsData);
  }, [sheetsData, loading, error, connectionStatus]);

  /**
   * Render Dashboard Component
   * 
   * Render the ModernExcelDashboard component with processed data.
   * The dashboard will automatically update when new data arrives
   * from the real-time data hook, providing live business intelligence.
   */
  return <ModernExcelDashboard data={dashboardData} />;
}
