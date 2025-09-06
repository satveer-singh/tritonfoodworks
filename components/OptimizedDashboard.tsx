'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge, type BadgeProps } from './ui/badge';
import { Button, type ButtonProps } from './ui/button';
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
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  RefreshCw, 
  Search,
  ChevronDown,
  ChevronUp,
  Activity,
  BarChart3,
  Users,
  DollarSign
} from 'lucide-react';

// Loading skeleton for cards
const CardSkeleton = () => (
  <Card>
    <CardHeader className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full" />
    </CardContent>
  </Card>
);

// Loading skeleton for table
const TableSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
);

// Enhanced metric card with tooltip and progress
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  progress?: number;
  tooltip?: string;
  color?: 'green' | 'blue' | 'orange' | 'red' | 'purple';
  icon?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  progress, 
  tooltip, 
  color = 'blue',
  icon 
}) => {
  const colorClasses = {
    green: 'text-green-600 bg-green-50 border-green-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
    red: 'text-red-600 bg-red-50 border-red-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200'
  };

  const trendIcons = {
    up: <TrendingUp className="w-4 h-4 text-green-500" />,
    down: <TrendingDown className="w-4 h-4 text-red-500" />,
    neutral: <ArrowRight className="w-4 h-4 text-gray-500" />
  };

  const card = (
    <Card className={`transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer ${colorClasses[color]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        {icon && <div className="text-2xl opacity-70">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        {subtitle && (
          <div className="flex items-center text-xs text-gray-600">
            {trend && <span className="mr-1">{trendIcons[trend]}</span>}
            {subtitle}
          </div>
        )}
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-gray-500 mt-1">{progress.toFixed(1)}% of target</div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {card}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return card;
};

// Enhanced data table component
interface DataTableProps {
  title: string;
  data: any[];
  maxRows?: number;
  searchable?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ title, data, maxRows = 10, searchable = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const displayData = showAll ? filteredData : filteredData.slice(0, maxRows);
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <Badge variant="secondary">{filteredData.length} records</Badge>
        </div>
        {searchable && (
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header} className="font-semibold">
                    {header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((row, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  {headers.map((header) => (
                    <TableCell key={header}>
                      {formatCellValue(row[header])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredData.length > maxRows && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="transition-all duration-200"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show All ({filteredData.length})
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Format cell values with proper display
const formatCellValue = (value: any): React.ReactNode => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400 italic">N/A</span>;
  }

  // Format amounts
  if (typeof value === 'string' && value.includes('₹')) {
    return <span className="font-medium text-green-600">{value}</span>;
  }

  // Format dates
  if (typeof value === 'string' && /^\d{2} \w{3} \d{4}/.test(value)) {
    return <span className="text-blue-600">{value}</span>;
  }

  // Format percentages
  if (typeof value === 'string' && value.includes('%')) {
    return <Badge variant="secondary">{value}</Badge>;
  }

  // Format status/quality indicators
  if (typeof value === 'string' && ['Yes', 'No', 'Pending', 'Completed', 'A', 'B', 'C'].includes(value)) {
    const variant = value === 'Yes' || value === 'Completed' || value === 'A' ? 'default' : 
                   value === 'No' || value === 'Pending' || value === 'C' ? 'destructive' : 
                   'secondary';
    return <Badge variant={variant}>{value}</Badge>;
  }

  return String(value);
};

// Helper function to get icon based on card type
const getCardIcon = (type: string, iconName?: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    harvest: <Activity className="w-5 h-5" />,
    revenue: <DollarSign className="w-5 h-5" />,
    expense: <BarChart3 className="w-5 h-5" />,
    quality: <Users className="w-5 h-5" />,
    batch: <Activity className="w-5 h-5" />,
    production: <BarChart3 className="w-5 h-5" />
  };

  if (iconName && iconMap[iconName]) {
    return iconMap[iconName];
  }

  const lowerType = type.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lowerType.includes(key)) {
      return icon;
    }
  }

  return <Activity className="w-5 h-5" />;
};

// Main dashboard component
interface OptimizedDashboardProps {
  data: any;
}

const OptimizedDashboard: React.FC<OptimizedDashboardProps> = ({ data }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }));
  }, [data]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh - in real app, this would fetch new data
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdated(new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }));
    }, 1000);
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 p-4">
        <div className="mx-auto max-w-7xl">
          <Alert variant="destructive">
            <AlertDescription className="text-center py-8">
              <div className="space-y-4">
                <div className="text-lg font-semibold">No data available</div>
                <div>Please check your data source connection</div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Extract summary cards from data
  const summaryCards = data.summaryCards || [];
  const sheets = Object.keys(data.rawData || {}).filter(name => name !== 'Dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {data.metadata?.title || 'Agricultural Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time operations monitoring • Last updated: {lastUpdated}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-3 py-1">
                {data.metadata?.totalSheets || 0} sheets
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                {data.metadata?.totalRecords || 0} records
              </Badge>
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="transition-all duration-200"
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="animate-spin w-4 h-4 mr-2" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {summaryCards.map((card: any, index: number) => (
            <MetricCard
              key={index}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              trend={card.trend}
              progress={card.progress}
              tooltip={card.tooltip}
              color={card.color || 'blue'}
              icon={getCardIcon(card.type || card.title, card.icon)}
            />
          ))}
        </div>

        <Separator className="my-8" />

        {/* Data Tables */}
        <div className="space-y-8">
          {sheets.map(sheetName => {
            const sheetData = data.rawData[sheetName]?.rows || [];
            if (sheetData.length === 0) return null;

            return (
              <DataTable
                key={sheetName}
                title={sheetName.replace(/_/g, ' ')}
                data={sheetData}
                maxRows={5}
                searchable={true}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default OptimizedDashboard;
