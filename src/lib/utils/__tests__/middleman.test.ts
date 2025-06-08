/**
 * Basic tests for the Middleman Problem implementation
 * Note: These are basic validation tests. In a production environment,
 * you would use a proper testing framework like Jest or Vitest.
 */

import { solveMiddlemanProblem, calculateProfitMatrix, balanceProblem } from '../middleman';
import { smallExample } from '../examples';

/**
 * Test the profit matrix calculation
 */
export function testProfitMatrix() {
  const { suppliers, customers, transportationCosts } = smallExample;
  
  // Create a simple 2D transportation cost matrix
  const costMatrix = [
    [2, 4], // S1 to C1, S1 to C2
    [3, 1]  // S2 to C1, S2 to C2
  ];
  
  const profitMatrix = calculateProfitMatrix(suppliers, customers, costMatrix);
  
  // Expected calculations:
  // S1 -> C1: 20 - 8 - 2 = 10
  // S1 -> C2: 25 - 8 - 4 = 13
  // S2 -> C1: 20 - 10 - 3 = 7
  // S2 -> C2: 25 - 10 - 1 = 14
  
  const expected = [
    [10, 13],
    [7, 14]
  ];
  
  console.log('Profit Matrix Test:');
  console.log('Expected:', expected);
  console.log('Actual:', profitMatrix);
  console.log('Test passed:', JSON.stringify(profitMatrix) === JSON.stringify(expected));
  
  return profitMatrix;
}

/**
 * Test problem balancing
 */
export function testBalancing() {
  const { suppliers, customers } = smallExample;
  
  const totalSupply = suppliers.reduce((sum, s) => sum + s.supply, 0); // 50 + 70 = 120
  const totalDemand = customers.reduce((sum, c) => sum + c.demand, 0); // 40 + 60 = 100
  
  console.log('\\nBalancing Test:');
  console.log('Total Supply:', totalSupply);
  console.log('Total Demand:', totalDemand);
  
  const balanced = balanceProblem(suppliers, customers);
  
  console.log('Is Balanced:', balanced.isBalanced);
  console.log('Balanced Suppliers:', balanced.suppliers.length);
  console.log('Balanced Customers:', balanced.customers.length);
  
  if (balanced.fictitiousCustomer) {
    console.log('Fictitious Customer Demand:', balanced.fictitiousCustomer.demand);
  }
  
  return balanced;
}

/**
 * Test complete solution
 */
export function testCompleteSolution() {
  console.log('\\nComplete Solution Test:');
  
  try {
    const solution = solveMiddlemanProblem(smallExample);
    
    console.log('Solution found successfully!');
    console.log('Total Profit:', solution.totalProfit);
    console.log('Total Revenue:', solution.totalRevenue);
    console.log('Total Purchase Cost:', solution.totalPurchaseCost);
    console.log('Total Transportation Cost:', solution.totalTransportationCost);
    console.log('Is Optimal:', solution.isOptimal);
    console.log('Algorithm:', solution.algorithm);
    console.log('Execution Time:', solution.executionTime.toFixed(2), 'ms');
    console.log('Iterations:', solution.iterations);
    
    console.log('\\nOptimal Routes:');
    solution.optimalRoutes.forEach(route => {
      console.log(`${route.supplierId} -> ${route.customerId}: ${route.quantity} units, profit/unit: ${route.unitProfit}`);
    });
    
    return solution;
  } catch (error) {
    console.error('Error solving problem:', error);
    return null;
  }
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.log('=== Middleman Problem Implementation Tests ===');
  
  testProfitMatrix();
  testBalancing();
  testCompleteSolution();
  
  console.log('\\n=== Tests Complete ===');
}

// Export for use in other files
export { testProfitMatrix, testBalancing, testCompleteSolution };