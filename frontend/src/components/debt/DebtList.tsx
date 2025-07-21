import React, { useState } from 'react';
import { Debt } from '../../types';
import { useDebt } from '../../context/DebtContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, CheckCircle, Clock, Edit, Trash2, X } from 'lucide-react';

interface DebtListProps {
  debts: Debt[];
  title: string;
  showAll?: boolean;
  onEditDebt?: (debt: Debt) => void;
  onDeleteDebt?: (debtId: string) => void;
  deletingDebtId?: string | null;
}

const DebtList: React.FC<DebtListProps> = ({ 
  debts, 
  title, 
  showAll = true,
  onEditDebt,
  onDeleteDebt,
  deletingDebtId
}) => {
  const { state } = useDebt();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const displayDebts = showAll ? debts : debts.slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-error" />;
      default:
        return <AlertCircle className="w-4 h-4 text-error" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="badge badge-success badge-sm">Pago</span>;
      case 'partial':
        return <span className="badge badge-warning badge-sm">Parcial</span>;
      case 'pending':
        return <span className="badge badge-error badge-sm">Pendente</span>;
      default:
        return <span className="badge badge-error badge-sm">Pendente</span>;
    }
  };

  const DebtItem = ({ debt }: { debt: Debt }) => {
    const person = state.people.find(p => p.id === debt.person_id);
    const pending = debt.amount - debt.paid_amount;
    
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-all duration-200 border border-base-300 gap-2 sm:gap-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-base-300 rounded-full">
            {person && (
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${person.color} flex items-center justify-center text-white font-bold text-xs sm:text-sm`}>
                {person.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-base-content text-sm sm:text-base">
              {debt.description}
            </h4>
            <p className="text-xs sm:text-sm text-base-content/60">
              {person?.name} • {format(new Date(debt.date), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
              {getStatusBadge(debt.status)}
              {debt.due_date && (
                <span className="badge badge-outline badge-xs sm:badge-sm">
                  Vence: {format(new Date(debt.due_date), 'dd/MM', { locale: ptBR })}
                </span>
              )}
              {debt.installments && debt.total_installments && debt.total_installments > 1 && (
                <span className="badge badge-info badge-xs sm:badge-sm">
                  {debt.installments}/{debt.total_installments}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="flex items-center space-x-2">
              {getStatusIcon(debt.status)}
              <div>
                <span className="font-bold text-lg text-base-content">
                  R$ {pending.toFixed(2)}
                </span>
                <p className="text-xs text-base-content/60">
                  de R$ {debt.amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          {(onEditDebt || onDeleteDebt) && (
            <div className="flex items-center space-x-1">
              {onEditDebt && (
                <button
                  onClick={() => onEditDebt(debt)}
                  className="btn btn-ghost btn-sm text-primary hover:bg-primary hover:text-primary-content transition-all duration-200"
                  title="Editar dívida"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              
              {onDeleteDebt && (
                <button
                  onClick={() => onDeleteDebt(debt.id)}
                  disabled={deletingDebtId === debt.id}
                  className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-error-content transition-all duration-200"
                  title="Deletar dívida"
                >
                  {deletingDebtId === debt.id ? (
                    <div className="loading loading-spinner loading-sm"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="card bg-base-100 shadow-xl border border-base-300 transition-all duration-300">
        <div className="card-body">
          <h3 className="card-title text-base-content">{title}</h3>
          <div className="divider"></div>
          
          {displayDebts.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              <p>Nenhuma dívida encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayDebts.map((debt) => (
                <DebtItem key={debt.id} debt={debt} />
              ))}
            </div>
          )}
          
          {!showAll && debts.length > 5 && (
            <div className="text-center mt-4">
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setIsModalOpen(true)}
              >
                Ver todas as dívidas ({debts.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para todas as dívidas */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl bg-base-100 border border-base-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-base-content">
                📋 Todas as Dívidas ({debts.length})
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="btn btn-ghost btn-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {debts.length === 0 ? (
                <div className="text-center py-8 text-base-content/50">
                  <p>Nenhuma dívida encontrada</p>
                </div>
              ) : (
                debts.map((debt) => (
                  <DebtItem key={debt.id} debt={debt} />
                ))
              )}
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-primary"
                onClick={() => setIsModalOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DebtList; 