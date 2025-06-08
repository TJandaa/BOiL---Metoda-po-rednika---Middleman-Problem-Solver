/**
 * TypeScript definitions for the Middleman Problem (Transportation Problem with Profit Maximization)
 * 
 * The Middleman Problem is an operations research optimization problem where:
 * - A middleman buys goods from suppliers at purchase costs (kzi)
 * - Transports them to customers at transportation costs (ktij)
 * - Sells to customers at selling prices (cj)
 * - Goal: Maximize total profit = Total Revenue - Total Purchase Cost - Total Transportation Cost
 */

export interface Supplier {
  id: string;
  name: string;
  supply: number;          // Maximum quantity available at this supplier
  purchaseCost: number;    // Cost per unit to buy from this supplier (kzi)
}

export interface Customer {
  id: string;
  name: string;
  demand: number;          // Maximum quantity demanded by this customer
  sellingPrice: number;    // Price per unit when selling to this customer (cj)
}

export interface TransportationCost {
  supplierId: string;
  customerId: string;
  cost: number;            // Cost per unit to transport from supplier to customer (ktij)
}

/**
 * Complete problem definition including all suppliers, customers, and transportation costs
 */
export interface MiddlemanProblem {
  suppliers: Supplier[];
  customers: Customer[];
  transportationCosts: TransportationCost[][];  // Matrix format [i][j] for supplier i to customer j
}

/**
 * Represents a single transportation route with profit calculation
 */
export interface TransportationCell {
  supplierId: string;
  customerId: string;
  quantity: number;        // Amount transported on this route (xij)
  unitProfit: number;      // Profit per unit for this route (zij)
  purchaseCost: number;    // Purchase cost per unit (kzi)
  transportationCost: number; // Transportation cost per unit (ktij)
  sellingPrice: number;    // Selling price per unit (cj)
}

/**
 * Complete solution to the Middleman Problem
 */
export interface MiddlemanSolution {
  // Core matrices
  profitMatrix: number[][];           // zij = cj - kzi - ktij for each route
  transportationPlan: number[][];     // xij values - quantities transported on each route
  
  // Problem characteristics
  isBalanced: boolean;                // Whether total supply equals total demand
  isFeasible: boolean;                // Whether a feasible solution exists
  isOptimal: boolean;                 // Whether this is the optimal solution
  
  // Financial results
  totalPurchaseCost: number;          // Sum of all purchase costs
  totalTransportationCost: number;    // Sum of all transportation costs
  totalRevenue: number;               // Sum of all revenues from sales
  totalProfit: number;                // Total profit = Revenue - Purchase Cost - Transportation Cost
  
  // Detailed breakdown
  optimalRoutes: TransportationCell[]; // All routes with positive flow
  
  // Solution metadata
  algorithm: string;                   // Name of algorithm used
  executionTime: number;              // Time taken to solve (milliseconds)
  iterations: number;                 // Number of iterations required
}

/**
 * Represents a potential improvement in the transportation plan
 */
export interface ImprovementOpportunity {
  supplierIndex: number;
  customerIndex: number;
  improvement: number;     // Potential profit increase per unit (Δij)
  currentProfit: number;   // Current profit for this route
  potentialProfit: number; // Potential profit if this route is used
}

/**
 * Dual variables used in optimality testing
 */
export interface DualVariables {
  alpha: number[];         // Dual variables for suppliers (αi)
  beta: number[];          // Dual variables for customers (βj)
}

/**
 * Balanced problem with fictitious suppliers/customers if needed
 */
export interface BalancedProblem {
  suppliers: Supplier[];
  customers: Customer[];
  isBalanced: boolean;
  fictitiousSupplier?: Supplier;  // Added if total demand > total supply
  fictitiousCustomer?: Customer;  // Added if total supply > total demand
  originalSupplyTotal: number;
  originalDemandTotal: number;
}

/**
 * Validation result for problem input
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Algorithm configuration options
 */
export interface AlgorithmConfig {
  name: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  useMaximumElementMethod: boolean;  // Start with highest profit vs other methods
  maxIterations: number;             // Maximum iterations before stopping
  tolerance: number;                 // Tolerance for optimality checking
}

/**
 * Step-by-step solution trace for educational purposes
 */
export interface SolutionStep {
  stepNumber: number;
  description: string;
  profitMatrix: number[][];
  transportationPlan: number[][];
  currentProfit: number;
  improvements: ImprovementOpportunity[];
}

/**
 * Complete solution trace including all steps
 */
export interface DetailedSolution extends MiddlemanSolution {
  steps: SolutionStep[];
  dualVariables: DualVariables;
  degeneracy: boolean;               // Whether solution has degeneracy issues
  alternativeOptimal: boolean;       // Whether alternative optimal solutions exist
}