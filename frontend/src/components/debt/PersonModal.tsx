import React, { useState, useEffect } from 'react';
import { useDebt } from '../../context/DebtContext';
import { Person } from '../../types';
import { X } from 'lucide-react';

interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPerson?: Person | null;
}

const PersonModal: React.FC<PersonModalProps> = ({ isOpen, onClose, editingPerson }) => {
  const { createPerson, updatePerson } = useDebt();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: 'amigo',
    color: 'bg-blue-500',
    notes: '',
  });

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (editingPerson) {
      setFormData({
        name: editingPerson.name,
        phone: editingPerson.phone || '',
        email: editingPerson.email || '',
        relationship: editingPerson.relationship,
        color: editingPerson.color,
        notes: editingPerson.notes || '',
      });
    } else {
      // Reset form when creating new person
      setFormData({
        name: '',
        phone: '',
        email: '',
        relationship: 'amigo',
        color: 'bg-blue-500',
        notes: '',
      });
    }
  }, [editingPerson, isOpen]);

  const colorOptions = [
    { name: 'Azul', value: 'bg-blue-500' },
    { name: 'Verde', value: 'bg-green-500' },
    { name: 'Roxo', value: 'bg-purple-500' },
    { name: 'Laranja', value: 'bg-orange-500' },
    { name: 'Rosa', value: 'bg-pink-500' },
    { name: 'Vermelho', value: 'bg-red-500' },
    { name: 'Amarelo', value: 'bg-yellow-500' },
    { name: 'Cinza', value: 'bg-gray-500' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.name) {
      const person = {
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        relationship: formData.relationship,
        color: formData.color,
        notes: formData.notes || undefined,
      };

      try {
        if (editingPerson) {
          await updatePerson(editingPerson.id, person);
        } else {
          await createPerson(person);
        }
        
        onClose();
      } catch (error) {
        console.error('Erro ao salvar pessoa:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-base-100 border border-base-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-base-content">
            {editingPerson ? '✏️ Editar Pessoa' : '👤 Nova Pessoa'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="label">
              <span className="label-text text-base-content">Nome</span>
            </label>
            <input
              type="text"
              placeholder="Nome completo"
              className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Telefone e Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text text-base-content">Telefone</span>
              </label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text text-base-content">Email</span>
              </label>
              <input
                type="email"
                placeholder="email@exemplo.com"
                className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Relacionamento e Cor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text text-base-content">Relacionamento</span>
              </label>
              <select
                className="select select-bordered w-full bg-base-200 border-base-300 text-base-content"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              >
                <option value="amigo">Amigo</option>
                <option value="familiar">Familiar</option>
                <option value="colega">Colega</option>
                <option value="vizinho">Vizinho</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            
            <div>
              <label className="label">
                <span className="label-text text-base-content">Cor</span>
              </label>
              <select
                className="select select-bordered w-full bg-base-200 border-base-300 text-base-content"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              >
                {colorOptions.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="label">
              <span className="label-text text-base-content">Observações</span>
            </label>
            <textarea
              placeholder="Observações sobre a pessoa..."
              className="textarea textarea-bordered w-full bg-base-200 border-base-300 text-base-content"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Preview */}
          <div className="card bg-base-200 p-4">
            <h4 className="font-semibold mb-2 text-base-content">Preview</h4>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${formData.color} flex items-center justify-center text-white font-bold`}>
                {formData.name.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-semibold text-base-content">
                  {formData.name || 'Nome da pessoa'}
                </p>
                <p className="text-sm text-base-content/60 capitalize">
                  {formData.relationship}
                </p>
              </div>
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
              {editingPerson ? 'Atualizar Pessoa' : 'Adicionar Pessoa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonModal; 