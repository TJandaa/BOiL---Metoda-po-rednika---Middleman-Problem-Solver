'use client';

import { Supplier, Customer, TransportationCell } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import { Truck, DollarSign, Package, Users, Route } from 'lucide-react';

export interface OptimalTransportationTableProps {
  suppliers: Supplier[];
  customers: Customer[];
  transportationPlan: number[][];
  optimalRoutes: TransportationCell[];
  profitMatrix?: number[][];
  className?: string;
}

export function OptimalTransportationTable({
  suppliers,
  customers,
  transportationPlan: _transportationPlan,
  optimalRoutes,
  profitMatrix: _profitMatrix,
  className
}: OptimalTransportationTableProps) {
  // Calculate totals
  const totalQuantity = optimalRoutes.reduce((sum, route) => sum + route.quantity, 0);
  const totalProfit = optimalRoutes.reduce((sum, route) => sum + (route.quantity * route.unitProfit), 0);
  const totalRevenue = optimalRoutes.reduce((sum, route) => sum + (route.quantity * route.sellingPrice), 0);
  const totalPurchaseCost = optimalRoutes.reduce((sum, route) => sum + (route.quantity * route.purchaseCost), 0);
  const totalTransportationCost = optimalRoutes.reduce((sum, route) => sum + (route.quantity * route.transportationCost), 0);

  // Find the highest profit route
  const maxProfitRoute = optimalRoutes.reduce((max, route) => 
    (route.quantity * route.unitProfit) > ((max?.quantity || 0) * (max?.unitProfit || 0)) ? route : max
  , optimalRoutes[0]);

  // Get supplier and customer names
  const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || id;
  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || id;

  // Sort routes by total profit (descending)
  const sortedRoutes = [...optimalRoutes].sort((a, b) => 
    (b.quantity * b.unitProfit) - (a.quantity * a.unitProfit)
  );

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Optimal Transportation Plan
        </CardTitle>
        <CardDescription>
          Quantities to transport on each route for maximum profit
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{optimalRoutes.length}</div>
            <div className="text-sm text-gray-500">Active Routes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formatNumber(totalQuantity)}</div>
            <div className="text-sm text-gray-500">Total Units</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</div>
            <div className="text-sm text-gray-500">Total Profit</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalProfit / totalQuantity)}
            </div>
            <div className="text-sm text-gray-500">Avg Profit/Unit</div>
          </div>
        </div>

        {/* Routes Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Package className="h-4 w-4 inline mr-1" />
                  Quantity
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Unit Profit
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Total Profit
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Truck className="h-4 w-4 inline mr-1" />
                  Transport Cost
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRoutes.map((route, index) => {
                const supplierName = getSupplierName(route.supplierId);
                const customerName = getCustomerName(route.customerId);
                const totalRouteProfit = route.quantity * route.unitProfit;
                const totalRouteCost = route.quantity * route.transportationCost;
                const totalRouteRevenue = route.quantity * route.sellingPrice;
                const isTopRoute = route === maxProfitRoute;

                return (
                  <tr 
                    key={`${route.supplierId}-${route.customerId}`}
                    className={cn(
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                      isTopRoute && 'bg-green-50 border-green-200',
                      'hover:bg-blue-50'
                    )}
                  >
                    <td className="border border-gray-300 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium text-gray-900">
                            {supplierName} → {customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Route {index + 1}
                            {isTopRoute && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                🏆 Top Profit
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatNumber(route.quantity)}
                      </div>
                      <div className="text-xs text-gray-500">units</div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      <div className={cn(
                        'text-lg font-semibold',
                        route.unitProfit > 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {formatCurrency(route.unitProfit)}
                      </div>
                      <div className="text-xs text-gray-500">per unit</div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      <div className={cn(
                        'text-lg font-bold',
                        totalRouteProfit > 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {formatCurrency(totalRouteProfit)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((totalRouteProfit / totalProfit) * 100).toFixed(1)}% of total
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      <div className="text-sm font-medium text-orange-600">
                        {formatCurrency(totalRouteCost)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(route.transportationCost)}/unit
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      <div className="text-sm font-medium text-blue-600">
                        {formatCurrency(totalRouteRevenue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(route.sellingPrice)}/unit
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 px-4 py-3 text-right">
                  <strong>TOTALS:</strong>
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {formatNumber(totalQuantity)}
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  <div className="text-sm text-gray-600">
                    {formatCurrency(totalProfit / totalQuantity)}
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(totalProfit)}
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {formatCurrency(totalTransportationCost)}
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(totalRevenue)}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Supply and Demand Utilization */}
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          {/* Supplier Utilization */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Supplier Utilization
            </h4>
            <div className="space-y-2">
              {suppliers.map(supplier => {
                const supplierRoutes = optimalRoutes.filter(route => route.supplierId === supplier.id);
                const utilized = supplierRoutes.reduce((sum, route) => sum + route.quantity, 0);
                const utilizationRate = (utilized / supplier.supply) * 100;
                
                return (
                  <div key={supplier.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{supplier.name}</span>
                    <div className="flex items-center gap-2">
                      <span>{formatNumber(utilized)}/{formatNumber(supplier.supply)}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn(
                            'h-2 rounded-full',
                            utilizationRate === 100 ? 'bg-green-500' : 
                            utilizationRate > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                          )}
                          style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-12">
                        {utilizationRate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Satisfaction */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customer Demand Satisfaction
            </h4>
            <div className="space-y-2">
              {customers.map(customer => {
                const customerRoutes = optimalRoutes.filter(route => route.customerId === customer.id);
                const satisfied = customerRoutes.reduce((sum, route) => sum + route.quantity, 0);
                const satisfactionRate = (satisfied / customer.demand) * 100;
                
                return (
                  <div key={customer.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{customer.name}</span>
                    <div className="flex items-center gap-2">
                      <span>{formatNumber(satisfied)}/{formatNumber(customer.demand)}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn(
                            'h-2 rounded-full',
                            satisfactionRate === 100 ? 'bg-green-500' : 
                            satisfactionRate > 80 ? 'bg-yellow-500' : 'bg-red-500'
                          )}
                          style={{ width: `${Math.min(satisfactionRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-12">
                        {satisfactionRate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">📈 Key Insights</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {maxProfitRoute && (
              <li>• Most profitable route: {getSupplierName(maxProfitRoute.supplierId)} → {getCustomerName(maxProfitRoute.customerId)} ({formatCurrency(maxProfitRoute.quantity * maxProfitRoute.unitProfit)} total profit)</li>
            )}
            <li>• Average profit per unit across all routes: {formatCurrency(totalProfit / totalQuantity)}</li>
            <li>• Transportation costs represent {((totalTransportationCost / totalRevenue) * 100).toFixed(1)}% of total revenue</li>
            {optimalRoutes.length < (suppliers.length * customers.length) && (
              <li>• {(suppliers.length * customers.length) - optimalRoutes.length} potential route{(suppliers.length * customers.length) - optimalRoutes.length > 1 ? 's' : ''} not used (likely unprofitable)</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}