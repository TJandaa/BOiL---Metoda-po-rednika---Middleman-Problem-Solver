'use client';

import { Supplier, Customer, TransportationCell } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { formatNumber, cn } from '@/lib/utils';
import { Factory, Store, Truck, Users, Package } from 'lucide-react';

export interface ProblemVisualizationProps {
  suppliers: Supplier[];
  customers: Customer[];
  optimalRoutes?: TransportationCell[];
  className?: string;
}

export function ProblemVisualization({ 
  suppliers, 
  customers, 
  optimalRoutes = [], 
  className 
}: ProblemVisualizationProps) {
  // Calculate positions for nodes
  const supplierPositions = suppliers.map((_, index) => ({
    x: 20,
    y: 20 + (index * (60 / Math.max(suppliers.length - 1, 1)))
  }));

  const customerPositions = customers.map((_, index) => ({
    x: 80,
    y: 20 + (index * (60 / Math.max(customers.length - 1, 1)))
  }));

  // Find the maximum flow for scaling line thickness
  const maxFlow = Math.max(...optimalRoutes.map(route => route.quantity), 1);

  // Get route for a specific supplier-customer pair
  const getRoute = (supplierId: string, customerId: string) => {
    return optimalRoutes.find(route => 
      route.supplierId === supplierId && route.customerId === customerId
    );
  };

  // Get line color based on profit
  const getRouteColor = (route: TransportationCell) => {
    const totalProfit = route.quantity * route.unitProfit;
    if (totalProfit > 0) {
      const intensity = Math.min(totalProfit / 100, 1); // Normalize to 0-1
      return `rgb(${Math.round(34 + (21 * intensity))}, ${Math.round(197 + (58 * intensity))}, ${Math.round(94 + (161 * intensity))})`;
    }
    return '#ef4444'; // Red for losses
  };

  // Get line thickness based on quantity
  const getLineThickness = (quantity: number) => {
    return Math.max(1, (quantity / maxFlow) * 4);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🕸️ Network Visualization
        </CardTitle>
        <CardDescription>
          Visual representation of the supply chain network and optimal flows
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Network Diagram */}
        <div className="relative">
          <svg
            viewBox="0 0 100 80"
            className="w-full h-80 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 to-green-50"
          >
            {/* Draw flow lines first (behind nodes) */}
            {optimalRoutes.map((route, index) => {
              const supplierIndex = suppliers.findIndex(s => s.id === route.supplierId);
              const customerIndex = customers.findIndex(c => c.id === route.customerId);
              
              if (supplierIndex === -1 || customerIndex === -1) return null;

              const startPos = supplierPositions[supplierIndex];
              const endPos = customerPositions[customerIndex];
              
              if (!startPos || !endPos) return null;
              
              const thickness = getLineThickness(route.quantity);
              const color = getRouteColor(route);

              return (
                <g key={`route-${index}`}>
                  {/* Flow line */}
                  <line
                    x1={startPos.x + 3}
                    y1={startPos.y}
                    x2={endPos.x - 3}
                    y2={endPos.y}
                    stroke={color}
                    strokeWidth={thickness}
                    strokeDasharray={route.unitProfit > 0 ? "none" : "2,2"}
                    opacity={0.8}
                  />
                  
                  {/* Flow arrow */}
                  <polygon
                    points={`${endPos.x - 5},${endPos.y - 1} ${endPos.x - 5},${endPos.y + 1} ${endPos.x - 3},${endPos.y}`}
                    fill={color}
                  />
                  
                  {/* Flow label */}
                  <text
                    x={(startPos.x + endPos.x) / 2}
                    y={(startPos.y + endPos.y) / 2 - 1}
                    fontSize="2"
                    fill="#374151"
                    textAnchor="middle"
                    className="font-medium"
                  >
                    {formatNumber(route.quantity)}
                  </text>
                </g>
              );
            })}

            {/* Supplier nodes */}
            {suppliers.map((supplier, index) => {
              const pos = supplierPositions[index];
              if (!pos) return null;
              
              const totalSupplied = optimalRoutes
                .filter(route => route.supplierId === supplier.id)
                .reduce((sum, route) => sum + route.quantity, 0);
              const utilizationRate = (totalSupplied / supplier.supply) * 100;

              return (
                <g key={`supplier-${supplier.id}`}>
                  {/* Node circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="3"
                    fill="#3b82f6"
                    stroke="#1e40af"
                    strokeWidth="0.5"
                  />
                  
                  {/* Utilization ring */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="4"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.5"
                    strokeDasharray={`${(utilizationRate / 100) * 25.13} 25.13`}
                    opacity={0.7}
                  />
                  
                  {/* Node label */}
                  <text
                    x={pos.x - 8}
                    y={pos.y + 0.5}
                    fontSize="2.5"
                    fill="#1f2937"
                    className="font-medium"
                  >
                    {supplier.name}
                  </text>
                  
                  {/* Supply info */}
                  <text
                    x={pos.x - 8}
                    y={pos.y + 3}
                    fontSize="1.5"
                    fill="#6b7280"
                  >
                    Supply: {formatNumber(supplier.supply)}
                  </text>
                  
                  {/* Utilization info */}
                  <text
                    x={pos.x - 8}
                    y={pos.y + 4.5}
                    fontSize="1.5"
                    fill={utilizationRate > 80 ? "#10b981" : "#f59e0b"}
                  >
                    Used: {utilizationRate.toFixed(0)}%
                  </text>
                </g>
              );
            })}

            {/* Customer nodes */}
            {customers.map((customer, index) => {
              const pos = customerPositions[index];
              if (!pos) return null;
              const totalReceived = optimalRoutes
                .filter(route => route.customerId === customer.id)
                .reduce((sum, route) => sum + route.quantity, 0);
              const satisfactionRate = (totalReceived / customer.demand) * 100;

              return (
                <g key={`customer-${customer.id}`}>
                  {/* Node circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="3"
                    fill="#10b981"
                    stroke="#059669"
                    strokeWidth="0.5"
                  />
                  
                  {/* Satisfaction ring */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="4"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="0.5"
                    strokeDasharray={`${(satisfactionRate / 100) * 25.13} 25.13`}
                    opacity={0.7}
                  />
                  
                  {/* Node label */}
                  <text
                    x={pos.x + 6}
                    y={pos.y + 0.5}
                    fontSize="2.5"
                    fill="#1f2937"
                    className="font-medium"
                  >
                    {customer.name}
                  </text>
                  
                  {/* Demand info */}
                  <text
                    x={pos.x + 6}
                    y={pos.y + 3}
                    fontSize="1.5"
                    fill="#6b7280"
                  >
                    Demand: {formatNumber(customer.demand)}
                  </text>
                  
                  {/* Satisfaction info */}
                  <text
                    x={pos.x + 6}
                    y={pos.y + 4.5}
                    fontSize="1.5"
                    fill={satisfactionRate > 80 ? "#10b981" : "#ef4444"}
                  >
                    Filled: {satisfactionRate.toFixed(0)}%
                  </text>
                </g>
              );
            })}

            {/* Legend */}
            <g>
              <text x="5" y="75" fontSize="2" fill="#374151" className="font-medium">
                Legend:
              </text>
              <circle cx="8" cy="77" r="1" fill="#3b82f6" />
              <text x="10" y="77.5" fontSize="1.5" fill="#6b7280">Suppliers</text>
              
              <circle cx="25" cy="77" r="1" fill="#10b981" />
              <text x="27" y="77.5" fontSize="1.5" fill="#6b7280">Customers</text>
              
              <line x1="42" y1="77" x2="46" y2="77" stroke="#10b981" strokeWidth="1" />
              <text x="48" y="77.5" fontSize="1.5" fill="#6b7280">Profitable Flow</text>
              
              <line x1="65" y1="77" x2="69" y2="77" stroke="#ef4444" strokeWidth="1" strokeDasharray="1,1" />
              <text x="71" y="77.5" fontSize="1.5" fill="#6b7280">Loss Flow</text>
            </g>
          </svg>
        </div>

        {/* Network Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="bg-blue-50 rounded-full p-2 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <Factory className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-blue-600">{suppliers.length}</div>
            <div className="text-sm text-gray-500">Suppliers</div>
          </div>
          
          <div className="text-center">
            <div className="bg-green-50 rounded-full p-2 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <Store className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-xl font-bold text-green-600">{customers.length}</div>
            <div className="text-sm text-gray-500">Customers</div>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-50 rounded-full p-2 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <Truck className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-xl font-bold text-purple-600">{optimalRoutes.length}</div>
            <div className="text-sm text-gray-500">Active Routes</div>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-50 rounded-full p-2 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-xl font-bold text-orange-600">
              {formatNumber(optimalRoutes.reduce((sum, route) => sum + route.quantity, 0))}
            </div>
            <div className="text-sm text-gray-500">Total Flow</div>
          </div>
        </div>

        {/* Flow Analysis */}
        {optimalRoutes.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Flow Analysis</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Heaviest Flow:</span>
                {(() => {
                  const heaviestRoute = optimalRoutes.reduce((max, route) => 
                    route.quantity > max.quantity ? route : max
                  );
                  const supplierName = suppliers.find(s => s.id === heaviestRoute.supplierId)?.name || '';
                  const customerName = customers.find(c => c.id === heaviestRoute.customerId)?.name || '';
                  return ` ${supplierName} → ${customerName} (${formatNumber(heaviestRoute.quantity)} units)`;
                })()}
              </div>
              <div>
                <span className="font-medium">Most Profitable Route:</span>
                {(() => {
                  const mostProfitable = optimalRoutes.reduce((max, route) => 
                    (route.quantity * route.unitProfit) > (max.quantity * max.unitProfit) ? route : max
                  );
                  const supplierName = suppliers.find(s => s.id === mostProfitable.supplierId)?.name || '';
                  const customerName = customers.find(c => c.id === mostProfitable.customerId)?.name || '';
                  return ` ${supplierName} → ${customerName} ($${(mostProfitable.quantity * mostProfitable.unitProfit).toFixed(2)})`;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {optimalRoutes.length === 0 && (
          <div className="mt-6 text-center py-8 text-gray-500">
            <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <div className="font-medium">No Transportation Routes</div>
            <div className="text-sm">Calculate the optimal plan to see transportation flows</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}