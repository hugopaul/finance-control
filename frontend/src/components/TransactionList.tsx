import React, { useState } from 'react';
import { Transaction } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, X, Trash2, Edit } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

interface TransactionListProps {
  transactions: Transaction[];
  title: string;
  showAll?: boolean;
  onEditTransaction?: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  title, 
  showAll = true,
  onEditTransaction
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const { deleteTransaction } = useFinancial();
  const displayTransactions = showAll ? transactions : transactions.slice(0, 5);

  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: string } = {
      'Alimentação': '🍽️',
      'Transporte': '🚗',
      'Moradia': '🏠',
      'Lazer': '🎮',
      'Saúde': '🏥',
      'Educação': '📚',
      'Eletrônicos': '💻',
      'Salário': '💰',
    };
    return categoryIcons[category] || '📄';
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setShowConfirm({ open: true, id: transactionId });
  };

  const confirmDelete = async () => {
    if (!showConfirm.id) return;
    setDeletingTransactionId(showConfirm.id);
      try {
      await deleteTransaction(showConfirm.id);
      } catch (error) {
        console.error('Erro ao deletar transação:', error);
      } finally {
        setDeletingTransactionId(null);
      setShowConfirm({ open: false, id: null });
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    if (onEditTransaction) {
      onEditTransaction(transaction);
    }
  };

  const TransactionItem = ({ transaction }: { transaction: Transaction }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-all duration-200 border border-base-300 gap-2 sm:gap-0">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-base-300 rounded-full">
          <span className="text-base sm:text-lg">{getCategoryIcon(transaction.category)}</span>
        </div>
        <div>
          <h4 className="font-semibold text-base-content text-sm sm:text-base">
            {transaction.description}
          </h4>
          <p className="text-xs sm:text-sm text-base-content/60">
            {format(parseISO(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
          </p>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
            <span className="badge badge-outline badge-xs sm:badge-sm">
              {transaction.category}
            </span>
            {transaction.is_recurring && (
              <span className="badge badge-success badge-xs sm:badge-sm">Recorrente</span>
            )}
            {transaction.installments && transaction.total_installments && (
              <span className="badge badge-primary badge-xs sm:badge-sm">
                Parcela {transaction.installments}/{transaction.total_installments}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="flex items-center space-x-2">
            {transaction.type === 'income' ? (
              <ArrowUpRight className="w-4 h-4 text-success" />
            ) : (
              <ArrowDownLeft className="w-4 h-4 text-error" />
            )}
            <span
              className={`font-bold text-lg ${
                transaction.type === 'income' ? 'text-success' : 'text-error'
              }`}
            >
              {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleEditTransaction(transaction)}
            className="btn btn-ghost btn-sm text-primary hover:bg-primary hover:text-primary-content transition-all duration-200"
            title="Editar transação"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleDeleteTransaction(transaction.id)}
            disabled={deletingTransactionId === transaction.id}
            className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-error-content transition-all duration-200"
            title="Deletar transação"
          >
            {deletingTransactionId === transaction.id ? (
              <div className="loading loading-spinner loading-sm"></div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="card bg-base-100 shadow-xl border border-base-300 transition-all duration-300">
        <div className="card-body">
          <h3 className="card-title text-base-content">{title}</h3>
          <div className="divider"></div>
          
          {displayTransactions.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              <p>Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
          
          {!showAll && transactions.length > 5 && (
            <div className="text-center mt-4">
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setIsModalOpen(true)}
              >
                Ver todas as transações ({transactions.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para todas as transações */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl bg-base-100 border border-base-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-base-content">
                📋 Todas as Transações ({transactions.length})
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="btn btn-ghost btn-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-base-content/50">
                  <p>Nenhuma transação encontrada</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
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

      {/* Modal de confirmação de exclusão */}
      {showConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="modal-box bg-base-100 border border-base-300">
            <h3 className="font-bold text-lg mb-4">Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir esta transação?</p>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setShowConfirm({ open: false, id: null })}>Cancelar</button>
              <button className="btn btn-error" onClick={confirmDelete} disabled={deletingTransactionId !== null}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionList; 