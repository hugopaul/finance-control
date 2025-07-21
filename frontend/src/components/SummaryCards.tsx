import React, { useEffect } from 'react';
import { MonthlyData } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Target, Plus, Minus, BarChart3 } from 'lucide-react';

interface SummaryCardsProps {
  currentMonthData?: MonthlyData;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ currentMonthData }) => {
  const totalIncome = currentMonthData?.totalIncome || 0;
  const totalExpenses = currentMonthData?.totalExpenses || 0;
  const balance = currentMonthData?.balance || 0;
  const projectedBalance = currentMonthData?.projectedBalance || 0;

  // Debug logs para verificar atualizações
  useEffect(() => {
    console.log('🔄 SummaryCards - Dados atualizados:', {
      totalIncome,
      totalExpenses,
      balance,
      projectedBalance,
      transactionsCount: currentMonthData?.transactions?.length || 0,
      currentMonthData
    });
  }, [totalIncome, totalExpenses, balance, projectedBalance, currentMonthData]);

  // Calcular percentuais e status
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;
  const expenseRate = totalIncome > 0 ? ((totalExpenses / totalIncome) * 100) : 0;
  
  const getBalanceStatus = () => {
    if (balance >= 0) {
      if (savingsRate >= 20) return { status: 'Excelente', color: 'text-success', bgColor: 'bg-success/10', icon: TrendingUp };
      if (savingsRate >= 10) return { status: 'Bom', color: 'text-success', bgColor: 'bg-success/10', icon: TrendingUp };
      return { status: 'Positivo', color: 'text-success', bgColor: 'bg-success/10', icon: DollarSign };
    } else {
      return { status: 'Negativo', color: 'text-error', bgColor: 'bg-error/10', icon: TrendingDown };
    }
  };

  const balanceStatus = getBalanceStatus();

  const cards = [
    {
      title: 'Receitas',
      value: totalIncome,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: totalIncome > 0 ? `R$ ${totalIncome.toFixed(2)} recebidos` : 'Nenhuma receita',
      description: 'Total de entradas',
    },
    {
      title: 'Despesas',
      value: totalExpenses,
      icon: TrendingDown,
      color: 'text-error',
      bgColor: 'bg-error/10',
      change: totalExpenses > 0 ? `R$ ${totalExpenses.toFixed(2)} gastos` : 'Nenhuma despesa',
      description: 'Total de saídas',
    },
    {
      title: 'Saldo',
      value: balance,
      icon: balanceStatus.icon,
      color: balanceStatus.color,
      bgColor: balanceStatus.bgColor,
      change: balanceStatus.status,
      description: `R$ ${balance.toFixed(2)} disponível`,
    },
    {
      title: 'Projetado',
      value: projectedBalance,
      icon: Target,
      color: 'text-info',
      bgColor: 'bg-info/10',
      change: projectedBalance > 0 ? 'Acima da meta' : 'Abaixo da meta',
      description: 'Saldo projetado',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card, index) => (
          <div key={index} className="card bg-base-100 shadow-xl border border-base-300 transition-all duration-300 hover:shadow-2xl hover:scale-105">
            <div className="card-body p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 sm:p-3 rounded-full ${card.bgColor}`}>
                  <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.color}`} />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-base-content/70">{card.title}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xl sm:text-2xl font-bold text-base-content">
                  R$ {card.value.toFixed(2)}
                </p>
                <p className={`text-xs font-medium ${card.color}`}>{card.change}</p>
                <p className="text-xs text-base-content/60">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Card de resumo adicional */}
      {(totalIncome > 0 || totalExpenses > 0) && (
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-6">
            <h3 className="card-title text-lg mb-4">📊 Resumo Financeiro</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Taxa de Poupança */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-base-content/70">Taxa de Poupança</span>
                  <span className="text-sm font-bold text-base-content">{savingsRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-base-300 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      savingsRate >= 20 ? 'bg-success' : 
                      savingsRate >= 10 ? 'bg-warning' : 'bg-error'
                    }`}
                    style={{ width: `${Math.min(savingsRate, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-base-content/60">
                  {balance.toFixed(2)} de {totalIncome.toFixed(2)} reais
                </p>
              </div>

              {/* Status Financeiro */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-base-content/70">Status Financeiro</span>
                <div className="flex items-center gap-2">
                  <balanceStatus.icon className={`w-5 h-5 ${balanceStatus.color}`} />
                  <span className={`text-sm font-medium ${balanceStatus.color}`}>{balanceStatus.status}</span>
                </div>
                <p className="text-xs text-base-content/60">
                  {balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
                </p>
              </div>

              {/* Projeção vs Realidade */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-base-content/70">Projeção vs Realidade</span>
                <p className="text-lg font-bold text-base-content">
                  R$ {(projectedBalance - balance).toFixed(2)}
                </p>
                <p className="text-xs text-base-content/60">
                  {projectedBalance > balance ? 'Abaixo da projeção' : 'Acima da projeção'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem quando não há transações */}
      {totalIncome === 0 && totalExpenses === 0 && (
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-8 text-center">
            <BarChart3 className="w-16 h-16 text-info mx-auto mb-4" />
            <h3 className="text-xl font-bold text-base-content mb-2">Nenhuma Transação Registrada</h3>
            <p className="text-base-content/60 mb-4">
              Este mês não possui transações registradas. Comece a controlar suas finanças!
            </p>
            <button className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Primeira Transação
            </button>
          </div>
        </div>
      )}

      {/* Debug info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="card bg-base-200 border border-base-300">
          <div className="card-body p-4">
            <p className="text-xs font-medium text-base-content/70 mb-2">Debug Info:</p>
            <div className="text-xs text-base-content/60 space-y-1">
              <p>Transações: {currentMonthData?.transactions?.length || 0}</p>
              <p>Total Income: R$ {totalIncome.toFixed(2)}</p>
              <p>Total Expenses: R$ {totalExpenses.toFixed(2)}</p>
              <p>Balance: R$ {balance.toFixed(2)}</p>
              <p>Projected Balance: R$ {projectedBalance.toFixed(2)}</p>
              <p>Savings Rate: {savingsRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryCards; 