'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { NumberInput } from './Input';
import { Button } from './Button';
import { Supplier, Customer, TransportationCost } from '@/lib/types';
import { validateTransportationCost, ValidationError } from '@/lib/utils/formValidation';
import { cn } from '@/lib/utils';

export interface TransportationCostMatrixProps {
  suppliers: Supplier[];
  customers: Customer[];
  transportationCosts: TransportationCost[][];
  onChange: (costs: TransportationCost[][]) => void;
  disabled?: boolean;
}

interface CostCell {
  supplierId: string;
  customerId: string;
  cost: string;
  error?: string;
}

export function TransportationCostMatrix({
  suppliers,
  customers,
  transportationCosts,
  onChange,
  disabled = false
}: TransportationCostMatrixProps) {
  const [costMatrix, setCostMatrix] = useState<CostCell[][]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize matrix when suppliers or customers change
  useEffect(() => {
    if (suppliers.length === 0 || customers.length === 0) {
      setCostMatrix([]);
      return;
    }

    const newMatrix: CostCell[][] = suppliers.map((supplier, i) => 
      customers.map((customer, j) => {
        // Find existing cost if any
        const existingCost = transportationCosts[i]?.[j]?.cost || 
          transportationCosts.flat().find(
            cost => cost.supplierId === supplier.id && cost.customerId === customer.id
          )?.cost;

        return {
          supplierId: supplier.id,
          customerId: customer.id,
          cost: existingCost?.toString() || '0'
        };
      })
    );

    setCostMatrix(newMatrix);
    setHasChanges(false);
  }, [suppliers, customers, transportationCosts]);

  const validateCell = useCallback((cost: string): string | undefined => {
    const validation = validateTransportationCost(cost);
    return validation.errors[0]?.message;
  }, []);

  const handleCostChange = (supplierIndex: number, customerIndex: number) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newCost = e.target.value;
    
    setCostMatrix(prev => {
      const newMatrix = [...prev];
      if (!newMatrix[supplierIndex]) {
        newMatrix[supplierIndex] = [];
      }
      
      newMatrix[supplierIndex][customerIndex] = {
        ...newMatrix[supplierIndex][customerIndex],
        supplierId: suppliers[supplierIndex]?.id || '',
        customerId: customers[customerIndex]?.id || '',
        cost: newCost,
        error: validateCell(newCost)
      };
      
      return newMatrix;
    });
    
    setHasChanges(true);
  };

  const handleSave = () => {
    // Validate all cells
    const newErrors: ValidationError[] = [];
    const validatedMatrix: CostCell[][] = costMatrix.map((row, i) => 
      row.map((cell, j) => {
        const error = validateCell(cell.cost);
        if (error) {
          newErrors.push({
            field: `${i}-${j}`,
            message: error
          });
        }
        return { ...cell, error };
      })
    );

    setCostMatrix(validatedMatrix);
    setErrors(newErrors);

    if (newErrors.length > 0) {
      return;
    }

    // Convert to TransportationCost format
    const newTransportationCosts: TransportationCost[][] = costMatrix.map(row => 
      row.map(cell => ({
        supplierId: cell.supplierId,
        customerId: cell.customerId,
        cost: parseFloat(cell.cost) || 0
      }))
    );

    onChange(newTransportationCosts);
    setHasChanges(false);
  };

  const handleReset = () => {
    // Reset to original values
    const resetMatrix: CostCell[][] = suppliers.map((supplier, i) => 
      customers.map((customer, j) => {
        const existingCost = transportationCosts[i]?.[j]?.cost || 0;
        return {
          supplierId: supplier.id,
          customerId: customer.id,
          cost: existingCost.toString()
        };
      })
    );

    setCostMatrix(resetMatrix);
    setErrors([]);
    setHasChanges(false);
  };

  const setAllCosts = (value: string) => {
    setCostMatrix(prev => 
      prev.map(row => 
        row.map(cell => ({
          ...cell,
          cost: value,
          error: validateCell(value)
        }))
      )
    );
    setHasChanges(true);
  };

  if (suppliers.length === 0 || customers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transportation Cost Matrix</CardTitle>
          <CardDescription>
            Add suppliers and customers to define transportation costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            {suppliers.length === 0 && customers.length === 0 
              ? 'Add suppliers and customers first'
              : suppliers.length === 0 
              ? 'Add at least one supplier'
              : 'Add at least one customer'
            }
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transportation Cost Matrix</CardTitle>
        <CardDescription>
          Enter the cost per unit to transport from each supplier to each customer (ktij)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-sm text-gray-600">Quick actions:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAllCosts('0')}
              disabled={disabled}
            >
              Set All to 0
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAllCosts('1')}
              disabled={disabled}
            >
              Set All to 1
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAllCosts('5')}
              disabled={disabled}
            >
              Set All to 5
            </Button>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-50 p-2 text-left text-xs font-medium text-gray-500 uppercase">
                    From \ To
                  </th>
                  {customers.map(customer => (
                    <th 
                      key={customer.id}
                      className="border border-gray-300 bg-gray-50 p-2 text-center text-xs font-medium text-gray-500 uppercase min-w-[120px]"
                    >
                      <div className="truncate" title={customer.name}>
                        {customer.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Demand: {customer.demand}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier, supplierIndex) => (
                  <tr key={supplier.id}>
                    <td className="border border-gray-300 bg-gray-50 p-2 text-sm font-medium">
                      <div className="truncate" title={supplier.name}>
                        {supplier.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Supply: {supplier.supply}
                      </div>
                    </td>
                    {customers.map((customer, customerIndex) => {
                      const cell = costMatrix[supplierIndex]?.[customerIndex];
                      return (
                        <td 
                          key={`${supplier.id}-${customer.id}`}
                          className="border border-gray-300 p-2"
                        >
                          <NumberInput
                            value={cell?.cost || '0'}
                            onChange={handleCostChange(supplierIndex, customerIndex)}
                            error={cell?.error}
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            disabled={disabled}
                            className="text-center"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="text-sm text-gray-600">
            Matrix size: {suppliers.length} suppliers × {customers.length} customers = {suppliers.length * customers.length} cost entries
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={disabled || !hasChanges || errors.length > 0}
            >
              Save Transportation Costs
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={disabled || !hasChanges}
            >
              Reset Changes
            </Button>
          </div>

          {/* Error Summary */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-sm font-medium text-red-800">Please fix the following errors:</div>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}