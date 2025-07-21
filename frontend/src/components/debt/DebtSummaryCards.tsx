import React, { useEffect } from 'react';
import { DebtMonthlyData } from '../../types';
import { DollarSign, Users, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Plus } from 'lucide-react';

interface DebtSummaryCardsProps {
  currentMonthData?: DebtMonthlyData;
}

const DebtSummaryCards: React.FC<DebtSummaryCardsProps> = ({ currentMonthData }) => {
  const totalOwed = currentMonthData?.totalOwed || 0;
  const totalPaid = currentMonthData?.totalPaid || 0;
  const totalPending = currentMonthData?.totalPending || 0;
  const totalPeople = currentMonthData?.debts.reduce((acc, debt) => {
    if (!acc.includes(debt.person_id)) acc.push(debt.person_id);
    return acc;
  }, [] as string[]).length || 0;

  // Debug logs para verificar atualizações
  useEffect(() => {
    console.log('🔄 DebtSummaryCards - Dados atualizados:', {
      totalOwed,
      totalPaid,
      totalPending,
      totalPeople,
      debtsCount: currentMonthData?.debts.length || 0,
      currentMonthData
    });
  }, [totalOwed, totalPaid, totalPending, totalPeople, currentMonthData]);

  // Calcular percentual de pagamento
  const paymentPercentage = totalOwed > 0 ? (totalPaid / totalOwed) * 100 : 0;
  
  // Determinar status baseado nos valores
  const getStatusInfo = () => {
    if (totalOwed === 0) return { status: 'Em dia', color: 'text-success', bgColor: 'bg-success/10', icon: CheckCircle };
    if (totalPending === 0) return { status: 'Totalmente pago', color: 'text-success', bgColor: 'bg-success/10', icon: CheckCircle };
    if (paymentPercentage >= 70) return { status: 'Bem pago', color: 'text-success', bgColor: 'bg-success/10', icon: TrendingUp };
    if (paymentPercentage >= 30) return { status: 'Parcialmente pago', color: 'text-warning', bgColor: 'bg-warning/10', icon: AlertCircle };
    return { status: 'Pendente', color: 'text-error', bgColor: 'bg-error/10', icon: AlertCircle };
  };

  const statusInfo = getStatusInfo();

  // Validação de dados
  const validateData = () => {
    const calculatedTotalOwed = currentMonthData?.debts.reduce((sum, debt) => sum + debt.amount, 0) || 0;
    const calculatedTotalPaid = currentMonthData?.debts.reduce((sum, debt) => sum + debt.paid_amount, 0) || 0;
    const calculatedTotalPending = calculatedTotalOwed - calculatedTotalPaid;

    const isValid = Math.abs(totalOwed - calculatedTotalOwed) < 0.01 && 
                   Math.abs(totalPaid - calculatedTotalPaid) < 0.01 && 
                   Math.abs(totalPending - calculatedTotalPending) < 0.01;

    if (!isValid) {
      console.warn('⚠️ DebtSummaryCards - Inconsistência nos dados:', {
        stored: { totalOwed, totalPaid, totalPending },
        calculated: { calculatedTotalOwed, calculatedTotalPaid, calculatedTotalPending }
      });
    }

    return isValid;
  };

  // Executar validação
  useEffect(() => {
    validateData();
  }, [currentMonthData]);

  const cards = [
    {
      title: 'Total Devido',
      value: totalOwed,
      icon: DollarSign,
      color: 'text-error',
      bgColor: 'bg-error/10',
      change: totalOwed > 0 ? `${totalOwed.toFixed(2)} em dívidas` : 'Nenhuma dívida',
      description: 'Valor total emprestado',
    },
    {
      title: 'Total Pago',
      value: totalPaid,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: totalPaid > 0 ? `${totalPaid.toFixed(2)} recebidos` : 'Nenhum pagamento',
      description: 'Valor total recebido',
    },
    {
      title: 'Pendente',
      value: totalPending,
      icon: statusInfo.icon,
      color: statusInfo.color,
      bgColor: statusInfo.bgColor,
      change: statusInfo.status,
      description: `R$ ${totalPending.toFixed(2)} ainda pendente`,
    },
    {
      title: 'Pessoas',
      value: totalPeople,
      icon: Users,
      color: 'text-info',
      bgColor: 'bg-info/10',
      change: totalPeople > 0 ? `${totalPeople} pessoa${totalPeople > 1 ? 's' : ''}` : 'Nenhuma pessoa',
      description: 'Com dívidas ativas',
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
                  {card.title === 'Pessoas' ? card.value : `R$ ${card.value.toFixed(2)}`}
                </p>
                <p className={`text-xs font-medium ${card.color}`}>{card.change}</p>
                <p className="text-xs text-base-content/60">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Card de resumo adicional */}
      {totalOwed > 0 && (
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-6">
            <h3 className="card-title text-lg mb-4">📊 Resumo do Mês</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Progresso de pagamento */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-base-content/70">Progresso de Pagamento</span>
                  <span className="text-sm font-bold text-base-content">{paymentPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-base-300 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      paymentPercentage >= 70 ? 'bg-success' : 
                      paymentPercentage >= 30 ? 'bg-warning' : 'bg-error'
                    }`}
                    style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-base-content/60">
                  {totalPaid.toFixed(2)} de {totalOwed.toFixed(2)} reais
                </p>
              </div>

              {/* Status geral */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-base-content/70">Status Geral</span>
                <div className="flex items-center gap-2">
                  <statusInfo.icon className={`w-5 h-5 ${statusInfo.color}`} />
                  <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.status}</span>
                </div>
                <p className="text-xs text-base-content/60">
                  {totalPending > 0 ? `${totalPending.toFixed(2)} reais pendentes` : 'Todas as dívidas pagas'}
                </p>
              </div>

              {/* Média por pessoa */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-base-content/70">Média por Pessoa</span>
                <p className="text-lg font-bold text-base-content">
                  R$ {totalPeople > 0 ? (totalOwed / totalPeople).toFixed(2) : '0.00'}
                </p>
                <p className="text-xs text-base-content/60">
                  {totalPeople} pessoa{totalPeople !== 1 ? 's' : ''} com dívidas
                </p>
              </div>
            </div>

            {/* Debug info (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-base-200 rounded-lg">
                <p className="text-xs font-medium text-base-content/70 mb-2">Debug Info:</p>
                <div className="text-xs text-base-content/60 space-y-1">
                  <p>Dívidas: {currentMonthData?.debts.length || 0}</p>
                  <p>Total Owed (stored): R$ {totalOwed.toFixed(2)}</p>
                  <p>Total Paid (stored): R$ {totalPaid.toFixed(2)}</p>
                  <p>Total Pending (stored): R$ {totalPending.toFixed(2)}</p>
                  <p>Payment %: {paymentPercentage.toFixed(1)}%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mensagem quando não há dívidas */}
      {totalOwed === 0 && (
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-8 text-center">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-xl font-bold text-base-content mb-2">Nenhuma Dívida Registrada</h3>
            <p className="text-base-content/60 mb-4">
              Este mês não possui dívidas registradas. Você está em dia!
            </p>
            <button className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Nova Dívida
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtSummaryCards; 