'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip';

// Helper functions for data processing
const EMPTY_VALUES = ['', null, undefined, 0, '0', 'N/A', 'n/a', 'na', 'NA', '-', 'null', 'undefined'];

function isEmptyValue(value: any): boolean {
  if (EMPTY_VALUES.includes(value)) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    return trimmed === '' || ['n/a', 'na', 'null', 'undefined', '-'].includes(trimmed);
  }
  return false;
}

function isAmountField(key: string, value: any): boolean {
  const amountKeywords = ['amount', 'price', 'cost', 'revenue', 'expense', 'total', 'value', 'payment', 'salary', 'fee', 'rate', 'sum', 'perkig', 'per_kg'];
  const keyLower = key.toLowerCase();
  const hasAmountKeyword = amountKeywords.some(keyword => keyLower.includes(keyword));
  const isNumeric = !isNaN(parseFloat(value)) && isFinite(value);
  const hasCurrencySymbol = typeof value === 'string' && /[₹$€£¥]/.test(value);
  return (hasAmountKeyword && isNumeric) || hasCurrencySymbol;
}

function formatAmount(amount: any): string {
  if (isEmptyValue(amount)) return '₹0';
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[₹,$]/g, '')) : amount;
  if (isNaN(numAmount)) return '₹0';
  return '₹' + numAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatNumber(value: any): string {
  if (typeof value !== 'number' || isNaN(value)) return value;
  return value % 1 === 0 ? value.toString() : value.toFixed(2);
}

function isExcelDate(value: any): boolean {
  // Check both numbers and string representations of Excel dates
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return typeof numValue === 'number' && !isNaN(numValue) && numValue > 30000 && numValue < 2958466;
}

function isDateString(value: any): boolean {
  if (typeof value !== 'string') return false;
  const datePatterns = [
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,
    /^\d{4}-\d{1,2}-\d{1,2}$/,
    /^\d{1,2}-\d{1,2}-\d{4}$/,
    /^\d{1,2}\.\d{1,2}\.\d{4}$/,
    /^\d{4}\/\d{1,2}\/\d{1,2}$/
  ];
  return datePatterns.some(pattern => pattern.test(value)) && !isNaN(Date.parse(value));
}

function formatDate(value: any): string {
  // Debug Excel date conversion
  if ((typeof value === 'number' && value > 1000) || (typeof value === 'string' && parseFloat(value) > 1000)) {
    console.log(`🔧 Formatting Excel date: ${value} (type: ${typeof value})`);
  }
  
  // Handle Excel serial date numbers correctly (both string and number formats)
  // Excel dates start from January 1, 1900 (but Excel mistakenly treats 1900 as a leap year)
  // Unix epoch starts from January 1, 1970
  // The difference is 70 years + 1 day for the leap year bug = 25569 days
  let date: Date;
  if (typeof value === 'string') {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 30000) {
      // String representation of Excel serial date
      // Create date in UTC to avoid timezone issues
      date = new Date(Date.UTC(1970, 0, 1) + (numValue - 25569) * 86400 * 1000);
    } else {
      date = new Date(value);
    }
  } else if (typeof value === 'number') {
    // Create date in UTC to avoid timezone issues
    date = new Date(Date.UTC(1970, 0, 1) + (value - 25569) * 86400 * 1000);
  } else {
    date = new Date(value);
  }
  
  if (isNaN(date.getTime())) {
    console.log(`❌ Invalid date conversion for: ${value}`);
    return String(value);
  }
  
  // Check if the date has significant time components (ignore minor fractions)
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const hasTime = hours !== 0 || minutes !== 0;
  
  if (hasTime) {
    // Format with both date and time for sorting/dispatch times
    const formattedDateTime = date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      timeZone: 'UTC'
    }) + ' ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
    });
    console.log(`✅ Formatted Excel date ${value} -> ${formattedDateTime}`);
    return formattedDateTime;
  } else {
    // Format date only for harvest dates
    const formattedDate = date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      timeZone: 'UTC'
    });
    console.log(`✅ Formatted Excel date ${value} -> ${formattedDate}`);
    return formattedDate;
  }
}

function calculateTimeMetricsWithAmount(data: any[], dateFields: string[], amountFields: string[], days: number) {
  if (!dateFields.length) {
    const totalRecords = data.length;
    const sampleCount = Math.floor(totalRecords / (30 / days));
    const totalAmount = calculateTotalAmount(data, amountFields);
    const sampleAmount = Math.floor(totalAmount / (30 / days));
    return { count: sampleCount, percentage: (sampleCount / totalRecords) * 100, totalAmount: sampleAmount };
  }
  
  const currentDate = new Date();
  const targetDate = new Date(currentDate);
  targetDate.setDate(currentDate.getDate() - days);
  
  let count = 0;
  let totalAmount = 0;
  
  data.forEach(row => {
    const isInTimeRange = dateFields.some(field => {
      if (!row[field]) return false;
      const recordDate = isExcelDate(row[field]) 
        ? new Date((row[field] - 25569) * 86400 * 1000)
        : new Date(row[field]);
      return recordDate >= targetDate && recordDate <= currentDate;
    });
    
    if (isInTimeRange) {
      count++;
      amountFields.forEach(field => {
        if (row[field]) {
          const amount = typeof row[field] === 'string' 
            ? parseFloat(row[field].replace(/[₹,$]/g, ''))
            : parseFloat(row[field]);
          if (!isNaN(amount)) totalAmount += amount;
        }
      });
    }
  });
  
  return {
    count,
    percentage: data.length > 0 ? (count / data.length) * 100 : 0,
    totalAmount
  };
}

function calculateTotalAmount(data: any[], amountFields: string[]): number {
  return data.reduce((total, row) => {
    return total + amountFields.reduce((rowTotal, field) => {
      if (!row[field]) return rowTotal;
      const amount = typeof row[field] === 'string' 
        ? parseFloat(row[field].replace(/[₹,$]/g, ''))
        : parseFloat(row[field]);
      return !isNaN(amount) ? rowTotal + amount : rowTotal;
    }, 0);
  }, 0);
}

interface ExcelDashboardProps {
  data: any;
}

const ExcelDashboard: React.FC<ExcelDashboardProps> = ({ data }) => {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [scrollVisible, setScrollVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showAllRecords, setShowAllRecords] = useState<{[key: string]: boolean}>({});
  
  const INITIAL_RECORDS_LIMIT = 6;

  // Get all sheets from data
  const sheetNames = Object.keys(data.rawData || {}).filter(
    name => name.toLowerCase() !== 'dashboard'
  );

  useEffect(() => {
    setIsClient(true);
    
    if (sheetNames.length > 0 && !activeSheet) {
      setActiveSheet(sheetNames[0]);
    }
    
    setLastUpdated(new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }));
    
    const handleScroll = () => {
      setScrollVisible(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [data, sheetNames, activeSheet]);

  // Prepare all data for dashboard metrics
  const allData: any[] = [];
  Object.values(data.rawData || {}).forEach((sheet: any) => {
    if (sheet.rows) {
      allData.push(...sheet.rows);
    }
  });
  
  // Find date and amount fields
  const dateFields: string[] = [];
  const amountFields: string[] = [];
  
  if (allData.length > 0) {
    const sampleRow = allData[0];
    Object.keys(sampleRow || {}).forEach(key => {
      const value = sampleRow[key];
      if (value && (isExcelDate(value) || isDateString(value))) {
        dateFields.push(key);
      } else if (value && isAmountField(key, value)) {
        amountFields.push(key);
      }
    });
  }
  
  // Calculate metrics for dashboard cards
  const dailyMetrics = calculateTimeMetricsWithAmount(allData, dateFields, amountFields, 1);
  const weeklyMetrics = calculateTimeMetricsWithAmount(allData, dateFields, amountFields, 7);
  const monthlyMetrics = calculateTimeMetricsWithAmount(allData, dateFields, amountFields, 30);
  
  const dashboardCards = [
    {
      type: 'daily',
      icon: 'calendar',
      title: 'Daily',
      value: dailyMetrics.count,
      label: 'Records Today',
      amount: dailyMetrics.totalAmount,
      amountLabel: 'Total Amount',
      details: `${dailyMetrics.percentage.toFixed(1)}% of total data`
    },
    {
      type: 'weekly',
      icon: 'calendar-days',
      title: 'Weekly',
      value: weeklyMetrics.count,
      label: 'Records This Week',
      amount: weeklyMetrics.totalAmount,
      amountLabel: 'Total Amount',
      details: `${weeklyMetrics.percentage.toFixed(1)}% of total data`
    },
    {
      type: 'monthly',
      icon: 'calendar-range',
      title: 'Monthly',
      value: monthlyMetrics.count,
      label: 'Records This Month',
      amount: monthlyMetrics.totalAmount,
      amountLabel: 'Total Amount',
      details: `${monthlyMetrics.percentage.toFixed(1)}% of total data`
    }
  ];
  
  // Function to scroll to a section
  const scrollToSection = (sheetName: string) => {
    const element = document.getElementById(`sheet-${sheetName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActiveSheet(sheetName);
  };
  
  // Check if a record has meaningful content
  const hasMinimalContent = (record: any): boolean => {
    const keys = Object.keys(record);
    let meaningfulCount = 0;
    let hasImportantField = false;
    
    const importantFields = ['BatchID', 'Date', 'Employee', 'Vendor', 'Description', 'Amount', 'Cost', 'QtyHarvested'];
    
    for (const key of keys) {
      const value = record[key];
      
      if (isEmptyValue(value)) continue;
      
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length <= 1) continue;
        if (['tbd', 'tbc', 'pending', 'temp', 'test', 'na', 'n/a'].includes(trimmed.toLowerCase())) continue;
      }
      
      meaningfulCount++;
      
      const fieldLower = key.toLowerCase();
      const isImportantField = importantFields.some(field => 
        fieldLower.includes(field.toLowerCase()) || 
        fieldLower === field.toLowerCase()
      ) || 
      fieldLower.includes('id') || 
      fieldLower.includes('name') || 
      fieldLower.includes('amount') ||
      fieldLower.includes('qty') ||
      fieldLower.includes('price') ||
      fieldLower.includes('cost');
      
      if (isImportantField && !isEmptyValue(value)) {
        hasImportantField = true;
      }
    }
    
    return meaningfulCount >= 2 && hasImportantField;
  };

  // Filter records based on content quality
  const filterRecords = (records: any[]): any[] => {
    const nonEmptyRecords = records.filter(hasMinimalContent);
    
    const sortedRecords = nonEmptyRecords.sort((a, b) => {
      const importantFields = ['BatchID', 'Date', 'Amount', 'Employee', 'Vendor', 'Description'];
      
      const aScore = importantFields.reduce((score, field) => {
        return score + (a[field] && !isEmptyValue(a[field]) ? 1 : 0);
      }, 0);
      
      const bScore = importantFields.reduce((score, field) => {
        return score + (b[field] && !isEmptyValue(b[field]) ? 1 : 0);
      }, 0);
      
      return bScore - aScore;
    });
    
    return sortedRecords;
  };
  
  // Get limited records for a sheet
  const getLimitedRecords = (records: any[], sheetName: string): any[] => {
    const filteredRecords = filterRecords(records);
    const showAll = showAllRecords[sheetName] || false;
    
    return showAll || filteredRecords.length <= INITIAL_RECORDS_LIMIT
      ? filteredRecords
      : filteredRecords.slice(0, INITIAL_RECORDS_LIMIT);
  };

  // Toggle show all records for a sheet
  const toggleShowAllRecords = (sheetName: string): void => {
    setShowAllRecords(prev => ({ ...prev, [sheetName]: !prev[sheetName] }));
  };
  
  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Function to refresh data
  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLastUpdated(new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-muted-foreground">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading data...
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Triton Food Works Masterbook
                </h1>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  {isClient && lastUpdated ? lastUpdated : 'Loading...'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Refresh Button */}
              <Button 
                onClick={refreshData}
                variant="outline"
                size="sm"
                className="bg-white/80 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all duration-200 h-9 px-4"
                disabled={loading}
              >
                <svg className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span className="text-sm font-medium">{loading ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
              
              <div className="hidden sm:flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                  {Object.keys(data?.rawData || {}).length} Sheets
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">
                  Live Data
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Cards */}
      {dashboardCards.length > 0 && (
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-3">
            <div className="space-y-2">
              <div>
                <h2 className="text-base font-semibold tracking-tight">Analytics</h2>
                <p className="text-xs text-muted-foreground">Key metrics from operations</p>
              </div>
              
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {dashboardCards.map((card, index) => (
                  <div key={index} className="card hover-lift animate-fade-in" style={{animationDelay: `${index * 50}ms`}}>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            {card.icon === 'calendar' && (
                              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            )}
                            {card.icon === 'calendar-days' && (
                              <>
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                <line x1="16" x2="16" y1="2" y2="6" />
                                <line x1="8" x2="8" y1="2" y2="6" />
                                <line x1="3" x2="21" y1="10" y2="10" />
                              </>
                            )}
                            {card.icon === 'calendar-range' && (
                              <>
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                <line x1="16" x2="16" y1="2" y2="6" />
                                <line x1="8" x2="8" y1="2" y2="6" />
                                <line x1="3" x2="21" y1="10" y2="10" />
                                <rect width="4" height="4" x="8" y="14" />
                              </>
                            )}
                          </svg>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 font-medium">{card.title}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-lg font-bold tracking-tight">{card.value}</div>
                            <div className="text-xs text-muted-foreground">{card.label}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-semibold text-green-600">{formatAmount(card.amount)}</div>
                            <div className="text-xs text-muted-foreground">{card.amountLabel}</div>
                          </div>
                        </div>
                        
                        <div className="pt-1 border-t border-border">
                          <div className="text-xs text-muted-foreground">{card.details}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sheet Navigation */}
      {sheetNames.length > 1 && (
        <div className="border-b border-gray-200/60 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Data Sheets</h3>
                <span className="text-xs text-muted-foreground">{sheetNames.length} sheets available</span>
              </div>
              <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
                {sheetNames.map((sheetName) => (
                  <button
                    key={sheetName}
                    className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 border ${
                      activeSheet === sheetName 
                        ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-200' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200 bg-white'
                    }`}
                    onClick={() => scrollToSection(sheetName)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        activeSheet === sheetName ? 'bg-white' : 'bg-gray-400'
                      }`}></div>
                      {sheetName.replace(/_/g, ' ')}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          {sheetNames.map(sheetName => {
            const sheet = data.rawData[sheetName];
            const allRows = sheet?.rows || [];
            const filteredRows = filterRecords(allRows);
            const displayRows = getLimitedRecords(allRows, sheetName);
            const hasMoreRecords = filteredRows.length > INITIAL_RECORDS_LIMIT && !showAllRecords[sheetName];
            const showingCount = displayRows.length;
            const totalCount = filteredRows.length;
            
            return (
              <div key={sheetName} id={`sheet-${sheetName}`} className="animate-fade-in">
                <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50/30 border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200/60">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                          {sheetName.replace(/_/g, ' ')}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          {showingCount} of {allRows.length} records • Real-time data
                        </CardDescription>
                      </div>
                      {allRows.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                            {totalCount} total
                          </Badge>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    {displayRows.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4 shadow-sm">
                          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium mb-2 text-gray-900">No records found</h3>
                        <p className="text-sm text-muted-foreground">No data available for this sheet</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {displayRows.map((record, index) => {
                            const recordKeys = Object.keys(record).filter(key => !isEmptyValue(record[key]));
                            
                            return (
                              <div key={index} className="border border-border rounded-lg p-2.5 hover-lift animate-scale-in" style={{animationDelay: `${index * 30}ms`}}>
                                <div className="space-y-1.5">
                                  {recordKeys.slice(0, 5).map(key => {
                                    const value = record[key];
                                    const isAmount = isAmountField(key, value);
                                    const isDate = isExcelDate(value) || isDateString(value);
                                    
                                    return (
                                      <div key={key} className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0 mr-1">
                                          <p className="text-xs font-medium text-muted-foreground truncate">{key}</p>
                                          <p className={`text-sm truncate ${
                                            isAmount ? 'font-semibold text-green-600' : 'text-foreground'
                                          }`}>
                                            {isAmount ? formatAmount(value) : 
                                             isDate ? formatDate(value) : 
                                             formatNumber(value)}
                                          </p>
                                        </div>
                                        {isAmount && (
                                          <span className="text-xs px-1 py-0.5 bg-green-100 text-green-700 rounded">₹</span>
                                        )}
                                        {isDate && (
                                          <span className="text-xs px-1 py-0.5 bg-blue-100 text-blue-700 rounded">📅</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {(hasMoreRecords || showAllRecords[sheetName]) && (
                          <div className="mt-6 text-center border-t border-gray-200/60 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => toggleShowAllRecords(sheetName)}
                              className="bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all duration-200"
                            >
                              {showAllRecords[sheetName] ? (
                                <>
                                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
                                  </svg>
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                                  </svg>
                                  Show All ({totalCount})
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </main>

      {/* Scroll to Top Button */}
      <Button
        className={`fixed bottom-6 right-6 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 z-50 border-0 ${
          scrollVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 invisible translate-y-4 scale-95'
        }`}
        onClick={scrollToTop}
        size="icon"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
        </svg>
      </Button>
    </div>
  );
};

export default ExcelDashboard;
