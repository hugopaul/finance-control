import React, { useState, useMemo } from 'react';
import { useDebt } from '../context/DebtContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Users, AlertCircle, CheckCircle, Plus, UserPlus, Edit, Trash2 } from 'lucide-react';
import DebtSummaryCards from './debt/DebtSummaryCards';
import DebtList from './debt/DebtList';
import DebtInstallmentsList from './debt/DebtInstallmentsList';
import DebtPersonSummary from './debt/DebtPersonSummary';
import PeopleList from './debt/PeopleList';
import DebtModal from './debt/DebtModal';
import PersonModal from './debt/PersonModal';
import MonthlyNavigation from './MonthlyNavigation';

const DebtDashboard: React.FC = () => {
  const { state, deleteDebt, deletePerson } = useDebt();
  const [activeTab, setActiveTab] = useState('overview');
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<any>(null);
  const [editingPerson, setEditingPerson] = useState<any>(null);
  const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null);
  const [deletingPersonId, setDeletingPersonId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ open: boolean; type: 'debt' | 'person' | null; id: string | null }>({ open: false, type: null, id: null });

  const currentMonthData = useMemo(() => 
    state.monthlyDebtData.find(
      month => `${month.year}-${month.month.padStart(2, '0')}` === state.currentMonth
    ), [state.monthlyDebtData, state.currentMonth]
  );

  const currentMonthName = useMemo(() => {
    const [year, month] = state.currentMonth.split('-');
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(currentDate, 'MMMM yyyy', { locale: ptBR });
  }, [state.currentMonth]);

  const handleEditDebt = (debt: any) => {
    setEditingDebt(debt);
    setIsDebtModalOpen(true);
  };

  const handleEditPerson = (person: any) => {
    setEditingPerson(person);
    setIsPersonModalOpen(true);
  };

  const handleCloseDebtModal = () => {
    setIsDebtModalOpen(false);
    setEditingDebt(null);
  };

  const handleClosePersonModal = () => {
    setIsPersonModalOpen(false);
    setEditingPerson(null);
  };

  const handleDeleteDebt = (debtId: string) => {
    setShowConfirm({ open: true, type: 'debt', id: debtId });
  };

  const handleDeletePerson = (personId: string) => {
    setShowConfirm({ open: true, type: 'person', id: personId });
  };

  const confirmDelete = async () => {
    if (!showConfirm.id || !showConfirm.type) return;
    if (showConfirm.type === 'debt') {
      setDeletingDebtId(showConfirm.id);
      try {
        await deleteDebt(showConfirm.id);
      } catch (error) {
        console.error('Erro ao deletar dívida:', error);
      } finally {
        setDeletingDebtId(null);
      }
    } else if (showConfirm.type === 'person') {
      setDeletingPersonId(showConfirm.id);
      try {
        await deletePerson(showConfirm.id);
      } catch (error) {
        console.error('Erro ao deletar pessoa:', error);
      } finally {
        setDeletingPersonId(null);
      }
    }
    setShowConfirm({ open: false, type: null, id: null });
  };

  return (
    <div className="space-y-0">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 bg-base-100 border-b border-base-300 gap-4 sm:gap-0">
        <div>
          <h2 className="text-lg sm:text-3xl font-bold text-base-content break-words">
            👥 Controle de Dívidas - {currentMonthName}
          </h2>
          <p className="text-base-content/60 mt-2">
            Gerencie dívidas de amigos e familiares
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
          <button
            onClick={() => setIsPersonModalOpen(true)}
            className="btn btn-outline gap-2 w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4" />
            Nova Pessoa
          </button>
          <button
            onClick={() => setIsDebtModalOpen(true)}
            className="btn btn-primary gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Nova Dívida
          </button>
        </div>
      </div>

      {/* Monthly Navigation */}
      <MonthlyNavigation context="debt" />

      {/* Main Content */}
      <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
        {/* Summary Cards */}
        <DebtSummaryCards currentMonthData={currentMonthData} />

        {/* Tabs Navigation */}
        <div className="tabs tabs-boxed bg-base-200 p-1 flex flex-wrap overflow-x-auto text-xs sm:text-base">
          <button
            className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Visão Geral
          </button>
          <button
            className={`tab ${activeTab === 'debts' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('debts')}
          >
            Dívidas
          </button>
          <button
            className={`tab ${activeTab === 'people' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('people')}
          >
            Pessoas
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              <div className="space-y-6">
                <DebtList
                  debts={currentMonthData?.debts || []}
                  title="Dívidas Recentes"
                  showAll={false}
                  onEditDebt={handleEditDebt}
                  onDeleteDebt={handleDeleteDebt}
                  deletingDebtId={deletingDebtId}
                />
                <div className="card bg-base-100 shadow-xl border border-base-300">
                  <div className="card-body">
                    <h3 className="card-title text-base-content">
                      <Users className="w-5 h-5" />
                      Resumo por Pessoa
                    </h3>
                    <div className="divider"></div>
                    <div className="space-y-6">
                      {state.people.length > 0 ? (
                        state.people.map(person => (
                          <DebtPersonSummary
                            key={person.id}
                            person={person}
                            debts={currentMonthData?.debts || []}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8 text-base-content/50">
                          <Users className="w-12 h-12 mx-auto mb-4 text-base-content/30" />
                          <h4 className="text-lg font-semibold mb-2">Nenhuma pessoa cadastrada</h4>
                          <p className="text-sm">Adicione pessoas para começar a controlar dívidas</p>
                          <button
                            onClick={() => setIsPersonModalOpen(true)}
                            className="btn btn-primary btn-sm mt-4 gap-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            Adicionar Primeira Pessoa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DebtInstallmentsList 
                  debts={currentMonthData?.debts || []}
                  title="Dívidas Parceladas"
                />
              </div>
              <div className="space-y-6">
                <div className="card bg-base-100 shadow-xl border border-base-300">
                  <div className="card-body">
                    <h3 className="card-title text-base-content">
                      <AlertCircle className="w-5 h-5 text-warning" />
                      Dívidas Pendentes
                    </h3>
                    <div className="divider"></div>
                    <div className="space-y-3">
                      {currentMonthData?.debts
                        .filter(debt => debt.status === 'pending' || debt.status === 'partial')
                        .map(debt => {
                          const person = state.people.find(p => p.id === debt.person_id);
                          const pending = debt.amount - debt.paid_amount;
                          
                          return (
                            <div key={debt.id} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20 hover:bg-warning/20 transition-all duration-200">
                              <div>
                                <h4 className="font-semibold text-base-content">{debt.description}</h4>
                                <p className="text-sm text-base-content/60">
                                  {person?.name} • {format(new Date(debt.date), 'dd/MM/yyyy', { locale: ptBR })}
                                </p>
                                {debt.installments && debt.total_installments && debt.total_installments > 1 && (
                                  <p className="text-xs text-base-content/50 mt-1">
                                    Parcela {debt.installments} de {debt.total_installments}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-warning">
                                  R$ {pending.toFixed(2)}
                                </p>
                                <p className="text-xs text-base-content/60">
                                  {debt.status === 'partial' ? 'Parcial' : 'Pendente'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      {currentMonthData?.debts.filter(d => d.status === 'pending' || d.status === 'partial').length === 0 && (
                        <div className="text-center py-8 text-base-content/50">
                          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
                          <h4 className="text-lg font-semibold mb-2">Nenhuma dívida pendente!</h4>
                          <p className="text-sm">Todas as dívidas estão em dia</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'debts' && (
            <DebtList
              debts={currentMonthData?.debts || []}
              title="Todas as Dívidas"
              showAll={true}
              onEditDebt={handleEditDebt}
              onDeleteDebt={handleDeleteDebt}
              deletingDebtId={deletingDebtId}
            />
          )}

          {activeTab === 'people' && (
            <PeopleList
              onEditPerson={handleEditPerson}
              onDeletePerson={handleDeletePerson}
              deletingPersonId={deletingPersonId}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={handleCloseDebtModal}
        editingDebt={editingDebt}
      />
      
      <PersonModal
        isOpen={isPersonModalOpen}
        onClose={handleClosePersonModal}
        editingPerson={editingPerson}
      />

      {/* Modal de confirmação de exclusão */}
      {showConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="modal-box bg-base-100 border border-base-300">
            <h3 className="font-bold text-lg mb-4">Confirmar Exclusão</h3>
            <p>
              {showConfirm.type === 'debt'
                ? 'Tem certeza que deseja excluir esta dívida?'
                : 'Tem certeza que deseja excluir esta pessoa? Todas as dívidas relacionadas também serão removidas.'}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setShowConfirm({ open: false, type: null, id: null })}>Cancelar</button>
              <button className="btn btn-error" onClick={confirmDelete} disabled={deletingDebtId !== null || deletingPersonId !== null}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtDashboard; 