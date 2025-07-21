import React, { useState, useEffect } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { Transaction } from '../types';
import { X, Upload } from 'lucide-react';
import { FinancialService } from '../services/api';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, editingTransaction }) => {
  const { state, createTransaction, updateTransaction, dispatch } = useFinancial();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    is_recurring: false,
    isInstallment: false,
    installments: '',
    total_installments: '',
    due_date: '',
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
          dispatch({ type: 'LOAD_PAYMENT_METHODS', payload: methods });
        } catch (error) {
          console.warn('Erro ao carregar formas de pagamento:', error);
        } finally {
          setIsLoading(false);
        }
      };

      // Só carrega se não tiver dados ou se estiver vazio
      if (!Array.isArray(state.paymentMethods) || state.paymentMethods.length === 0) {
        loadPaymentMethods();
      }
    }
  }, [isOpen, state.paymentMethods.length, dispatch]);

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        description: editingTransaction.description,
        amount: editingTransaction.amount,
        type: editingTransaction.type,
        category: editingTransaction.category,
        date: editingTransaction.date.slice(0, 10),
        is_recurring: editingTransaction.is_recurring || false,
        isInstallment: !!(editingTransaction.installments && editingTransaction.total_installments),
        installments: editingTransaction.installments?.toString() || '',
        total_installments: editingTransaction.total_installments?.toString() || '',
        due_date: editingTransaction.due_date?.slice(0, 10) || '',
        payment_method_id: editingTransaction.payment_method_id || '',
      });
    } else {
      // Reset form when creating new transaction
      setFormData({
        description: '',
        amount: 0,
        type: 'expense',
        category: '',
        date: new Date().toISOString().slice(0, 10),
        is_recurring: false,
        isInstallment: false,
        installments: '',
        total_installments: '',
        due_date: '',
        payment_method_id: '',
      });
    }
  }, [editingTransaction, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || formData.amount <= 0 || !formData.type || !formData.category || !formData.date) return;
    
    let transaction: any = {
      description: formData.description,
      amount: formData.amount,
      type: formData.type,
      category: formData.category,
      date: formData.date,
    };
    
    if (formData.type === 'expense') {
      transaction.payment_method_id = formData.payment_method_id;
    }
    
    if (formData.is_recurring) {
      transaction.is_recurring = true;
    }
    
    if (formData.isInstallment) {
      if (
        !formData.installments ||
        !formData.total_installments ||
        parseInt(formData.installments) <= 0 ||
        parseInt(formData.total_installments) <= 0 ||
        parseInt(formData.installments) > parseInt(formData.total_installments)
      ) {
        // Validação de parcelamento
        return;
      }
      transaction.installments = parseInt(formData.installments);
      transaction.total_installments = parseInt(formData.total_installments);
      if (formData.due_date) transaction.due_date = formData.due_date;
    }

    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, transaction);
    } else {
      await createTransaction(transaction);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl bg-base-100 border border-base-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-base-content">
            {editingTransaction ? '✏️ Editar Transação' : '➕ Nova Transação'}
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
          {/* Tipo de Transação */}
          <div className="flex gap-4">
            <label className="flex-1">
              <input
                type="radio"
                name="type"
                value="expense"
                checked={formData.type === 'expense'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'expense' })}
                className="peer hidden"
              />
              <div className="card bg-base-200 peer-checked:bg-error peer-checked:text-error-content cursor-pointer border border-base-300 transition-all duration-200">
                <div className="card-body p-4 text-center">
                  <span className="text-2xl">💸</span>
                  <span className="font-semibold">Despesa</span>
                </div>
              </div>
            </label>
            
            <label className="flex-1">
              <input
                type="radio"
                name="type"
                value="income"
                checked={formData.type === 'income'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' })}
                className="peer hidden"
              />
              <div className="card bg-base-200 peer-checked:bg-success peer-checked:text-success-content cursor-pointer border border-base-300 transition-all duration-200">
                <div className="card-body p-4 text-center">
                  <span className="text-2xl">💰</span>
                  <span className="font-semibold">Receita</span>
                </div>
              </div>
            </label>
          </div>

          {/* Descrição e Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text text-base-content">Descrição</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Aluguel, Salário, Compras..."
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
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          {/* Forma de Pagamento */}
          {formData.type === 'expense' && (
            <div>
              <label className="label">
                <span className="label-text text-base-content">Forma de Pagamento</span>
              </label>
              <select
                className="select select-bordered w-full bg-base-200 border-base-300"
                value={formData.payment_method_id || ''}
                onChange={e => setFormData({ ...formData, payment_method_id: e.target.value })}
                required
              >
                <option value="" disabled>Selecione uma forma de pagamento</option>
                {(Array.isArray(state.paymentMethods) ? state.paymentMethods : []).map((method) => (
                  <option key={method.id} value={method.id}>{method.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Categoria e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text text-base-content">Categoria</span>
              </label>
              <select
                className="select select-bordered w-full bg-base-200 border-base-300"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="" disabled>Selecione uma categoria</option>
                {state.categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
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
          </div>

          {/* Opções Especiais */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={formData.is_recurring}
                  onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                />
                <span className="label-text ml-2 text-base-content">Gasto Recorrente (repete todo mês)</span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={formData.isInstallment}
                  onChange={(e) => setFormData({ ...formData, isInstallment: e.target.checked })}
                />
                <span className="label-text ml-2 text-base-content">Parcelada</span>
              </label>
            </div>
            {formData.isInstallment && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="label">
                    <span className="label-text text-base-content">Parcela Atual</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                    value={formData.installments}
                    onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text text-base-content">Total de Parcelas</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                    value={formData.total_installments}
                    onChange={(e) => setFormData({ ...formData, total_installments: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="label">
                    <span className="label-text text-base-content">Data de Vencimento</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>
            )}
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
                      // setFormData({ ...formData, receipt: e.target?.result as string }); // Removed receipt from state
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
              {editingTransaction ? 'Atualizar Transação' : 'Adicionar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal; 