'use client';

import { MiddlemanSolution } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { formatCurrency, formatNumber, formatPercentage, calculateProfitMargin } from '@/lib/utils';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Truck, 
  Target, 
  Clock,
  Calculator,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export interface ResultsSummaryProps {
  solution: MiddlemanSolution;
  className?: string;
}

export function ResultsSummary({ solution, className }: ResultsSummaryProps) {
  // Calculate additional metrics
  const profitMargin = calculateProfitMargin(solution.totalRevenue, solution.totalPurchaseCost + solution.totalTransportationCost);
  const transportationRatio = solution.totalTransportationCost / solution.totalRevenue;
  const purchaseRatio = solution.totalPurchaseCost / solution.totalRevenue;
  
  // Determine profit status
  const isProfitable = solution.totalProfit > 0;
  const profitStatus = isProfitable ? 'Profitable' : solution.totalProfit === 0 ? 'Break-even' : 'Loss';

  // Calculate efficiency metrics
  const totalCost = solution.totalPurchaseCost + solution.totalTransportationCost;
  const roi = totalCost > 0 ? (solution.totalProfit / totalCost) * 100 : 0;

  return (
    <div className={className}>
      {/* Main Financial Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            Financial Summary
          </CardTitle>
          <CardDescription>
            Complete breakdown of costs, revenue, and profit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="text-center">
              <div className="bg-blue-50 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(solution.totalRevenue)}
              </div>
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="text-xs text-gray-400 mt-1">100% of income</div>
            </div>

            {/* Total Costs */}
            <div className="text-center">
              <div className="bg-red-50 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalCost)}
              </div>
              <div className="text-sm text-gray-500">Total Costs</div>
              <div className="text-xs text-gray-400 mt-1">
                {formatPercentage(totalCost / solution.totalRevenue)} of revenue
              </div>
            </div>

            {/* Net Profit */}
            <div className="text-center">
              <div className={`rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center ${
                isProfitable ? 'bg-green-50' : 'bg-red-50'
              }`}>
                {isProfitable ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
              <div className={`text-3xl font-bold ${
                isProfitable ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(solution.totalProfit)}
              </div>
              <div className="text-sm text-gray-500">Net Profit</div>
              <div className="text-xs text-gray-400 mt-1">
                {formatPercentage(profitMargin)} margin
              </div>
            </div>

            {/* ROI */}
            <div className="text-center">
              <div className="bg-purple-50 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <div className={`text-2xl font-bold ${
                roi > 0 ? 'text-purple-600' : 'text-red-600'
              }`}>
                {roi.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">ROI</div>
              <div className="text-xs text-gray-400 mt-1">Return on investment</div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="mt-8">
            <h4 className="font-medium text-gray-900 mb-4">Cost Breakdown</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="font-medium">Purchase Costs</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(solution.totalPurchaseCost)}</div>
                  <div className="text-sm text-gray-500">
                    {formatPercentage(purchaseRatio)} of revenue
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="font-medium">Transportation Costs</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(solution.totalTransportationCost)}</div>
                  <div className="text-sm text-gray-500">
                    {formatPercentage(transportationRatio)} of revenue
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Algorithm Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Algorithm Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Solution Status
                </span>
                <span className={`font-medium ${
                  solution.isOptimal ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {solution.isOptimal ? 'Optimal' : 'Sub-optimal'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Execution Time
                </span>
                <span className="font-medium">
                  {solution.executionTime.toFixed(2)}ms
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  Iterations
                </span>
                <span className="font-medium">
                  {solution.iterations}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-gray-500" />
                  Algorithm
                </span>
                <span className="font-medium text-sm">
                  {solution.algorithm}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Problem Characteristics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Problem Characteristics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {solution.isBalanced ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  Problem Type
                </span>
                <span className={`font-medium ${
                  solution.isBalanced ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {solution.isBalanced ? 'Balanced' : 'Unbalanced'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  Feasibility
                </span>
                <span className="font-medium text-green-600">
                  {solution.isFeasible ? 'Feasible' : 'Infeasible'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  Active Routes
                </span>
                <span className="font-medium">
                  {solution.optimalRoutes.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className={`p-4 rounded-lg border-2 ${
            isProfitable 
              ? 'bg-green-50 border-green-200 text-green-800'
              : solution.totalProfit === 0
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              {isProfitable ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <AlertTriangle className="h-6 w-6" />
              )}
              <div>
                <div className="font-bold text-lg">
                  {profitStatus} Operation
                </div>
                <div className="text-sm">
                  {isProfitable 
                    ? `Excellent! This transportation plan generates a profit of ${formatCurrency(solution.totalProfit)} with a ${formatPercentage(profitMargin)} profit margin.`
                    : solution.totalProfit === 0
                    ? 'The operation breaks even with no profit or loss.'
                    : `This plan results in a loss of ${formatCurrency(Math.abs(solution.totalProfit))}. Consider reviewing costs or pricing.`
                  }
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}