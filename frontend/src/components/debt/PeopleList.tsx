import React from 'react';
import { useDebt } from '../../context/DebtContext';
import { Person } from '../../types';
import { Phone, Mail, Edit, Trash2, UserPlus } from 'lucide-react';

interface PeopleListProps {
  onEditPerson?: (person: Person) => void;
  onDeletePerson?: (personId: string) => void;
  deletingPersonId?: string | null;
}

const PeopleList: React.FC<PeopleListProps> = ({
  onEditPerson,
  onDeletePerson,
  deletingPersonId
}) => {
  const { state } = useDebt();

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case 'amigo':
        return '👥';
      case 'familiar':
        return '👨‍👩‍👧‍👦';
      case 'colega':
        return '💼';
      case 'vizinho':
        return '🏠';
      default:
        return '👤';
    }
  };

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h3 className="card-title text-base-content">👥 Pessoas Cadastradas</h3>
            <button className="btn btn-primary btn-sm gap-2">
              <UserPlus className="w-4 h-4" />
              Nova Pessoa
            </button>
          </div>
          <div className="divider"></div>
          
          {state.people.length === 0 ? (
            <div className="text-center py-12 text-base-content/50">
              <div className="w-16 h-16 bg-base-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-base-content/30" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Nenhuma pessoa cadastrada</h4>
              <p className="text-sm">Adicione pessoas para começar a controlar dívidas</p>
              <button className="btn btn-primary btn-sm mt-4 gap-2">
                <UserPlus className="w-4 h-4" />
                Adicionar Primeira Pessoa
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {state.people.map((person) => (
                <div key={person.id} className="card bg-base-200 border border-base-300 transition-all duration-300 hover:shadow-lg hover:bg-base-300">
                  <div className="card-body p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full ${person.color} flex items-center justify-center text-white font-bold text-base sm:text-lg`}>
                          {person.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-base-content text-sm sm:text-base">{person.name}</h4>
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-base-content/60">
                            <span>{getRelationshipIcon(person.relationship)}</span>
                            <span className="capitalize">{person.relationship}</span>
                          </div>
                        </div>
                      </div>
                      {(onEditPerson || onDeletePerson) && (
                        <div className="flex gap-1">
                          {onEditPerson && (
                            <button
                              onClick={() => onEditPerson(person)}
                              className="btn btn-ghost btn-sm text-primary hover:bg-primary hover:text-primary-content transition-all duration-200"
                              title="Editar pessoa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {onDeletePerson && (
                            <button
                              onClick={() => onDeletePerson(person.id)}
                              disabled={deletingPersonId === person.id}
                              className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-error-content transition-all duration-200"
                              title="Deletar pessoa"
                            >
                              {deletingPersonId === person.id ? (
                                <div className="loading loading-spinner loading-sm"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {person.phone && (
                        <div className="flex items-center gap-2 text-sm text-base-content/70">
                          <Phone className="w-4 h-4" />
                          <span>{person.phone}</span>
                        </div>
                      )}
                      {person.email && (
                        <div className="flex items-center gap-2 text-sm text-base-content/70">
                          <Mail className="w-4 h-4" />
                          <span>{person.email}</span>
                        </div>
                      )}
                      {person.notes && (
                        <div className="text-sm text-base-content/60 mt-2 p-2 bg-base-300 rounded">
                          {person.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeopleList; 