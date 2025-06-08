/**
 * Form validation utilities for Middleman Problem components
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate supplier form data
 */
export function validateSupplier(data: {
  name: string;
  supply: string | number;
  purchaseCost: string | number;
}): FormValidationResult {
  const errors: ValidationError[] = [];

  // Validate name
  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'Supplier name is required' });
  } else if (data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Supplier name must be at least 2 characters' });
  }

  // Validate supply
  const supply = typeof data.supply === 'string' ? parseFloat(data.supply) : data.supply;
  if (!data.supply || data.supply === '') {
    errors.push({ field: 'supply', message: 'Supply quantity is required' });
  } else if (isNaN(supply)) {
    errors.push({ field: 'supply', message: 'Supply must be a valid number' });
  } else if (supply <= 0) {
    errors.push({ field: 'supply', message: 'Supply must be greater than 0' });
  } else if (supply > 999999) {
    errors.push({ field: 'supply', message: 'Supply value is too large' });
  }

  // Validate purchase cost
  const purchaseCost = typeof data.purchaseCost === 'string' ? parseFloat(data.purchaseCost) : data.purchaseCost;
  if (!data.purchaseCost && data.purchaseCost !== 0) {
    errors.push({ field: 'purchaseCost', message: 'Purchase cost is required' });
  } else if (isNaN(purchaseCost)) {
    errors.push({ field: 'purchaseCost', message: 'Purchase cost must be a valid number' });
  } else if (purchaseCost < 0) {
    errors.push({ field: 'purchaseCost', message: 'Purchase cost cannot be negative' });
  } else if (purchaseCost > 999999) {
    errors.push({ field: 'purchaseCost', message: 'Purchase cost value is too large' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate customer form data
 */
export function validateCustomer(data: {
  name: string;
  demand: string | number;
  sellingPrice: string | number;
}): FormValidationResult {
  const errors: ValidationError[] = [];

  // Validate name
  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'Customer name is required' });
  } else if (data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Customer name must be at least 2 characters' });
  }

  // Validate demand
  const demand = typeof data.demand === 'string' ? parseFloat(data.demand) : data.demand;
  if (!data.demand || data.demand === '') {
    errors.push({ field: 'demand', message: 'Demand quantity is required' });
  } else if (isNaN(demand)) {
    errors.push({ field: 'demand', message: 'Demand must be a valid number' });
  } else if (demand <= 0) {
    errors.push({ field: 'demand', message: 'Demand must be greater than 0' });
  } else if (demand > 999999) {
    errors.push({ field: 'demand', message: 'Demand value is too large' });
  }

  // Validate selling price
  const sellingPrice = typeof data.sellingPrice === 'string' ? parseFloat(data.sellingPrice) : data.sellingPrice;
  if (!data.sellingPrice && data.sellingPrice !== 0) {
    errors.push({ field: 'sellingPrice', message: 'Selling price is required' });
  } else if (isNaN(sellingPrice)) {
    errors.push({ field: 'sellingPrice', message: 'Selling price must be a valid number' });
  } else if (sellingPrice < 0) {
    errors.push({ field: 'sellingPrice', message: 'Selling price cannot be negative' });
  } else if (sellingPrice > 999999) {
    errors.push({ field: 'sellingPrice', message: 'Selling price value is too large' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate transportation cost
 */
export function validateTransportationCost(cost: string | number): FormValidationResult {
  const errors: ValidationError[] = [];
  
  const costNum = typeof cost === 'string' ? parseFloat(cost) : cost;
  
  if (!cost && cost !== 0) {
    errors.push({ field: 'cost', message: 'Transportation cost is required' });
  } else if (isNaN(costNum)) {
    errors.push({ field: 'cost', message: 'Transportation cost must be a valid number' });
  } else if (costNum < 0) {
    errors.push({ field: 'cost', message: 'Transportation cost cannot be negative' });
  } else if (costNum > 999999) {
    errors.push({ field: 'cost', message: 'Transportation cost value is too large' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get error message for a specific field
 */
export function getFieldError(errors: ValidationError[], fieldName: string): string | undefined {
  return errors.find(error => error.field === fieldName)?.message;
}

/**
 * Check if a field has an error
 */
export function hasFieldError(errors: ValidationError[], fieldName: string): boolean {
  return errors.some(error => error.field === fieldName);
}