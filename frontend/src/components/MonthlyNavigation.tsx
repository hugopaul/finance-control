import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useDebt } from '../context/DebtContext';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthlyNavigationProps {
  context?: 'financial' | 'debt';
}

const MonthlyNavigation: React.FC<MonthlyNavigationProps> = ({ context = 'financial' }) => {
  const financialContext = useFinancial();
  const debtContext = useDebt();
  
  // Usar o contexto apropriado baseado na prop
  const { state, dispatch } = context === 'debt' ? debtContext : financialContext;

  // Criar a data de forma mais explícita para evitar problemas de timezone
  const [year, month] = state.currentMonth.split('-');
  const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  
  const months = [
    subMonths(currentDate, 2),
    subMonths(currentDate, 1),
    currentDate,
    addMonths(currentDate, 1),
    addMonths(currentDate, 2),
  ];

  const handleMonthChange = (monthKey: string) => {
    dispatch({ type: 'SET_CURRENT_MONTH', payload: monthKey });
  };

  const handlePreviousMonth = () => {
    const previousMonth = subMonths(currentDate, 1);
    const monthKey = format(previousMonth, 'yyyy-MM');
    handleMonthChange(monthKey);
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentDate, 1);
    const monthKey = format(nextMonth, 'yyyy-MM');
    handleMonthChange(monthKey);
  };

  return (
    <div className="bg-base-100 border-b border-base-300 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Botão Anterior */}
          <button
            onClick={handlePreviousMonth}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-all duration-200"
            type="button"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Mês Anterior</span>
          </button>

          {/* Navegação Central */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-base-200 rounded-lg p-1">
              {months.map((month, index) => {
                const monthKey = format(month, 'yyyy-MM');
                const isCurrentMonth = monthKey === state.currentMonth;
                const isToday = format(month, 'yyyy-MM') === format(new Date(), 'yyyy-MM');
                
                return (
                  <button
                    key={monthKey}
                    onClick={() => handleMonthChange(monthKey)}
                    className={`
                      px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                      ${isCurrentMonth 
                        ? 'bg-primary text-primary-content shadow-md' 
                        : 'hover:bg-base-300 text-base-content'
                      }
                      ${isToday && !isCurrentMonth ? 'ring-2 ring-primary/30' : ''}
                    `}
                    title={format(month, 'MMMM yyyy', { locale: ptBR })}
                    type="button"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs opacity-75">
                        {format(month, 'MMM', { locale: ptBR })}
                      </span>
                      <span className="font-semibold">
                        {format(month, 'yyyy')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botão Próximo */}
          <button
            onClick={handleNextMonth}
            className="btn btn-ghost btn-sm gap-2 hover:bg-base-200 transition-all duration-200"
            type="button"
          >
            <span className="hidden sm:inline">Próximo Mês</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Indicador do Mês Atual */}
        <div className="text-center mt-2">
          <span className="text-sm text-base-content/60">
            Visualizando: <strong>{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyNavigation; 