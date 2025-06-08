'use client';

import { Supplier, Customer } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Edit, Trash2, Package, Users, AlertTriangle, CheckCircle } from 'lucide-react';

export interface DataSummaryProps {
  suppliers: Supplier[];
  customers: Customer[];
  onEditSupplier?: (supplier: Supplier) => void;
  onDeleteSupplier?: (supplierId: string) => void;
  onEditCustomer?: (customer: Customer) => void;
  onDeleteCustomer?: (customerId: string) => void;
  disabled?: boolean;
}

export function DataSummary({
  suppliers,
  customers,
  onEditSupplier,
  onDeleteSupplier,
  onEditCustomer,
  onDeleteCustomer,
  disabled = false
}: DataSummaryProps) {
  const totalSupply = suppliers.reduce((sum, supplier) => sum + supplier.supply, 0);
  const totalDemand = customers.reduce((sum, customer) => sum + customer.demand, 0);
  const isBalanced = totalSupply === totalDemand;

  const avgPurchaseCost = suppliers.length > 0 
    ? suppliers.reduce((sum, s) => sum + s.purchaseCost, 0) / suppliers.length 
    : 0;
  
  const avgSellingPrice = customers.length > 0
    ? customers.reduce((sum, c) => sum + c.sellingPrice, 0) / customers.length
    : 0;

  const potentialProfit = avgSellingPrice - avgPurchaseCost;

  return (
    <div className="space-y-6">
      {/* Problem Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Problem Overview
          </CardTitle>
          <CardDescription>
            Summary of your transportation problem setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{suppliers.length}</div>
              <div className="text-sm text-gray-500">Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{customers.length}</div>
              <div className="text-sm text-gray-500">Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatNumber(totalSupply)}</div>
              <div className="text-sm text-gray-500">Total Supply</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatNumber(totalDemand)}</div>
              <div className="text-sm text-gray-500">Total Demand</div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              isBalanced 
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
            }`}>
              {isBalanced ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <span className="font-medium">
                {isBalanced 
                  ? 'Problem is balanced (Supply = Demand)'
                  : `Problem is unbalanced (${totalSupply > totalDemand ? 'Excess supply' : 'Excess demand'}: ${formatNumber(Math.abs(totalSupply - totalDemand))} units)`
                }
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Avg Purchase Cost:</span> {formatCurrency(avgPurchaseCost)}
              </div>
              <div>
                <span className="font-medium">Avg Selling Price:</span> {formatCurrency(avgSellingPrice)}
              </div>
              <div className={potentialProfit > 0 ? 'text-green-600' : 'text-red-600'}>
                <span className="font-medium">Potential Profit/Unit:</span> {formatCurrency(potentialProfit)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Suppliers ({suppliers.length})
          </CardTitle>
          <CardDescription>
            Your supply sources and their costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No suppliers added yet. Add your first supplier to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{supplier.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Supply: {formatNumber(supplier.supply)} units • 
                      Purchase Cost: {formatCurrency(supplier.purchaseCost)}/unit
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {onEditSupplier && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditSupplier(supplier)}
                        disabled={disabled}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDeleteSupplier && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteSupplier(supplier.id)}
                        disabled={disabled}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <span className="font-medium">Total Supply:</span> {formatNumber(totalSupply)} units • 
                  <span className="font-medium">Average Cost:</span> {formatCurrency(avgPurchaseCost)}/unit
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customers Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customers ({customers.length})
          </CardTitle>
          <CardDescription>
            Your demand destinations and their prices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No customers added yet. Add your first customer to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Demand: {formatNumber(customer.demand)} units • 
                      Selling Price: {formatCurrency(customer.sellingPrice)}/unit
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {onEditCustomer && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditCustomer(customer)}
                        disabled={disabled}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDeleteCustomer && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteCustomer(customer.id)}
                        disabled={disabled}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-800">
                  <span className="font-medium">Total Demand:</span> {formatNumber(totalDemand)} units • 
                  <span className="font-medium">Average Price:</span> {formatCurrency(avgSellingPrice)}/unit
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Readiness Check */}
      {suppliers.length > 0 && customers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Ready to Solve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Your problem is ready! You have {suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''} and {customers.length} customer{customers.length !== 1 ? 's' : ''}.
              {!isBalanced && ' The algorithm will automatically balance the problem by adding fictitious nodes.'}
            </div>
            {potentialProfit <= 0 && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Warning: Average selling price is not higher than average purchase cost. You may want to review your prices.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}