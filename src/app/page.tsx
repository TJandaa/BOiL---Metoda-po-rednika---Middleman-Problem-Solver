'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  SupplierForm,
  CustomerForm,
  TransportationCostMatrix,
  DataSummary,
  ProfitMatrix,
  OptimalTransportationTable,
  ResultsSummary,
  ProblemVisualization
} from '@/components';
import { Supplier, Customer, TransportationCost, MiddlemanSolution } from '@/lib/types';
import { solveMiddlemanProblem } from '@/lib/utils/middleman';
import { smallExample, mediumExample } from '@/lib/utils/examples';
import { Calculator, Play, RotateCcw, FileText } from 'lucide-react';

// Import result components (will create these next)
// import { ProfitMatrix } from '@/components/ProfitMatrix';
// import { OptimalTransportationTable } from '@/components/OptimalTransportationTable';
// import { ResultsSummary } from '@/components/ResultsSummary';
// import { ProblemVisualization } from '@/components/ProblemVisualization';

export default function Home() {
  // State management
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transportationCosts, setTransportationCosts] = useState<TransportationCost[][]>([]);
  const [solution, setSolution] = useState<MiddlemanSolution | null>(null);
  
  // UI state
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if ready to calculate
  const isReadyToCalculate = suppliers.length > 0 && customers.length > 0 && 
    transportationCosts.length > 0 && transportationCosts[0]?.length && transportationCosts[0].length > 0;

  // Supplier handlers
  const handleAddSupplier = (supplier: Supplier) => {
    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
      setEditingSupplier(null);
    } else {
      setSuppliers(prev => [...prev, supplier]);
    }
    setShowSupplierForm(false);
    setSolution(null); // Clear solution when data changes
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowSupplierForm(true);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    setSolution(null);
  };

  // Customer handlers
  const handleAddCustomer = (customer: Customer) => {
    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
      setEditingCustomer(null);
    } else {
      setCustomers(prev => [...prev, customer]);
    }
    setShowCustomerForm(false);
    setSolution(null);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowCustomerForm(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    setSolution(null);
  };

  const handleCancelForm = () => {
    setShowSupplierForm(false);
    setShowCustomerForm(false);
    setEditingSupplier(null);
    setEditingCustomer(null);
  };

  // Transportation costs handler
  const handleTransportationCostsChange = (costs: TransportationCost[][]) => {
    setTransportationCosts(costs);
    setSolution(null);
  };

  // Calculate optimal plan
  const handleCalculate = async () => {
    if (!isReadyToCalculate) return;

    setIsCalculating(true);
    setError(null);

    try {
      const problem = {
        suppliers,
        customers,
        transportationCosts
      };

      const result = await new Promise<MiddlemanSolution>((resolve) => {
        // Simulate async calculation
        setTimeout(() => {
          const solution = solveMiddlemanProblem(problem);
          resolve(solution);
        }, 1000);
      });

      setSolution(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during calculation');
    } finally {
      setIsCalculating(false);
    }
  };

  // Load example
  const handleLoadExample = (example: 'small' | 'medium') => {
    const exampleData = example === 'small' ? smallExample : mediumExample;
    setSuppliers(exampleData.suppliers);
    setCustomers(exampleData.customers);
    setTransportationCosts(exampleData.transportationCosts);
    setSolution(null);
    setError(null);
  };

  // Reset all data
  const handleReset = () => {
    setSuppliers([]);
    setCustomers([]);
    setTransportationCosts([]);
    setSolution(null);
    setError(null);
    setShowSupplierForm(false);
    setShowCustomerForm(false);
    setEditingSupplier(null);
    setEditingCustomer(null);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <Calculator className="h-10 w-10 text-blue-600" />
          Middleman Problem Solver
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Optimize transportation costs and maximize profit in supply chain networks using 
          advanced operations research algorithms.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4 mb-8">
        <Button 
          variant="outline" 
          onClick={() => handleLoadExample('small')}
          disabled={isCalculating}
        >
          <FileText className="h-4 w-4 mr-2" />
          Load Small Example
        </Button>
        <Button 
          variant="outline" 
          onClick={() => handleLoadExample('medium')}
          disabled={isCalculating}
        >
          <FileText className="h-4 w-4 mr-2" />
          Load Medium Example
        </Button>
        <Button 
          variant="secondary" 
          onClick={handleReset}
          disabled={isCalculating}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset All
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Input Forms Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Suppliers Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Suppliers</h2>
              <Button
                size="sm"
                onClick={() => setShowSupplierForm(true)}
                disabled={showSupplierForm || showCustomerForm || isCalculating}
              >
                Add
              </Button>
            </div>
            
            {showSupplierForm && (
              <SupplierForm
                {...(editingSupplier && { supplier: editingSupplier })}
                onSubmit={handleAddSupplier}
                onCancel={handleCancelForm}
                disabled={isCalculating}
              />
            )}
          </div>

          {/* Customers Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Customers</h2>
              <Button
                size="sm"
                onClick={() => setShowCustomerForm(true)}
                disabled={showSupplierForm || showCustomerForm || isCalculating}
              >
                Add
              </Button>
            </div>
            
            {showCustomerForm && (
              <CustomerForm
                {...(editingCustomer && { customer: editingCustomer })}
                onSubmit={handleAddCustomer}
                onCancel={handleCancelForm}
                disabled={isCalculating}
              />
            )}
          </div>

          {/* Calculate Button */}
          {isReadyToCalculate && (
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="w-full"
                  size="lg"
                >
                  {isCalculating ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Calculate Optimal Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Error Display */}
          {error && (
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-red-800 font-medium">Calculation Error</div>
                  <div className="text-red-700 text-sm mt-1">{error}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Summary */}
          <DataSummary
            suppliers={suppliers}
            customers={customers}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
            onEditCustomer={handleEditCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            disabled={showSupplierForm || showCustomerForm || isCalculating}
          />

          {/* Transportation Cost Matrix */}
          {suppliers.length > 0 && customers.length > 0 && (
            <TransportationCostMatrix
              suppliers={suppliers}
              customers={customers}
              transportationCosts={transportationCosts}
              onChange={handleTransportationCostsChange}
              disabled={showSupplierForm || showCustomerForm || isCalculating}
            />
          )}

          {/* Results Section */}
          {solution && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-green-600">
                    ✅ Optimal Solution Found!
                  </CardTitle>
                  <CardDescription>
                    The algorithm found the optimal transportation plan in {solution.iterations} iterations.
                    Execution time: {solution.executionTime.toFixed(2)}ms
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Results Summary */}
              <ResultsSummary solution={solution} />

              {/* Network Visualization */}
              <ProblemVisualization 
                suppliers={suppliers}
                customers={customers}
                optimalRoutes={solution.optimalRoutes}
              />

              {/* Detailed Results */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Profit Matrix */}
                <ProfitMatrix
                  suppliers={suppliers}
                  customers={customers}
                  profitMatrix={solution.profitMatrix}
                />

                {/* Optimal Transportation Table */}
                <OptimalTransportationTable
                  suppliers={suppliers}
                  customers={customers}
                  transportationPlan={solution.transportationPlan}
                  optimalRoutes={solution.optimalRoutes}
                  profitMatrix={solution.profitMatrix}
                />
              </div>
            </div>
          )}

          {/* Getting Started Guide */}
          {suppliers.length === 0 && customers.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Follow these steps to solve your transportation problem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <div className="font-medium">Add Suppliers</div>
                      <div className="text-sm text-gray-600">Define your suppliers with their supply capacity and purchase costs (kzi)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <div className="font-medium">Add Customers</div>
                      <div className="text-sm text-gray-600">Define your customers with their demand and selling prices (cj)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <div className="font-medium">Set Transportation Costs</div>
                      <div className="text-sm text-gray-600">Enter the transportation costs (ktij) for each supplier-customer pair</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <div className="font-medium">Calculate Optimal Plan</div>
                      <div className="text-sm text-gray-600">Click the calculate button to find the profit-maximizing solution</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}