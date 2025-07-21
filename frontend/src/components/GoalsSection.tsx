import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { FinancialGoal } from '../types';
import { Target, Plus, Trash2 } from 'lucide-react';

const GoalsSection: React.FC = () => {
  const { state, dispatch } = useFinancial();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: '',
    description: '',
  });

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.targetAmount > 0) {
      const goal: FinancialGoal = {
        id: Date.now().toString(),
        title: newGoal.title,
        targetAmount: newGoal.targetAmount,
        currentAmount: newGoal.currentAmount,
        deadline: newGoal.deadline,
        description: newGoal.description,
      };

      dispatch({ type: 'ADD_GOAL', payload: goal });
      setNewGoal({
        title: '',
        targetAmount: 0,
        currentAmount: 0,
        deadline: '',
        description: '',
      });
      setIsAddingGoal(false);
    }
  };

  const calculateProgress = (goal: FinancialGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 transition-all duration-300">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h3 className="card-title text-base-content">🎯 Metas Financeiras</h3>
          <button
            onClick={() => setIsAddingGoal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Meta
          </button>
        </div>
        <div className="divider"></div>

        {state.goals.length === 0 ? (
          <div className="text-center py-8 text-base-content/50">
            <Target className="w-12 h-12 mx-auto mb-4 text-base-content/30" />
            <p>Nenhuma meta definida</p>
            <p className="text-sm">Clique em "Nova Meta" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {state.goals.map((goal) => {
              const progress = calculateProgress(goal);
              const progressColor = progress >= 100 ? 'bg-success' : 'bg-primary';

              return (
                <div key={goal.id} className="card bg-base-200 border border-base-300 transition-all duration-300">
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-base-content">{goal.title}</h4>
                        {goal.description && (
                          <p className="text-sm text-base-content/60">{goal.description}</p>
                        )}
                        <p className="text-sm text-base-content/50">
                          Prazo: {goal.deadline}
                        </p>
                      </div>
                      <button className="btn btn-ghost btn-sm text-error hover:bg-error/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-base-content/70">Progresso</span>
                        <span className="font-semibold text-base-content">
                          R$ {goal.currentAmount.toFixed(2)} / R$ {goal.targetAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-base-300 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${progressColor} transition-all duration-300`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-sm font-semibold text-base-content">
                        {progress.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal para adicionar meta */}
        {isAddingGoal && (
          <div className="modal modal-open">
            <div className="modal-box bg-base-100 border border-base-300">
              <h3 className="font-bold text-lg mb-4 text-base-content">Nova Meta Financeira</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text text-base-content">Título da Meta</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Viagem para Europa"
                    className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text text-base-content">Valor Alvo</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0,00"
                      className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text text-base-content">Valor Atual</span>
                    </label>
                    <input
                      type="number"
                      placeholder="0,00"
                      className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                      value={newGoal.currentAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, currentAmount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text text-base-content">Prazo</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text text-base-content">Descrição (opcional)</span>
                  </label>
                  <textarea
                    placeholder="Descreva sua meta..."
                    className="textarea textarea-bordered w-full bg-base-200 border-base-300 text-base-content"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => setIsAddingGoal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddGoal}
                >
                  Adicionar Meta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsSection; 