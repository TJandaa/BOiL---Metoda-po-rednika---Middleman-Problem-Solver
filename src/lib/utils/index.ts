import { type ClassValue, clsx } from 'clsx';
import { Supplier, Customer, MiddlemanProblem } from '../types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Helper functions for Middleman Problem
 */

export function createSampleProblem(): MiddlemanProblem {
  const suppliers: Supplier[] = [
    {
      id: 'supplier-1',
      name: 'Supplier A',
      supply: 100,
      purchaseCost: 10
    },
    {
      id: 'supplier-2',
      name: 'Supplier B',
      supply: 150,
      purchaseCost: 12
    }
  ];

  const customers: Customer[] = [
    {
      id: 'customer-1',
      name: 'Customer X',
      demand: 80,
      sellingPrice: 25
    },
    {
      id: 'customer-2',
      name: 'Customer Y',
      demand: 120,
      sellingPrice: 30
    }
  ];

  const transportationCosts = [
    [
      { supplierId: 'supplier-1', customerId: 'customer-1', cost: 3 },
      { supplierId: 'supplier-1', customerId: 'customer-2', cost: 5 }
    ],
    [
      { supplierId: 'supplier-2', customerId: 'customer-1', cost: 4 },
      { supplierId: 'supplier-2', customerId: 'customer-2', cost: 2 }
    ]
  ];

  return {
    suppliers,
    customers,
    transportationCosts
  };
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function calculateProfitMargin(revenue: number, costs: number): number {
  if (revenue === 0) return 0;
  return (revenue - costs) / revenue;
}