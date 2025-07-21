import React from 'react';
import { Debt } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, DollarSign, User } from 'lucide-react';

interface DebtInstallmentsListProps {
  debts: Debt[];
  title?: string;
}

const DebtInstallmentsList: React.FC<DebtInstallmentsListProps> = ({ 
  debts, 
  title = "Dívidas Parceladas" 
}) => {
  // Filtrar apenas dívidas parceladas
  const installmentDebts = debts.filter(debt => 
    debt.installments && debt.total_installments && debt.total_installments > 1
  );

  if (installmentDebts.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <h3 className="card-title text-base-content">
            <Calendar className="w-5 h-5" />
            {title}
          </h3>
          <div className="divider"></div>
          <div className="text-center py-8 text-base-content/50">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-base-content/30" />
            <h4 className="text-lg font-semibold mb-2">Nenhuma dívida parcelada</h4>
            <p className="text-sm">Todas as dívidas são únicas</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h3 className="card-title text-base-content">
          <Calendar className="w-5 h-5" />
          {title}
        </h3>
        <div className="divider"></div>
        
        <div className="space-y-4">
          {installmentDebts.map((debt) => {
            const pending = debt.amount - debt.paid_amount;
            const progress = (debt.paid_amount / debt.amount) * 100;
            
            return (
              <div key={debt.id} className="p-4 bg-base-200 rounded-lg border border-base-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-base-content">
                        {debt.description}
                      </h4>
                      <p className="text-sm text-base-content/60">
                        Parcela {debt.installments} de {debt.total_installments}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base-content">
                      R$ {pending.toFixed(2)}
                    </p>
                    <p className="text-xs text-base-content/60">
                      de R$ {debt.amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-base-content/60 mb-1">
                    <span>Progresso</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-base-300 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-base-content/70">
                    <User className="w-4 h-4" />
                    <span>Pessoa</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-base-content">
                      {debt.person?.name || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-base-content/70">
                    <Calendar className="w-4 h-4" />
                    <span>Vencimento</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-base-content">
                      {debt.due_date ? format(new Date(debt.due_date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-3 flex justify-end">
                  <span className={`badge badge-sm ${
                    debt.status === 'paid' ? 'badge-success' :
                    debt.status === 'partial' ? 'badge-warning' :
                    'badge-error'
                  }`}>
                    {debt.status === 'paid' ? 'Pago' :
                     debt.status === 'partial' ? 'Parcial' :
                     'Pendente'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DebtInstallmentsList; 