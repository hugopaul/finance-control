import React from 'react';
import { Transaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ExpenseChartProps {
  transactions: Transaction[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ transactions }) => {
  // Agrupar despesas por categoria
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as { [key: string]: number });

  const data = Object.entries(expenseByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  const COLORS = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-base-200 p-3 rounded-lg shadow-lg border border-base-300">
          <p className="font-semibold text-base-content">{payload[0].name}</p>
          <p className="text-primary">
            R$ {payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl border border-base-300 transition-all duration-300">
        <div className="card-body">
          <h3 className="card-title text-base-content">📊 Despesas por Categoria</h3>
          <div className="divider"></div>
          <div className="text-center py-8 text-base-content/50">
            <p>Nenhuma despesa registrada</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 transition-all duration-300">
      <div className="card-body">
        <h3 className="card-title text-base-content">📊 Despesas por Categoria</h3>
        <div className="divider"></div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-base-content">{item.name}</span>
              </div>
              <span className="font-semibold text-sm text-base-content">
                R$ {item.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseChart; 