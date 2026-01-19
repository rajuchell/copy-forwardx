import React from 'react';
import { Plus, Minus, CheckSquare, Square, CheckCircle2, Info, CreditCard, Repeat } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServiceCardProps {
  service: ServiceItem;
  pendingQuantity: number;
  savedQuantity: number;
  onToggle: (service: ServiceItem) => void;
  onUpdatePendingQty: (id: string, delta: number) => void;
  recommended?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  pendingQuantity,
  savedQuantity,
  onToggle, 
  onUpdatePendingQty,
  recommended, 
}) => {
  const isSelected = pendingQuantity > 0;

  const handleManualQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.target.value);
    if (!isNaN(newVal) && newVal >= 1) {
       const delta = newVal - pendingQuantity;
       onUpdatePendingQty(service.id, delta);
    }
  };

  return (
    <div className={`relative bg-white border rounded-lg transition-all p-4 flex flex-col justify-between h-full hover:shadow-md ${isSelected ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/20' : 'border-gray-200'} ${recommended ? 'ring-2 ring-indigo-400 border-indigo-400 bg-indigo-50/30' : ''}`}>
      {recommended && (
        <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm z-10">
          AI Recommended
        </div>
      )}

      {savedQuantity > 0 && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold">
           <CheckCircle2 size={12} /> In Proposal: {savedQuantity}
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3 gap-3 mt-2">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight">{service.name}</h3>
          <p className="text-gray-500 text-[10px] uppercase font-bold mt-1 tracking-wider">{service.subcategory}</p>
        </div>
        <div className="text-right flex-shrink-0">
           {service.price > 0 && (
             <span className="block font-bold text-gray-900 text-lg">₹{service.price.toLocaleString()}</span>
           )}
           {service.monthlyPrice && service.monthlyPrice > 0 && (
             <span className="block font-bold text-indigo-600 text-sm flex items-center justify-end gap-1">
               <Repeat size={12} /> ₹{service.monthlyPrice.toLocaleString()}/mo
             </span>
           )}
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex flex-wrap gap-2 mb-2">
           {service.price > 0 && <span className="bg-gray-100 text-gray-600 text-[9px] px-2 py-0.5 rounded flex items-center gap-1 font-bold uppercase"><CreditCard size={10} /> One-time</span>}
           {service.monthlyPrice && <span className="bg-indigo-100 text-indigo-700 text-[9px] px-2 py-0.5 rounded flex items-center gap-1 font-bold uppercase"><Repeat size={10} /> Recurring</span>}
        </div>

        <div>
          <p className="text-gray-600 text-sm border-t border-dashed pt-2">
            <span className="font-medium text-gray-700 text-xs uppercase tracking-wide">Unit:</span> {service.unit}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            <span className="font-medium text-gray-700 text-xs uppercase tracking-wide">Scope:</span> {service.deliverables}
          </p>
        </div>
        
        {service.description && (
          <div className="bg-gray-50 p-2 rounded-md border border-gray-100">
             <div className="flex items-center gap-1.5 text-indigo-700 text-[10px] font-black uppercase mb-1">
                <Info size={12} /> Project Details
             </div>
             <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line">
               {service.description}
             </p>
          </div>
        )}
      </div>

      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
         <div onClick={() => onToggle(service)} className="flex items-center gap-2 cursor-pointer group select-none">
            {isSelected ? <CheckSquare className="text-indigo-600" size={24} /> : <Square className="text-gray-300 group-hover:text-indigo-500 transition-colors" size={24} />}
            <span className={`text-sm font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-600 group-hover:text-gray-900'}`}>{isSelected ? 'Selected' : 'Select'}</span>
         </div>
         {isSelected && (
            <div className="flex items-center bg-white border border-indigo-200 rounded-md shadow-sm">
               <button onClick={(e) => { e.stopPropagation(); onUpdatePendingQty(service.id, -1); }} className="w-8 h-8 flex items-center justify-center text-indigo-700 hover:bg-indigo-50"><Minus size={14} /></button>
               <input type="number" min="1" value={pendingQuantity} onClick={(e) => e.stopPropagation()} onChange={handleManualQuantity} className="w-10 h-8 text-center text-sm font-bold border-x border-indigo-100 outline-none" />
               <button onClick={(e) => { e.stopPropagation(); onUpdatePendingQty(service.id, 1); }} className="w-8 h-8 flex items-center justify-center text-indigo-700 hover:bg-indigo-50"><Plus size={14} /></button>
            </div>
         )}
      </div>
    </div>
  );
};

export default ServiceCard;