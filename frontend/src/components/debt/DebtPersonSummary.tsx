import React from 'react';
import { Person, Debt } from '../../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, DollarSign, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface DebtPersonSummaryProps {
  person: Person;
  debts: Debt[];
}

const DebtPersonSummary: React.FC<DebtPersonSummaryProps> = ({ person, debts }) => {
  const personDebts = debts.filter(debt => debt.person_id === person.id);
  const totalOwed = personDebts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalPaid = personDebts.reduce((sum, debt) => sum + debt.paid_amount, 0);
  const totalPending = totalOwed - totalPaid;
  const progress = totalOwed > 0 ? (totalPaid / totalOwed) * 100 : 0;

  const pendingDebts = personDebts.filter(debt => debt.status === 'pending' || debt.status === 'partial');
  const paidDebts = personDebts.filter(debt => debt.status === 'paid');
  const installmentDebts = personDebts.filter(debt => 
    debt.installments && debt.total_installments && debt.total_installments > 1
  );

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${person.color} flex items-center justify-center text-white font-bold text-lg`}>
              {person.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg text-base-content">{person.name}</h3>
              <p className="text-sm text-base-content/60 capitalize">{person.relationship}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${totalPending > 0 ? 'text-warning' : 'text-success'}`}>
              R$ {totalPending.toFixed(2)}
            </p>
            <p className="text-xs text-base-content/60">
              {totalPending > 0 ? 'Devendo' : 'Em dia'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-base-content/60 mb-2">
            <span>Progresso de pagamento</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                progress >= 100 ? 'bg-success' : progress >= 50 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-base-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-base-content">Total Pago</span>
            </div>
            <p className="text-lg font-bold text-success">R$ {totalPaid.toFixed(2)}</p>
          </div>
          
          <div className="text-center p-3 bg-base-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-error" />
              <span className="text-sm font-medium text-base-content">Total Devido</span>
            </div>
            <p className="text-lg font-bold text-error">R$ {totalOwed.toFixed(2)}</p>
          </div>
        </div>

        {/* Debt Counts */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-base-content">{personDebts.length}</p>
            <p className="text-xs text-base-content/60">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">{pendingDebts.length}</p>
            <p className="text-xs text-base-content/60">Pendentes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{paidDebts.length}</p>
            <p className="text-xs text-base-content/60">Pagas</p>
          </div>
        </div>

        {/* Recent Debts */}
        {personDebts.length > 0 && (
          <div>
            <h4 className="font-semibold text-base-content mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Dívidas Recentes
            </h4>
            <div className="space-y-2">
              {personDebts.slice(0, 3).map((debt) => {
                const pending = debt.amount - debt.paid_amount;
                return (
                  <div key={debt.id} className="flex items-center justify-between p-2 bg-base-200 rounded text-sm">
                    <div>
                      <p className="font-medium text-base-content">{debt.description}</p>
                      <p className="text-xs text-base-content/60">
                        {format(parseISO(debt.date), 'dd/MM/yyyy', { locale: ptBR })}
                        {debt.installments && debt.total_installments && debt.total_installments > 1 && (
                          <span className="ml-2 text-primary">
                            ({debt.installments}/{debt.total_installments})
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${pending > 0 ? 'text-warning' : 'text-success'}`}>
                        R$ {pending.toFixed(2)}
                      </p>
                      <span className={`badge badge-xs ${
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
        )}

        {/* Installment Info */}
        {installmentDebts.length > 0 && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Dívidas Parceladas</span>
            </div>
            <p className="text-xs text-base-content/70">
              {installmentDebts.length} dívida{installmentDebts.length > 1 ? 's' : ''} em parcelas
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtPersonSummary; 