import React, { useState, useEffect } from 'react';
import { useDebt } from '../../context/DebtContext';
import { useFinancial } from '../../context/FinancialContext';
import { Debt } from '../../types';
import { X, Upload } from 'lucide-react';
import { FinancialService } from '../../services/api';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDebt?: Debt | null;
}

const DebtModal: React.FC<DebtModalProps> = ({ isOpen, onClose, editingDebt }) => {
  const { state, createDebt, updateDebt } = useDebt();
  const { state: financialState, dispatch: financialDispatch } = useFinancial();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    person_id: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    due_date: '',
    status: 'pending' as 'pending' | 'partial' | 'paid',
    paid_amount: 0,
    notes: '',
    receipt: '',
    total_installments: 1,
    payment_method_id: '',
  });

  // Carregar formas de pagamento quando o modal é aberto
  useEffect(() => {
    if (isOpen) {
      const loadPaymentMethods = async () => {
        try {
          setIsLoading(true);
          const result = await FinancialService.getPaymentMethods();
          const methods = Array.isArray(result) ? result : (result?.data || []);
          financialDispatch({ type: 'LOAD_PAYMENT_METHODS', payload: methods });
        } catch (error) {
          console.warn('Erro ao carregar formas de pagamento:', error);
        } finally {
          setIsLoading(false);
        }
      };

      // Só carrega se não tiver dados ou se estiver vazio
      if (!Array.isArray(financialState.paymentMethods) || financialState.paymentMethods.length === 0) {
        loadPaymentMethods();
      }
    }
  }, [isOpen, financialState.paymentMethods.length, financialDispatch]);

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (editingDebt) {
      setFormData({
        person_id: editingDebt.person_id,
        description: editingDebt.description,
        amount: editingDebt.amount,
        date: editingDebt.date.slice(0, 10),
        due_date: editingDebt.due_date?.slice(0, 10) || '',
        status: editingDebt.status,
        paid_amount: editingDebt.paid_amount,
        notes: editingDebt.notes || '',
        receipt: editingDebt.receipt || '',
        total_installments: editingDebt.total_installments || 1,
        payment_method_id: editingDebt.payment_method_id || '',
      });
    } else {
      // Reset form when creating new debt
      setFormData({
        person_id: '',
        description: '',
        amount: 0,
        date: new Date().toISOString().slice(0, 10),
        due_date: '',
        status: 'pending',
        paid_amount: 0,
        notes: '',
        receipt: '',
        total_installments: 1,
        payment_method_id: '',
      });
    }
  }, [editingDebt, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.person_id || !formData.description || formData.amount <= 0) {
      console.error('Campos obrigatórios não preenchidos');
      return;
    }

    // Validação específica para pagamento parcial
    if (formData.status === 'partial' && formData.paid_amount <= 0) {
      console.error('Para pagamento parcial, informe o valor pago');
      return;
    }

    // Validação para valor pago não pode ser maior que o valor total
    if (formData.paid_amount > formData.amount) {
      console.error('Valor pago não pode ser maior que o valor total');
      return;
    }

    const debt = {
      person_id: formData.person_id,
      description: formData.description,
      amount: formData.amount,
      date: formData.date,
      due_date: formData.due_date || undefined,
      status: formData.status,
      paid_amount: formData.paid_amount,
      notes: formData.notes || undefined,
      receipt: formData.receipt || undefined,
      total_installments: formData.total_installments > 1 ? formData.total_installments : undefined,
      payment_method_id: formData.payment_method_id || undefined,
    };

    try {
      if (editingDebt) {
        await updateDebt(editingDebt.id, debt);
      } else {
        await createDebt(debt);
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar dívida:', error);
    }
  };

  const handlePaidAmountChange = (value: number) => {
    setFormData({ ...formData, paid_amount: value });
    
    // Auto-update status based on paid amount
    if (value >= formData.amount) {
      setFormData(prev => ({ ...prev, status: 'paid' }));
    } else if (value > 0) {
      setFormData(prev => ({ ...prev, status: 'partial' }));
    } else {
      setFormData(prev => ({ ...prev, status: 'pending' }));
    }
  };

  const handleStatusChange = (status: 'pending' | 'partial' | 'paid') => {
    let newPaidAmount = formData.paid_amount;
    
    // Se o status for "paid", definir paid_amount como o valor total
    if (status === 'paid') {
      newPaidAmount = formData.amount;
    } else if (status === 'pending') {
      newPaidAmount = 0;
    }
    // Se for "partial", manter o valor atual ou exigir que o usuário informe
    
    setFormData({ ...formData, status, paid_amount: newPaidAmount });
  };

  const handleAmountChange = (amount: number) => {
    setFormData({ ...formData, amount });
    
    // Se o status for "paid", atualizar o paid_amount para o novo valor
    if (formData.status === 'paid') {
      setFormData(prev => ({ ...prev, paid_amount: amount }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl bg-base-100 border border-base-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-base-content">
            {editingDebt ? '✏️ Editar Dívida' : '➕ Nova Dívida'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
            <span className="ml-2">Carregando formas de pagamento...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pessoa */}
          <div>
            <label className="label">
              <span className="label-text text-base-content">Pessoa</span>
            </label>
            <select
              className="select select-bordered w-full bg-base-200 border-base-300 text-base-content"
              value={formData.person_id}
              onChange={(e) => setFormData({ ...formData, person_id: e.target.value })}
              required
            >
              <option value="">Selecione uma pessoa</option>
              {state.people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} ({person.relationship})
                </option>
              ))}
            </select>
          </div>

          {/* Descrição e Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text text-base-content">Descrição</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Empréstimo, Almoço, Uber..."
                className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text text-base-content">Valor</span>
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                value={formData.amount}
                onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Parcelamento */}
          <div>
            <label className="label">
              <span className="label-text text-base-content">Parcelamento</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text text-base-content text-sm">Total de Parcelas</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  placeholder="1"
                  className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                  value={formData.total_installments}
                  onChange={(e) => setFormData({ ...formData, total_installments: parseInt(e.target.value) || 1 })}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Deixe como 1 para dívida única
                  </span>
                </label>
              </div>
              
              <div className="flex items-end">
                <div className="card bg-base-200 p-3 w-full">
                  <div className="text-sm text-base-content/70">
                    Valor por parcela:
                  </div>
                  <div className="text-lg font-bold text-base-content">
                    R$ {(formData.amount / formData.total_installments).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data e Vencimento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text text-base-content">Data</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text text-base-content">Data de Vencimento (opcional)</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          {/* Status e Valor Pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text text-base-content">Status</span>
              </label>
              <select
                className="select select-bordered w-full bg-base-200 border-base-300 text-base-content"
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value as 'pending' | 'partial' | 'paid')}
              >
                <option value="pending">Pendente</option>
                <option value="partial">Parcial</option>
                <option value="paid">Pago</option>
              </select>
            </div>
            
            <div>
              <label className="label">
                <span className="label-text text-base-content">
                  Valor Pago
                  {formData.status === 'partial' && <span className="text-error"> *</span>}
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                placeholder={formData.status === 'paid' ? 'Valor total automaticamente definido' : '0,00'}
                className={`input input-bordered w-full bg-base-200 border-base-300 text-base-content ${
                  formData.status === 'partial' && formData.paid_amount <= 0 ? 'input-error' : ''
                }`}
                value={formData.paid_amount}
                onChange={(e) => handlePaidAmountChange(parseFloat(e.target.value) || 0)}
                disabled={formData.status === 'paid'}
                required={formData.status === 'partial'}
              />
              {formData.status === 'partial' && formData.paid_amount <= 0 && (
                <label className="label">
                  <span className="label-text-alt text-error">Informe o valor pago para pagamento parcial</span>
                </label>
              )}
              {formData.status === 'paid' && (
                <label className="label">
                  <span className="label-text-alt text-success">Valor total automaticamente definido</span>
                </label>
              )}
            </div>
          </div>

          {/* Forma de Pagamento (opcional) */}
          <div>
            <label className="label">
              <span className="label-text text-base-content">Forma de Pagamento (opcional)</span>
            </label>
            <select
              className="select select-bordered w-full bg-base-200 border-base-300"
              value={formData.payment_method_id || ''}
              onChange={e => setFormData({ ...formData, payment_method_id: e.target.value })}
              disabled={!Array.isArray(financialState.paymentMethods) || financialState.paymentMethods.length === 0}
            >
              <option value="">{!Array.isArray(financialState.paymentMethods) || financialState.paymentMethods.length === 0 ? 'Nenhuma forma de pagamento cadastrada' : 'Selecione uma forma de pagamento (opcional)'}</option>
              {(Array.isArray(financialState.paymentMethods) ? financialState.paymentMethods : []).map((method: any) => (
                <option key={method.id} value={method.id}>{method.name}</option>
              ))}
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="label">
              <span className="label-text text-base-content">Observações (opcional)</span>
            </label>
            <textarea
              placeholder="Observações sobre a dívida..."
              className="textarea textarea-bordered w-full bg-base-200 border-base-300 text-base-content"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Comprovante */}
          <div>
            <label className="label">
              <span className="label-text text-base-content">Comprovante (opcional)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                className="file-input file-input-bordered w-full bg-base-200 border-base-300"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setFormData({ ...formData, receipt: e.target?.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <Upload className="w-5 h-5 text-base-content/50" />
            </div>
          </div>

          {/* Botões */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {editingDebt ? 'Atualizar Dívida' : 'Adicionar Dívida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DebtModal; 