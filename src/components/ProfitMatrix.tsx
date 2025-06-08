'use client';

import { Supplier, Customer } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { formatCurrency, cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface ProfitMatrixProps {
  suppliers: Supplier[];
  customers: Customer[];
  profitMatrix: number[][];
  className?: string;
}

export function ProfitMatrix({ suppliers, customers, profitMatrix, className }: ProfitMatrixProps) {
  // Find max and min profits for highlighting
  const flatProfits = profitMatrix.flat();
  const maxProfit = Math.max(...flatProfits);
  const minProfit = Math.min(...flatProfits);
  const avgProfit = flatProfits.reduce((sum, profit) => sum + profit, 0) / flatProfits.length;

  // Function to get cell color class based on profit value
  const getCellColorClass = (profit: number): string => {
    if (profit === maxProfit && profit > 0) {
      return 'bg-green-100 border-green-300 text-green-800 font-bold'; // Highest profit
    }
    if (profit === minProfit && profit < 0) {
      return 'bg-red-100 border-red-300 text-red-800 font-bold'; // Lowest profit (loss)
    }
    if (profit > avgProfit) {
      return 'bg-green-50 border-green-200 text-green-700'; // Above average profit
    }
    if (profit < 0) {
      return 'bg-red-50 border-red-200 text-red-600'; // Loss
    }
    if (profit < avgProfit) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-700'; // Below average profit
    }
    return 'bg-gray-50 border-gray-200 text-gray-700'; // Average profit
  };

  // Function to get profit icon
  const getProfitIcon = (profit: number) => {
    if (profit > 0) {
      return <TrendingUp className="h-3 w-3 inline ml-1" />;
    }
    if (profit < 0) {
      return <TrendingDown className="h-3 w-3 inline ml-1" />;
    }
    return null;
  };

  // Calculate summary statistics
  const profitStats = {
    total: flatProfits.reduce((sum, profit) => sum + profit, 0),
    positive: flatProfits.filter(profit => profit > 0).length,
    negative: flatProfits.filter(profit => profit < 0).length,
    zero: flatProfits.filter(profit => profit === 0).length
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Profit Matrix (zij)
        </CardTitle>
        <CardDescription>
          Unit profit for each supplier-customer pair: zij = cj - kzi - ktij
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Statistics */}
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{profitStats.positive}</div>
              <div className="text-sm text-gray-500">Profitable Routes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{profitStats.negative}</div>
              <div className="text-sm text-gray-500">Loss Routes</div>
            </div>
            <div className="text-2xl font-bold text-blue-600 text-center">
              <div>{formatCurrency(maxProfit)}</div>
              <div className="text-sm text-gray-500">Max Profit/Unit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(avgProfit)}</div>
              <div className="text-sm text-gray-500">Avg Profit/Unit</div>
            </div>
          </div>
        </div>

        {/* Profit Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-100 p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier \\ Customer
                </th>
                {customers.map((customer) => (
                  <th
                    key={customer.id}
                    className="border border-gray-300 bg-gray-100 p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]"
                  >
                    <div className="font-bold text-gray-800">{customer.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Demand: {customer.demand}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      Price: {formatCurrency(customer.sellingPrice)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier, supplierIndex) => (
                <tr key={supplier.id}>
                  <td className="border border-gray-300 bg-gray-100 p-3 font-medium">
                    <div className="font-bold text-gray-800">{supplier.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Supply: {supplier.supply}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Cost: {formatCurrency(supplier.purchaseCost)}
                    </div>
                  </td>
                  {customers.map((customer, customerIndex) => {
                    const profit = profitMatrix[supplierIndex]?.[customerIndex] || 0;
                    const cellClass = getCellColorClass(profit);
                    const isOptimal = profit === maxProfit && profit > 0;
                    
                    return (
                      <td
                        key={`${supplier.id}-${customer.id}`}
                        className={cn(
                          'border border-gray-300 p-3 text-center relative',
                          cellClass
                        )}
                      >
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            'text-lg font-bold',
                            isOptimal && 'text-xl'
                          )}>
                            {formatCurrency(profit)}
                            {getProfitIcon(profit)}
                          </div>
                          
                          {isOptimal && (
                            <div className="absolute top-1 right-1">
                              <div className="bg-yellow-400 text-yellow-800 text-xs px-1 py-0.5 rounded font-bold">
                                MAX
                              </div>
                            </div>
                          )}
                          
                          {profit < 0 && (
                            <div className="text-xs text-red-500 mt-1">
                              LOSS
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6">
          <div className="text-sm font-medium text-gray-700 mb-3">Color Legend:</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Maximum Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span>Above Average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
              <span>Average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
              <span>Below Average</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span>Loss</span>
            </div>
          </div>
        </div>

        {/* Formula Explanation */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm font-medium text-blue-800 mb-2">Profit Calculation Formula:</div>
          <div className="text-sm text-blue-700">
            <span className="font-mono bg-white px-2 py-1 rounded">
              zij = cj - kzi - ktij
            </span>
          </div>
          <div className="text-xs text-blue-600 mt-2">
            Where: cj = selling price, kzi = purchase cost, ktij = transportation cost
          </div>
        </div>

        {/* Recommendations */}
        {profitStats.negative > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm font-medium text-yellow-800 mb-1">⚠️ Warning:</div>
            <div className="text-sm text-yellow-700">
              {profitStats.negative} route{profitStats.negative > 1 ? 's' : ''} will result in losses. 
              Consider reviewing prices or transportation costs for these routes.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}