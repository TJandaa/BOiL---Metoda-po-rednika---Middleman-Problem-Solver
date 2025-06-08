/**
 * Example problems for testing and demonstration
 */

import { MiddlemanProblem } from '../types';

/**
 * Small example problem for testing
 */
export const smallExample: MiddlemanProblem = {
  suppliers: [
    {
      id: 'S1',
      name: 'Factory A',
      supply: 50,
      purchaseCost: 8
    },
    {
      id: 'S2',
      name: 'Factory B',
      supply: 70,
      purchaseCost: 10
    }
  ],
  customers: [
    {
      id: 'C1',
      name: 'Store X',
      demand: 40,
      sellingPrice: 20
    },
    {
      id: 'C2',
      name: 'Store Y',
      demand: 60,
      sellingPrice: 25
    }
  ],
  transportationCosts: [
    [
      { supplierId: 'S1', customerId: 'C1', cost: 2 },
      { supplierId: 'S1', customerId: 'C2', cost: 4 }
    ],
    [
      { supplierId: 'S2', customerId: 'C1', cost: 3 },
      { supplierId: 'S2', customerId: 'C2', cost: 1 }
    ]
  ]
};

/**
 * Medium complexity example
 */
export const mediumExample: MiddlemanProblem = {
  suppliers: [
    {
      id: 'S1',
      name: 'Warehouse North',
      supply: 100,
      purchaseCost: 15
    },
    {
      id: 'S2',
      name: 'Warehouse South',
      supply: 120,
      purchaseCost: 12
    },
    {
      id: 'S3',
      name: 'Warehouse East',
      supply: 80,
      purchaseCost: 18
    }
  ],
  customers: [
    {
      id: 'C1',
      name: 'Retail Chain A',
      demand: 90,
      sellingPrice: 35
    },
    {
      id: 'C2',
      name: 'Retail Chain B',
      demand: 110,
      sellingPrice: 40
    },
    {
      id: 'C3',
      name: 'Online Store',
      demand: 70,
      sellingPrice: 45
    }
  ],
  transportationCosts: [
    [
      { supplierId: 'S1', customerId: 'C1', cost: 5 },
      { supplierId: 'S1', customerId: 'C2', cost: 8 },
      { supplierId: 'S1', customerId: 'C3', cost: 6 }
    ],
    [
      { supplierId: 'S2', customerId: 'C1', cost: 7 },
      { supplierId: 'S2', customerId: 'C2', cost: 3 },
      { supplierId: 'S2', customerId: 'C3', cost: 9 }
    ],
    [
      { supplierId: 'S3', customerId: 'C1', cost: 4 },
      { supplierId: 'S3', customerId: 'C2', cost: 6 },
      { supplierId: 'S3', customerId: 'C3', cost: 2 }
    ]
  ]
};

/**
 * Unbalanced problem (supply > demand)
 */
export const unbalancedSupplyExample: MiddlemanProblem = {
  suppliers: [
    {
      id: 'S1',
      name: 'Oversupplied Factory',
      supply: 200,
      purchaseCost: 10
    },
    {
      id: 'S2',
      name: 'Small Factory',
      supply: 100,
      purchaseCost: 8
    }
  ],
  customers: [
    {
      id: 'C1',
      name: 'Small Store',
      demand: 80,
      sellingPrice: 25
    },
    {
      id: 'C2',
      name: 'Medium Store',
      demand: 120,
      sellingPrice: 30
    }
  ],
  transportationCosts: [
    [
      { supplierId: 'S1', customerId: 'C1', cost: 3 },
      { supplierId: 'S1', customerId: 'C2', cost: 2 }
    ],
    [
      { supplierId: 'S2', customerId: 'C1', cost: 4 },
      { supplierId: 'S2', customerId: 'C2', cost: 5 }
    ]
  ]
};

/**
 * Unbalanced problem (demand > supply)
 */
export const unbalancedDemandExample: MiddlemanProblem = {
  suppliers: [
    {
      id: 'S1',
      name: 'Limited Factory',
      supply: 60,
      purchaseCost: 12
    },
    {
      id: 'S2',
      name: 'Small Producer',
      supply: 40,
      purchaseCost: 15
    }
  ],
  customers: [
    {
      id: 'C1',
      name: 'Large Retailer',
      demand: 150,
      sellingPrice: 35
    },
    {
      id: 'C2',
      name: 'Department Store',
      demand: 100,
      sellingPrice: 40
    }
  ],
  transportationCosts: [
    [
      { supplierId: 'S1', customerId: 'C1', cost: 6 },
      { supplierId: 'S1', customerId: 'C2', cost: 4 }
    ],
    [
      { supplierId: 'S2', customerId: 'C1', cost: 5 },
      { supplierId: 'S2', customerId: 'C2', cost: 7 }
    ]
  ]
};

export const allExamples = {
  small: smallExample,
  medium: mediumExample,
  unbalancedSupply: unbalancedSupplyExample,
  unbalancedDemand: unbalancedDemandExample
};