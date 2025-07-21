import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { Transaction } from '../types';
import MonthlyNavigation from './MonthlyNavigation';
import SummaryCards from './SummaryCards';
import TransactionList from './TransactionList';
import ExpenseChart from './ExpenseChart';
import GoalsSection from './GoalsSection';
import TransactionModal from './TransactionModal';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state, deleteTransaction } = useFinancial();
  const [activeTab, setActiveTab] = useState('overview');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);

  const currentMonthData = state.monthlyData.find(
    month => `${month.year}-${month.month.padStart(2, '0')}` === state.currentMonth
  );

  // Corrigir o nome do mês exibido no título para refletir o mês das transações carregadas
  let currentMonthName = '';
  if (currentMonthData) {
    // Usa o mês/ano do currentMonthData
    const monthNum = parseInt(currentMonthData.month);
    const yearNum = currentMonthData.year;
    // Cria uma data usando o mês e ano do currentMonthData
    const date = new Date(yearNum, monthNum - 1, 1);
    currentMonthName = format(date, 'MMMM yyyy', { locale: ptBR });
  } else {
    // Fallback para o state.currentMonth - usar forma explícita para evitar problemas de timezone
    const [year, month] = state.currentMonth.split('-');
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    currentMonthName = format(currentDate, 'MMMM yyyy', { locale: ptBR });
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta transação?')) {
      setDeletingTransactionId(transactionId);
      try {
        await deleteTransaction(transactionId);
      } catch (error) {
        console.error('Erro ao deletar transação:', error);
      } finally {
        setDeletingTransactionId(null);
      }
    }
  };

  return (
    <div className="space-y-0">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 bg-base-100 border-b border-base-300 gap-4 sm:gap-0">
        <div>
          <h2 className="text-lg sm:text-3xl font-bold text-base-content break-words">
            💰 Dashboard Financeiro - {currentMonthName}
          </h2>
          <p className="text-base-content/60 mt-2">
            Controle suas receitas, despesas e metas financeiras
          </p>
        </div>
        <button
          onClick={() => setIsTransactionModalOpen(true)}
          className="btn btn-primary gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Transação
        </button>
      </div>

      {/* Monthly Navigation */}
      <MonthlyNavigation />

      {/* Main Content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Summary Cards */}
        <SummaryCards currentMonthData={currentMonthData} />

        {/* Tabs Navigation */}
        <div className="tabs tabs-boxed bg-base-200 p-1 flex flex-wrap overflow-x-auto text-xs sm:text-base">
          <button
            className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Visão Geral
          </button>
          <button
            className={`tab ${activeTab === 'income' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('income')}
          >
            Receitas
          </button>
          <button
            className={`tab ${activeTab === 'expenses' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            Despesas
          </button>
          <button
            className={`tab ${activeTab === 'goals' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            Metas
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              <div className="space-y-6">
                <TransactionList
                  transactions={currentMonthData?.transactions || []}
                  title="Transações Recentes"
                  showAll={false}
                  onEditTransaction={handleEditTransaction}
                />
                <GoalsSection />
              </div>
              <div className="space-y-6">
                <ExpenseChart transactions={currentMonthData?.transactions || []} />
              </div>
            </div>
          )}

          {activeTab === 'income' && (
            <div className="space-y-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">💰 Receitas do Mês</h3>
                  <div className="divider"></div>
                  
                  {/* Resumo das Receitas */}
                  <div className="stats stats-horizontal shadow mb-6">
                    <div className="stat">
                      <div className="stat-title">Total de Receitas</div>
                      <div className="stat-value text-success">
                        R$ {currentMonthData?.transactions
                          .filter(t => t.type === 'income')
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toFixed(2) || '0,00'}
                      </div>
                      <div className="stat-desc">
                        {currentMonthData?.transactions.filter(t => t.type === 'income').length || 0} transações
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentMonthData?.transactions
                      .filter(t => t.type === 'income')
                      .map(transaction => (
                        <div key={transaction.id} className="card bg-base-200 border border-base-300 hover:bg-base-300 transition-all duration-200">
                          <div className="card-body p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start space-x-3">
                                <div className="flex items-center justify-center w-12 h-12 bg-success/20 rounded-full">
                                  <span className="text-2xl">💰</span>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-base-content">
                                    {transaction.description}
                                  </h4>
                                  <p className="text-sm text-base-content/60">
                                    {format(parseISO(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <span className="badge badge-outline badge-sm">
                                      {transaction.category}
                                    </span>
                                    {transaction.is_recurring && (
                                      <span className="badge badge-success badge-sm">Recorrente</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg text-success">
                                  +R$ {transaction.amount.toFixed(2)}
                                </p>
                                <div className="flex items-center justify-end space-x-1 mt-2">
                                  <button
                                    onClick={() => handleEditTransaction(transaction)}
                                    className="btn btn-ghost btn-xs text-primary hover:bg-primary hover:text-primary-content transition-all duration-200"
                                    title="Editar receita"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteTransaction(transaction.id)}
                                    disabled={deletingTransactionId === transaction.id}
                                    className="btn btn-ghost btn-xs text-error hover:bg-error hover:text-error-content transition-all duration-200"
                                    title="Deletar receita"
                                  >
                                    {deletingTransactionId === transaction.id ? (
                                      <div className="loading loading-spinner loading-xs"></div>
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    {currentMonthData?.transactions.filter(t => t.type === 'income').length === 0 && (
                      <div className="text-center py-12 text-base-content/50">
                        <div className="w-16 h-16 bg-base-300 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">💰</span>
                        </div>
                        <h4 className="text-lg font-semibold mb-2">Nenhuma receita registrada</h4>
                        <p className="text-sm">Adicione suas receitas para começar a controlar seus ganhos</p>
                        <button
                          onClick={() => setIsTransactionModalOpen(true)}
                          className="btn btn-primary btn-sm mt-4 gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Receita
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">💰 Despesas do Mês</h3>
                  <div className="divider"></div>
                  <div className="space-y-4">
                    {currentMonthData?.transactions
                      .filter(t => t.type === 'expense')
                      .map(transaction => (
                        <div key={transaction.id} className="card bg-base-200">
                          <div className="card-body p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{transaction.description}</h4>
                                <p className="text-sm text-gray-600">
                                  {format(parseISO(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="badge badge-outline badge-sm">
                                    {transaction.category}
                                  </span>
                                  {transaction.is_recurring && (
                                    <span className="badge badge-success badge-sm">Recorrente</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg text-error">
                                  -R$ {transaction.amount.toFixed(2)}
                                </p>
                                <div className="flex items-center justify-end space-x-1 mt-2">
                                  <button
                                    onClick={() => handleEditTransaction(transaction)}
                                    className="btn btn-ghost btn-xs text-primary hover:bg-primary hover:text-primary-content transition-all duration-200"
                                    title="Editar despesa"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteTransaction(transaction.id)}
                                    disabled={deletingTransactionId === transaction.id}
                                    className="btn btn-ghost btn-xs text-error hover:bg-error hover:text-error-content transition-all duration-200"
                                    title="Deletar despesa"
                                  >
                                    {deletingTransactionId === transaction.id ? (
                                      <div className="loading loading-spinner loading-xs"></div>
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    {currentMonthData?.transactions.filter(t => t.type === 'expense').length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Nenhuma despesa encontrada</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <GoalsSection />
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseModal}
        editingTransaction={editingTransaction}
      />
    </div>
  );
};

export default Dashboard; 