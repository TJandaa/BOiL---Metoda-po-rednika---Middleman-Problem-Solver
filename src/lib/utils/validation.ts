/**
 * Validation utilities for the Middleman Problem
 */

import {
  MiddlemanProblem,
  Supplier,
  Customer,
  TransportationCost,
  ValidationResult
} from '../types/middleman';

/**
 * Validate a complete middleman problem
 */
export function validateMiddlemanProblem(problem: MiddlemanProblem): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate suppliers
  if (!problem.suppliers || problem.suppliers.length === 0) {
    errors.push('At least one supplier is required');
  } else {
    problem.suppliers.forEach((supplier, index) => {
      const supplierResult = validateSupplier(supplier);
      errors.push(...supplierResult.errors.map(e => `Supplier ${index + 1}: ${e}`));
      warnings.push(...supplierResult.warnings.map(w => `Supplier ${index + 1}: ${w}`));
    });
  }

  // Validate customers
  if (!problem.customers || problem.customers.length === 0) {
    errors.push('At least one customer is required');
  } else {
    problem.customers.forEach((customer, index) => {
      const customerResult = validateCustomer(customer);
      errors.push(...customerResult.errors.map(e => `Customer ${index + 1}: ${e}`));
      warnings.push(...customerResult.warnings.map(w => `Customer ${index + 1}: ${w}`));
    });
  }

  // Validate transportation costs
  if (!problem.transportationCosts) {
    errors.push('Transportation costs are required');
  } else {
    const transportResult = validateTransportationCosts(
      problem.transportationCosts,
      problem.suppliers,
      problem.customers
    );
    errors.push(...transportResult.errors);
    warnings.push(...transportResult.warnings);
  }

  // Check for potential profitability issues
  if (problem.suppliers.length > 0 && problem.customers.length > 0) {
    const profitabilityResult = checkProfitability(problem);
    warnings.push(...profitabilityResult.warnings);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate a single supplier
 */
export function validateSupplier(supplier: Supplier): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!supplier.id || supplier.id.trim() === '') {
    errors.push('Supplier ID is required');
  }

  if (!supplier.name || supplier.name.trim() === '') {
    errors.push('Supplier name is required');
  }

  if (supplier.supply <= 0) {
    errors.push('Supply must be greater than 0');
  }

  if (supplier.purchaseCost < 0) {
    errors.push('Purchase cost cannot be negative');
  }

  if (supplier.purchaseCost === 0) {
    warnings.push('Purchase cost is 0 - verify this is intentional');
  }

  if (supplier.supply > 10000) {
    warnings.push('Very high supply value - verify this is correct');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate a single customer
 */
export function validateCustomer(customer: Customer): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!customer.id || customer.id.trim() === '') {
    errors.push('Customer ID is required');
  }

  if (!customer.name || customer.name.trim() === '') {
    errors.push('Customer name is required');
  }

  if (customer.demand <= 0) {
    errors.push('Demand must be greater than 0');
  }

  if (customer.sellingPrice < 0) {
    errors.push('Selling price cannot be negative');
  }

  if (customer.sellingPrice === 0) {
    warnings.push('Selling price is 0 - no revenue will be generated');
  }

  if (customer.demand > 10000) {
    warnings.push('Very high demand value - verify this is correct');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate transportation costs
 */
export function validateTransportationCosts(
  transportationCosts: TransportationCost[][],
  suppliers: Supplier[],
  customers: Customer[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(transportationCosts)) {
    errors.push('Transportation costs must be an array');
    return { isValid: false, errors, warnings };
  }

  // Check if we have costs for all supplier-customer pairs
  const supplierIds = new Set(suppliers.map(s => s.id));
  const customerIds = new Set(customers.map(c => c.id));
  const costPairs = new Set<string>();

  // Flatten the array and validate each cost
  const flatCosts = transportationCosts.flat();
  
  for (const cost of flatCosts) {
    if (!cost || typeof cost !== 'object') {
      errors.push('Invalid transportation cost entry');
      continue;
    }

    if (!cost.supplierId) {
      errors.push('Transportation cost missing supplier ID');
      continue;
    }

    if (!cost.customerId) {
      errors.push('Transportation cost missing customer ID');
      continue;
    }

    if (typeof cost.cost !== 'number') {
      errors.push(`Transportation cost must be a number for ${cost.supplierId} -> ${cost.customerId}`);
      continue;
    }

    if (cost.cost < 0) {
      errors.push(`Transportation cost cannot be negative for ${cost.supplierId} -> ${cost.customerId}`);
    }

    if (!supplierIds.has(cost.supplierId)) {
      errors.push(`Unknown supplier ID: ${cost.supplierId}`);
    }

    if (!customerIds.has(cost.customerId)) {
      errors.push(`Unknown customer ID: ${cost.customerId}`);
    }

    const pairKey = `${cost.supplierId}-${cost.customerId}`;
    if (costPairs.has(pairKey)) {
      warnings.push(`Duplicate transportation cost for ${cost.supplierId} -> ${cost.customerId}`);
    }
    costPairs.add(pairKey);

    if (cost.cost === 0) {
      warnings.push(`Zero transportation cost for ${cost.supplierId} -> ${cost.customerId}`);
    }
  }

  // Check for missing cost pairs
  for (const supplier of suppliers) {
    for (const customer of customers) {
      const pairKey = `${supplier.id}-${customer.id}`;
      if (!costPairs.has(pairKey)) {
        warnings.push(`Missing transportation cost for ${supplier.name} -> ${customer.name}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check for potential profitability issues
 */
function checkProfitability(problem: MiddlemanProblem): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Calculate basic profitability metrics
  const totalSupply = problem.suppliers.reduce((sum, s) => sum + s.supply, 0);
  const totalDemand = problem.customers.reduce((sum, c) => sum + c.demand, 0);
  const avgPurchaseCost = problem.suppliers.reduce((sum, s) => sum + s.purchaseCost, 0) / problem.suppliers.length;
  const avgSellingPrice = problem.customers.reduce((sum, c) => sum + c.sellingPrice, 0) / problem.customers.length;

  if (totalSupply > totalDemand * 2) {
    warnings.push('Supply significantly exceeds demand - consider reducing supply');
  }

  if (totalDemand > totalSupply * 2) {
    warnings.push('Demand significantly exceeds supply - consider increasing supply');
  }

  if (avgPurchaseCost >= avgSellingPrice) {
    warnings.push('Average purchase cost is higher than average selling price - profit may be limited');
  }

  // Check for individual unprofitable routes (basic check)
  const flatCosts = problem.transportationCosts.flat();
  for (const cost of flatCosts) {
    const supplier = problem.suppliers.find(s => s.id === cost.supplierId);
    const customer = problem.customers.find(c => c.id === cost.customerId);
    
    if (supplier && customer) {
      const potentialProfit = customer.sellingPrice - supplier.purchaseCost - cost.cost;
      if (potentialProfit <= 0) {
        warnings.push(
          `Route ${supplier.name} -> ${customer.name} appears unprofitable (profit: ${potentialProfit.toFixed(2)})`
        );
      }
    }
  }

  return {
    isValid: true,
    errors,
    warnings
  };
}