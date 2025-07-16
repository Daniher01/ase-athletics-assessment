// src/components/players/ContractInfo.tsx
import React from 'react';
import { Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Player } from '../../services/playerService';

interface ContractInfoProps {
  player: Player;
}

const ContractInfo: React.FC<ContractInfoProps> = ({ player }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCompactNumber = (num: number): string => {
    return new Intl.NumberFormat('es-ES', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(num);
  };

  // Calcular días hasta el vencimiento del contrato
  const contractEndDate = new Date(player.contractEnd);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((contractEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Determinar el estado del contrato
  const getContractStatus = () => {
    if (daysUntilExpiry <= 0) {
      return { 
        text: 'Vencido', 
        color: 'text-red-600', 
        bgColor: 'bg-red-100',
        icon: AlertCircle
      };
    } else if (daysUntilExpiry <= 180) {
      return { 
        text: 'Próximo a vencer', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-100',
        icon: AlertCircle
      };
    } else {
      return { 
        text: 'Vigente', 
        color: 'text-green-600', 
        bgColor: 'bg-green-100',
        icon: Calendar
      };
    }
  };

  const contractStatus = getContractStatus();

  // Calcular salario anual
  const annualSalary = player.salary * 12;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">
        Información de Contrato
      </h3>

      <div className="space-y-4">
        {/* Estado del contrato */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${contractStatus.bgColor}`}>
              <contractStatus.icon size={20} className={contractStatus.color} />
            </div>
            <div>
              <div className="font-medium text-secondary-900">Estado</div>
              <div className={`text-sm ${contractStatus.color}`}>
                {contractStatus.text}
              </div>
            </div>
          </div>
          {daysUntilExpiry > 0 && (
            <div className="text-right">
              <div className="font-bold text-secondary-900">{daysUntilExpiry}</div>
              <div className="text-xs text-secondary-500">días</div>
            </div>
          )}
        </div>

        {/* Detalles del contrato */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-secondary-600">Vencimiento</span>
            <span className="font-medium text-secondary-900">
              {contractEndDate.toLocaleDateString('es-ES')}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-secondary-600">Salario mensual</span>
            <span className="font-medium text-secondary-900">
              {formatCurrency(player.salary)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-secondary-600">Salario anual</span>
            <span className="font-medium text-secondary-900">
              {formatCompactNumber(annualSalary)}
            </span>
          </div>
        </div>

        {/* Información de mercado */}
        <div className="pt-4 border-t border-secondary-200">
          <h4 className="font-medium text-secondary-900 mb-3">Valor de Mercado</h4>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-100">
                <TrendingUp size={20} className="text-primary-600" />
              </div>
              <div>
                <div className="font-medium text-secondary-900">Valuación actual</div>
                <div className="text-sm text-primary-600">
                  Última actualización: {new Date(player.updatedAt).toLocaleDateString('es-ES')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary-600">
                {formatCompactNumber(player.marketValue)}
              </div>
              <div className="text-xs text-secondary-500">EUR</div>
            </div>
          </div>

          {/* Ratio valor/salario */}
          <div className="mt-3 p-3 rounded-lg bg-secondary-50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondary-600">Ratio Valor/Salario anual</span>
              <span className="font-medium text-secondary-900">
                {(player.marketValue / annualSalary).toFixed(1)}x
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractInfo;