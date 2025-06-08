# Middleman Problem Solver

A modern web application built with Next.js, TypeScript, and Tailwind CSS to solve the Middleman Problem using advanced optimization algorithms.

## About the Middleman Problem

The Middleman Problem is a classic transportation optimization challenge in operations research. It involves a middleman who buys goods from suppliers and sells them to customers while maximizing profit. The problem considers:

- **Purchase Costs (kzi)**: Cost per unit to buy from each supplier
- **Transportation Costs (ktij)**: Cost per unit to transport from supplier i to customer j  
- **Selling Prices (cj)**: Revenue per unit when selling to each customer
- **Supply Constraints**: Maximum quantity available from each supplier
- **Demand Constraints**: Maximum quantity demanded by each customer

**Objective**: Maximize total profit = Total Revenue - Total Purchase Cost - Total Transportation Cost

## Features

- **Transportation Problem Solver**: Define suppliers, customers, and transportation costs
- **Profit Optimization**: Uses Maximum Element Method with optimality testing
- **Mathematical Algorithms**: 
  - Profit Matrix Calculation: zij = cj - kzi - ktij
  - Problem Balancing with fictitious suppliers/customers
  - Dual Variable Optimality Testing (αi, βj)
  - Iterative Improvement until optimal solution
- **Comprehensive Analysis**: Complete cost breakdown and profit analysis
- **Input Validation**: Ensures problem feasibility and data integrity
- **Multiple Examples**: Pre-built problems for testing and learning
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript with strict configuration
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom component library
- **Icons**: Lucide React
- **Validation**: Custom validation utilities

## Project Structure

```
middleman-app/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx       # Button component
│   │   └── Card.tsx         # Card components
│   └── lib/
│       ├── types/           # TypeScript type definitions
│       │   └── index.ts     # Core types
│       └── utils/           # Utility functions
│           ├── index.ts     # General utilities
│           ├── validation.ts # Input validation
│           └── algorithms.ts # Optimization algorithms
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── next.config.js          # Next.js configuration
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd middleman-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Usage

### Creating a Network

1. **Add Nodes**: Create suppliers, middlemen, and customers
2. **Define Connections**: Add edges with costs and capacities
3. **Set Parameters**: Configure supply/demand values
4. **Validate**: Ensure your network is valid
5. **Solve**: Choose an algorithm and find the optimal solution

### Algorithm Details

#### Maximum Element Method
- **Approach**: Start with the highest profit cell in the profit matrix
- **Process**: Allocate maximum possible quantity, then move to next highest profit
- **Advantage**: Often produces good initial solutions quickly

#### Profit Matrix Calculation
```
zij = cj - kzi - ktij
```
Where:
- **cj**: Selling price to customer j
- **kzi**: Purchase cost from supplier i  
- **ktij**: Transportation cost from supplier i to customer j

#### Problem Balancing
- **Unbalanced Supply**: Add fictitious customer with zero selling price
- **Unbalanced Demand**: Add fictitious supplier with zero purchase cost
- **Result**: Ensures total supply equals total demand

#### Optimality Testing
- **Dual Variables**: Calculate αi and βj for each supplier and customer
- **Opportunity Cost**: Δij = zij - αi - βj for non-basic variables
- **Optimal Condition**: All Δij ≤ 0 for non-basic variables

## Development

### Code Style

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **ESLint**: Next.js recommended configuration
- **Prettier**: Code formatting (add `.prettierrc` for custom rules)

### Adding New Algorithms

1. Add algorithm to `src/lib/utils/algorithms.ts`
2. Update the `MiddlemanSolver` class
3. Add algorithm metadata to `getAvailableAlgorithms()`
4. Update type definitions if needed

### Component Development

- Use the custom component library in `src/components/`
- Follow the established patterns for styling and props
- Ensure accessibility and responsive design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

- [ ] Advanced graph visualization with D3.js
- [ ] Real-time algorithm animation
- [ ] Data export/import functionality
- [ ] Performance benchmarking suite
- [ ] Multi-objective optimization
- [ ] Historical solution comparison
- [ ] REST API for external integrations

## Support

For questions, issues, or contributions, please open an issue on GitHub or contact the development team.