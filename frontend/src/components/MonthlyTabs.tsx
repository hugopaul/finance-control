import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MonthlyTabs: React.FC = () => {
  const { state, dispatch } = useFinancial();

  const currentDate = new Date(state.currentMonth + '-01');
  
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

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 transition-all duration-300">
      <div className="card-body">
        <h3 className="card-title text-base-content">📅 Navegação por Meses</h3>
        <div className="divider"></div>
        
        <div className="flex items-center justify-between">
          <button className="btn btn-circle btn-sm btn-outline hover:bg-base-200 transition-all duration-200">
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="tabs tabs-boxed bg-base-200">
            {months.map((month, index) => {
              const monthKey = format(month, 'yyyy-MM');
              const isCurrentMonth = monthKey === state.currentMonth;
              
              return (
                <button
                  key={monthKey}
                  className={`tab ${isCurrentMonth ? 'tab-active' : ''} transition-all duration-200`}
                  onClick={() => handleMonthChange(monthKey)}
                >
                  {format(month, 'MMM/yy', { locale: ptBR })}
                </button>
              );
            })}
          </div>
          
          <button className="btn btn-circle btn-sm btn-outline hover:bg-base-200 transition-all duration-200">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-4 text-center text-sm text-base-content/60">
          <p>Clique em um mês para visualizar os dados</p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTabs; 