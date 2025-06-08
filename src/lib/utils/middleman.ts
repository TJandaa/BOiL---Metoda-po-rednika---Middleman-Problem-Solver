/**
 * Core Middleman Problem (Transportation Problem with Profit Maximization) Implementation
 * 
 * This module implements the operations research methodology for solving the Middleman Problem:
 * 1. Calculate profit matrix: zij = cj - kzi - ktij
 * 2. Balance the problem if supply ≠ demand
 * 3. Find initial solution using Maximum Element Method
 * 4. Check optimality using dual variables
 * 5. Improve solution if not optimal
 */

import {
  Supplier,
  Customer,
  MiddlemanProblem,
  MiddlemanSolution,
  TransportationCell,
  BalancedProblem,
  DualVariables,
  ImprovementOpportunity,
  ValidationResult
} from '../types/middleman';

/**
 * Validate and normalize transportation costs matrix to ensure proper 2D array structure
 */
function validateTransportationCosts(
  costs: any, 
  supplierCount: number, 
  customerCount: number
): number[][] {
  // Initialize proper 2D array with correct dimensions (default to zeros)
  const validatedCosts: number[][] = Array(supplierCount).fill(null).map(() => Array(customerCount).fill(0));

  // Handle null/undefined input
  if (!costs) {
    return validatedCosts;
  }

  // Handle different input formats
  if (Array.isArray(costs)) {
    // Case 1: Already a 2D number array
    if (costs.length > 0 && Array.isArray(costs[0]) && typeof costs[0][0] === 'number') {
      for (let i = 0; i < supplierCount && i < costs.length; i++) {
        for (let j = 0; j < customerCount && j < costs[i]?.length; j++) {
          validatedCosts[i][j] = costs[i][j] || 0;
        }
      }
      return validatedCosts;
    }
    
    // Case 2: 2D array of TransportationCost objects (UI format)
    if (costs.length > 0 && Array.isArray(costs[0]) && costs[0].length > 0) {
      for (let i = 0; i < supplierCount && i < costs.length; i++) {
        for (let j = 0; j < customerCount && j < costs[i]?.length; j++) {
          const costObj = costs[i][j];
          if (costObj && typeof costObj === 'object' && 'cost' in costObj) {
            const costValue = typeof costObj.cost === 'number' ? costObj.cost : 
                             typeof costObj.cost === 'string' ? parseFloat(costObj.cost) || 0 : 0;
            validatedCosts[i][j] = costValue;
          }
        }
      }
      return validatedCosts;
    }
  }

  // Return zero matrix if format is not recognized
  return validatedCosts;
}

/**
 * Main function to solve the middleman optimization problem
 * Uses the Maximum Element Method for initial solution and iterative improvement
 */
export function solveMiddlemanProblem(problem: MiddlemanProblem): MiddlemanSolution {
  const startTime = performance.now();
  
  // Debug: Log input data structure
  console.log('🔧 SOLVER: Starting middleman optimization');
  console.log(`  - Problem size: ${problem.suppliers.length} suppliers × ${problem.customers.length} customers`);
  

  // Step 1: Validate the problem
  const validation = validateProblem(problem);
  if (!validation.isValid) {
    throw new Error(`Invalid problem: ${validation.errors.join(', ')}`);
  }

  // Validate input dimensions
  if (!problem.suppliers.length || !problem.customers.length) {
    throw new Error('Invalid problem: no suppliers or customers');
  }

  // Step 2: Balance the problem (add fictitious suppliers/customers if needed)
  const balancedProblem = balanceProblem(problem.suppliers, problem.customers);
  
  // Step 3: Create and validate transportation cost matrix for balanced problem
  const transportationCosts = validateTransportationCosts(
    problem.transportationCosts,
    balancedProblem.suppliers.length,
    balancedProblem.customers.length
  );

  // Debug: Log validated transportation costs
  const nonZeroCosts = transportationCosts.flat().filter(cost => cost > 0).length;
  console.log(`🔧 SOLVER: Transportation costs processed (${nonZeroCosts} non-zero costs)`);


  // Step 4: Calculate profit matrix: zij = cj - kzi - ktij
  const profitMatrix = calculateProfitMatrix(
    balancedProblem.suppliers,
    balancedProblem.customers,
    transportationCosts
  );

  // Step 5: Find initial solution using Maximum Element Method
  let transportationPlan = findOptimalTransportation(
    profitMatrix,
    balancedProblem.suppliers,
    balancedProblem.customers
  );

  // Step 6: Check if initial solution is already optimal
  let iterations = 0;
  let isOptimal = false;
  const maxIterations = 20; // Reasonable limit for convergence

  console.log('🔧 OPTIMIZER: Checking initial solution optimality');

  // Check if the initial solution from Maximum Element Method is already optimal
  const initialOptimalityCheck = checkOptimality(
    profitMatrix,
    transportationPlan,
    balancedProblem.suppliers,
    balancedProblem.customers
  );

  if (initialOptimalityCheck.isOptimal) {
    isOptimal = true;
    console.log('🔧 OPTIMIZER: Initial solution is already optimal - no iterations needed');
  } else {
    console.log(`🔧 OPTIMIZER: Initial solution has ${initialOptimalityCheck.improvements.length} possible improvements`);
    console.log('🔧 OPTIMIZER: Starting optimization iterations');

    // Iterative improvement loop (only if initial solution is not optimal)
    while (!isOptimal && iterations < maxIterations) {
      const optimalityCheck = checkOptimality(
        profitMatrix,
        transportationPlan,
        balancedProblem.suppliers,
        balancedProblem.customers
      );
      
      console.log(`🔧 OPTIMIZER: Iteration ${iterations + 1}`);
      console.log(`  - Is optimal: ${optimalityCheck.isOptimal}`);
      console.log(`  - Improvements found: ${optimalityCheck.improvements.length}`);
      
      isOptimal = optimalityCheck.isOptimal;
      
      if (!isOptimal && optimalityCheck.improvements.length > 0) {
        const bestImprovement = optimalityCheck.improvements[0];
        console.log(`  - Best improvement: [${bestImprovement.supplierIndex}][${bestImprovement.customerIndex}] = ${bestImprovement.improvement.toFixed(3)}`);
        
        // Improve the solution using the best improvement opportunity
        const newPlan = improveSolution(
          transportationPlan,
          bestImprovement,
          balancedProblem.suppliers,
          balancedProblem.customers
        );
        
        // Check if the improvement actually changed the solution
        const planChanged = !arraysEqual(transportationPlan, newPlan);
        if (!planChanged) {
          console.log('🔧 OPTIMIZER: No plan change detected, terminating');
          break;
        }
        
        transportationPlan = newPlan;
      } else if (!isOptimal) {
        console.log('🔧 OPTIMIZER: No improvements found but not optimal, terminating');
        break;
      }
      
      iterations++;
    }
  }

  console.log(`🔧 OPTIMIZER: Completed after ${iterations} iterations`);

  // Step 7: Calculate final results with corrected logic
  const results = calculateResults(
    transportationPlan,
    balancedProblem.suppliers,
    balancedProblem.customers,
    transportationCosts
  );

  // Debug: Log calculation results
  console.log('🔧 SOLVER: Final financial results');
  console.log('  - Total Transportation Cost: $' + results.totalTransportationCost.toFixed(2));
  console.log('  - Total Purchase Cost: $' + results.totalPurchaseCost.toFixed(2)); 
  console.log('  - Total Revenue: $' + results.totalRevenue.toFixed(2));
  console.log('  - Total Profit: $' + results.totalProfit.toFixed(2));

  // Step 8: Create optimal routes list
  const optimalRoutes = createOptimalRoutes(
    transportationPlan,
    balancedProblem.suppliers,
    balancedProblem.customers,
    transportationCosts,
    profitMatrix
  );

  const executionTime = performance.now() - startTime;

  console.log(`🔧 SOLVER: Final solution status`);
  console.log(`  - Optimal: ${isOptimal}`);
  console.log(`  - Iterations: ${iterations}`);

  return {
    profitMatrix,
    transportationPlan,
    isBalanced: balancedProblem.isBalanced,
    isFeasible: true,
    isOptimal: isOptimal,
    totalPurchaseCost: results.totalPurchaseCost,
    totalTransportationCost: results.totalTransportationCost,
    totalRevenue: results.totalRevenue,
    totalProfit: results.totalProfit,
    optimalRoutes,
    algorithm: 'Maximum Element Method with Dual Variable Optimality Check',
    executionTime,
    iterations
  };
}

/**
 * Calculate profit matrix using formula: zij = cj - kzi - ktij
 * Where:
 * - cj = selling price to customer j
 * - kzi = purchase cost from supplier i
 * - ktij = transportation cost from supplier i to customer j
 */
export function calculateProfitMatrix(
  suppliers: Supplier[],
  customers: Customer[],
  transportationCosts: number[][]
): number[][] {
  const profitMatrix: number[][] = [];
  
  for (let i = 0; i < suppliers.length; i++) {
    profitMatrix[i] = [];
    for (let j = 0; j < customers.length; j++) {
      // Profit per unit = Selling Price - Purchase Cost - Transportation Cost
      const sellingPrice = customers[j]?.sellingPrice || 0;
      const purchaseCost = suppliers[i]?.purchaseCost || 0;
      const transportationCost = transportationCosts[i]?.[j] || 0;
      
      profitMatrix[i]![j] = sellingPrice - purchaseCost - transportationCost;
    }
  }
  
  return profitMatrix;
}

/**
 * Balance problem by adding fictitious suppliers/customers if supply ≠ demand
 * This ensures the transportation problem has a feasible solution
 */
export function balanceProblem(
  suppliers: Supplier[],
  customers: Customer[]
): BalancedProblem {
  const totalSupply = suppliers.reduce((sum, supplier) => sum + supplier.supply, 0);
  const totalDemand = customers.reduce((sum, customer) => sum + customer.demand, 0);
  
  const balancedSuppliers = [...suppliers];
  const balancedCustomers = [...customers];
  
  let fictitiousSupplier: Supplier | undefined;
  let fictitiousCustomer: Customer | undefined;
  
  if (totalSupply > totalDemand) {
    // Add fictitious customer with demand = excess supply
    const excessSupply = totalSupply - totalDemand;
    fictitiousCustomer = {
      id: 'fictitious-customer',
      name: 'Fictitious Customer',
      demand: excessSupply,
      sellingPrice: 0 // Zero selling price for fictitious customer
    };
    balancedCustomers.push(fictitiousCustomer);
  } else if (totalDemand > totalSupply) {
    // Add fictitious supplier with supply = excess demand
    const excessDemand = totalDemand - totalSupply;
    fictitiousSupplier = {
      id: 'fictitious-supplier',
      name: 'Fictitious Supplier',
      supply: excessDemand,
      purchaseCost: 0 // Zero purchase cost for fictitious supplier
    };
    balancedSuppliers.push(fictitiousSupplier);
  }
  
  return {
    suppliers: balancedSuppliers,
    customers: balancedCustomers,
    isBalanced: totalSupply === totalDemand,
    fictitiousSupplier,
    fictitiousCustomer,
    originalSupplyTotal: totalSupply,
    originalDemandTotal: totalDemand
  };
}

/**
 * Find optimal solution using Maximum Element Method
 * Start with the highest profit cell and allocate maximum possible quantity
 */
export function findOptimalTransportation(
  profitMatrix: number[][],
  suppliers: Supplier[],
  customers: Customer[]
): number[][] {
  const m = suppliers.length;
  const n = customers.length;
  
  // Initialize transportation plan matrix
  const transportationPlan: number[][] = Array(m).fill(0).map(() => Array(n).fill(0));
  
  // Create working copies of supply and demand
  const remainingSupply = suppliers.map(s => s.supply);
  const remainingDemand = customers.map(c => c.demand);
  
  let allocationStep = 0;
  console.log(`🔧 INITIAL: Starting Maximum Element Method`);
  
  // Continue until all supply and demand is satisfied
  while (remainingSupply.some(s => s > 0) && remainingDemand.some(d => d > 0)) {
    // Find the cell with maximum profit among remaining cells
    let maxProfit = -Infinity;
    let maxI = -1;
    let maxJ = -1;
    
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (remainingSupply[i] > 0 && remainingDemand[j] > 0) {
          if (profitMatrix[i][j] > maxProfit) {
            maxProfit = profitMatrix[i][j];
            maxI = i;
            maxJ = j;
          }
        }
      }
    }
    
    if (maxI === -1 || maxJ === -1) {
      console.log(`🔧 INITIAL: No more valid cells found, terminating`);
      break; // No more valid cells
    }
    
    // Allocate maximum possible quantity to this cell
    const allocation = Math.min(remainingSupply[maxI], remainingDemand[maxJ]);
    transportationPlan[maxI][maxJ] = allocation;
    
    allocationStep++;
    
    // Update remaining supply and demand
    remainingSupply[maxI] -= allocation;
    remainingDemand[maxJ] -= allocation;
  }
  
  console.log(`🔧 INITIAL: Completed ${allocationStep} allocation steps`);
  
  return transportationPlan;
}

/**
 * Check if solution is optimal using dual variables (αi, βj)
 * Calculate opportunity costs for non-basic variables
 */
export function checkOptimality(
  profitMatrix: number[][],
  transportationPlan: number[][],
  suppliers: Supplier[],
  customers: Customer[]
): { isOptimal: boolean; improvements: ImprovementOpportunity[] } {
  const m = suppliers.length;
  const n = customers.length;
  const epsilon = 0.001; // Numerical tolerance for floating point comparisons
  
  // Calculate dual variables using the method of Lagrange multipliers
  const dualVariables = calculateDualVariables(profitMatrix, transportationPlan, m, n);
  
  // Check opportunity costs for non-basic variables
  const improvements: ImprovementOpportunity[] = [];
  
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (transportationPlan[i][j] <= epsilon) { // Non-basic variable (use epsilon for numerical stability)
        // Calculate opportunity cost: Δij = zij - αi - βj
        const opportunityCost = profitMatrix[i][j] - dualVariables.alpha[i] - dualVariables.beta[j];
        
        if (opportunityCost > epsilon) { // Use epsilon for floating point comparison
          improvements.push({
            supplierIndex: i,
            customerIndex: j,
            improvement: opportunityCost,
            currentProfit: 0,
            potentialProfit: profitMatrix[i][j]
          });
        }
      }
    }
  }
  
  // Sort improvements by magnitude (highest first)
  improvements.sort((a, b) => b.improvement - a.improvement);
  
  // Solution is optimal if no positive opportunities exist
  const isOptimal = improvements.length === 0;
  
  return {
    isOptimal,
    improvements
  };
}

/**
 * Calculate final costs, revenues and profit from the transportation plan
 * POPRAWKA: Teraz rozróżnia fikcyjnych dostawców/odbiorców
 */
export function calculateResults(
  transportationPlan: number[][],
  suppliers: Supplier[],
  customers: Customer[],
  transportationCosts: number[][]
): {
  totalPurchaseCost: number;
  totalTransportationCost: number;
  totalRevenue: number;
  totalProfit: number;
} {

  // Validate transportation costs matrix has correct dimensions
  const validatedCosts = validateTransportationCosts(
    transportationCosts, 
    suppliers.length, 
    customers.length
  );

  let totalPurchaseCost = 0;
  let totalTransportationCost = 0;
  let totalRevenue = 0;
  
  for (let i = 0; i < suppliers.length; i++) {
    for (let j = 0; j < customers.length; j++) {
      const quantity = transportationPlan[i]?.[j] || 0;
      if (quantity > 0) {
        const supplier = suppliers[i];
        const customer = customers[j];
        const purchaseCost = supplier?.purchaseCost || 0;
        const transportCost = validatedCosts[i]?.[j] || 0;
        const sellingPrice = customer?.sellingPrice || 0;

        // POPRAWKA: Sprawdź czy to fikcyjne jednostki
        const isFictitiousCustomer = customer?.id === 'fictitious-customer';
        const isFictitiousSupplier = supplier?.id === 'fictitious-supplier';
        
        // Koszt zakupu tylko za rzeczywiste transakcje (nie fikcyjne)
        if (!isFictitiousCustomer && !isFictitiousSupplier) {
          totalPurchaseCost += quantity * purchaseCost;
        }
        
        // Koszt transportu tylko za rzeczywiste transakcje
        if (!isFictitiousCustomer && !isFictitiousSupplier) {
          totalTransportationCost += quantity * transportCost;
        }
        
        // Przychód tylko od rzeczywistych odbiorców
        if (!isFictitiousCustomer) {
          totalRevenue += quantity * sellingPrice;
        }
      }
    }
  }
  
  const totalProfit = totalRevenue - totalPurchaseCost - totalTransportationCost;
  

  return {
    totalPurchaseCost,
    totalTransportationCost,
    totalRevenue,
    totalProfit
  };
}

/**
 * Calculate dual variables for optimality testing
 * Uses iterative method to solve the system of equations: zij = αi + βj
 */
function calculateDualVariables(
  profitMatrix: number[][],
  transportationPlan: number[][],
  m: number,
  n: number
): DualVariables {
  const alpha: number[] = Array(m).fill(null);
  const beta: number[] = Array(n).fill(null);
  
  // Find basic variables (non-zero allocations)
  const basicVariables: Array<{i: number; j: number}> = [];
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (transportationPlan[i][j] > 0) {
        basicVariables.push({i, j});
      }
    }
  }
  
  // Set the first available α to 0 (find a supplier with basic variables)
  let alphaSet = false;
  for (let i = 0; i < m && !alphaSet; i++) {
    if (basicVariables.some(bv => bv.i === i)) {
      alpha[i] = 0;
      alphaSet = true;
    }
  }
  
  if (!alphaSet) {
    return { alpha: Array(m).fill(0), beta: Array(n).fill(0) };
  }
  
  // Iteratively solve the system of equations
  const maxIterations = 50;
  let iteration = 0;
  let changed = true;
  
  while (changed && iteration < maxIterations) {
    changed = false;
    
    for (const {i, j} of basicVariables) {
      if (alpha[i] !== null && beta[j] === null) {
        // Calculate βj = zij - αi
        beta[j] = profitMatrix[i][j] - alpha[i];
        changed = true;
      } else if (alpha[i] === null && beta[j] !== null) {
        // Calculate αi = zij - βj
        alpha[i] = profitMatrix[i][j] - beta[j];
        changed = true;
      }
    }
    
    iteration++;
  }
  
  // Fill any remaining null values with 0
  for (let i = 0; i < m; i++) {
    if (alpha[i] === null) alpha[i] = 0;
  }
  for (let j = 0; j < n; j++) {
    if (beta[j] === null) beta[j] = 0;
  }
  
  
  return { alpha, beta };
}

/**
 * Helper function to compare two 2D arrays for equality
 */
function arraysEqual(a: number[][], b: number[][]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) {
      if (Math.abs(a[i][j] - b[i][j]) > 0.001) return false;
    }
  }
  return true;
}

/**
 * Improve the solution by implementing the best improvement opportunity
 * Uses a simplified stepping stone method
 */
function improveSolution(
  transportationPlan: number[][],
  improvement: ImprovementOpportunity,
  suppliers: Supplier[],
  customers: Customer[]
): number[][] {
  const newPlan = transportationPlan.map(row => [...row]);
  const {supplierIndex: i, customerIndex: j} = improvement;
  
  // Calculate remaining capacity for this supplier-customer pair
  const currentSupplyUsed = newPlan[i].reduce((sum, val) => sum + val, 0);
  const currentDemandMet = newPlan.reduce((sum, row) => sum + row[j], 0);
  
  const availableSupply = suppliers[i].supply - currentSupplyUsed;
  const unmetDemand = customers[j].demand - currentDemandMet;
  
  // Determine how much we can allocate to this new route
  const maxNewAllocation = Math.min(availableSupply, unmetDemand);
  
  if (maxNewAllocation > 0) {
    // Direct allocation if we have available supply and unmet demand
    newPlan[i][j] += maxNewAllocation;
  } else {
    // Need to reallocate from existing routes (simplified stepping stone)
    let reallocated = false;
    
    // Try to reallocate from the same supplier to other customers
    for (let k = 0; k < customers.length; k++) {
      if (k !== j && newPlan[i][k] > 0) {
        // Check if we can reduce allocation to customer k and increase to customer j
        const canReduce = Math.min(newPlan[i][k], unmetDemand, 1); // Start with small reallocation
        if (canReduce > 0) {
          newPlan[i][k] -= canReduce;
          newPlan[i][j] += canReduce;
          reallocated = true;
          break;
        }
      }
    }
    
    // If that didn't work, try to reallocate from other suppliers to this customer
    if (!reallocated) {
      for (let k = 0; k < suppliers.length; k++) {
        if (k !== i && newPlan[k][j] > 0) {
          const canReduce = Math.min(newPlan[k][j], availableSupply, 1); // Start with small reallocation
          if (canReduce > 0) {
            newPlan[k][j] -= canReduce;
            newPlan[i][j] += canReduce;
            reallocated = true;
            break;
          }
        }
      }
    }
    
  }
  
  return newPlan;
}

/**
 * Create list of optimal routes with positive flow
 * POPRAWKA: Teraz pomija fikcyjne trasy w wynikach
 */
function createOptimalRoutes(
  transportationPlan: number[][],
  suppliers: Supplier[],
  customers: Customer[],
  transportationCosts: number[][],
  profitMatrix: number[][]
): TransportationCell[] {
  const routes: TransportationCell[] = [];
  
  // Validate transportation costs matrix
  const validatedCosts = validateTransportationCosts(
    transportationCosts,
    suppliers.length,
    customers.length
  );
  
  for (let i = 0; i < suppliers.length; i++) {
    for (let j = 0; j < customers.length; j++) {
      const quantity = transportationPlan[i]?.[j] || 0;
      if (quantity > 0) {
        const supplier = suppliers[i];
        const customer = customers[j];
        
        // POPRAWKA: Pomijaj fikcyjne trasy w wynikach
        const isFictitiousCustomer = customer?.id === 'fictitious-customer';
        const isFictitiousSupplier = supplier?.id === 'fictitious-supplier';
        
        // Dodaj tylko rzeczywiste trasy do wyników
        if (!isFictitiousCustomer && !isFictitiousSupplier) {
          routes.push({
            supplierId: supplier.id,
            customerId: customer.id,
            quantity,
            unitProfit: profitMatrix[i]?.[j] || 0,
            purchaseCost: supplier.purchaseCost,
            transportationCost: validatedCosts[i]?.[j] || 0,
            sellingPrice: customer.sellingPrice
          });
        }
      }
    }
  }
  
  return routes;
}

/**
 * Validate the middleman problem for consistency and feasibility
 */
function validateProblem(problem: MiddlemanProblem): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check suppliers
  if (!problem.suppliers || problem.suppliers.length === 0) {
    errors.push('Problem must have at least one supplier');
  } else {
    for (const supplier of problem.suppliers) {
      if (supplier.supply <= 0) {
        errors.push(`Supplier ${supplier.name} must have positive supply`);
      }
      if (supplier.purchaseCost < 0) {
        errors.push(`Supplier ${supplier.name} cannot have negative purchase cost`);
      }
    }
  }
  
  // Check customers
  if (!problem.customers || problem.customers.length === 0) {
    errors.push('Problem must have at least one customer');
  } else {
    for (const customer of problem.customers) {
      if (customer.demand <= 0) {
        errors.push(`Customer ${customer.name} must have positive demand`);
      }
      if (customer.sellingPrice < 0) {
        errors.push(`Customer ${customer.name} cannot have negative selling price`);
      }
    }
  }
  
  // Check transportation costs (basic check)
  if (!problem.transportationCosts) {
    warnings.push('No transportation costs specified, will use zeros');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}