import React from 'react';
import { CartItem } from '../types';
import { ArrowRight, Trash2, FileText, CheckCircle2, PlusCircle, ShoppingBag } from 'lucide-react';

interface StickySummaryProps {
  pendingItems: CartItem[]; // Items currently selected on screen
  cartItems: CartItem[];    // Items already in the proposal
  onAddToProposal: () => void;
  onRemoveFromCart: (id: string) => void;
  onProceedToDownload: () => void;
}

const StickySummary: React.FC<StickySummaryProps> = ({ 
  pendingItems, 
  cartItems, 
  onAddToProposal, 
  onRemoveFromCart, 
  onProceedToDownload 
}) => {
  const hasPending = pendingItems.length > 0;
  
  // Calculate totals
  const pendingTotal = pendingItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // If no items at all
  if (!hasPending && cartItems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
        <h3 className="font-bold text-gray-900 mb-2">Proposal Builder</h3>
        <p className="text-sm text-gray-500 text-center py-8">
          Select services from the list and add them to your proposal.
        </p>
      </div>
    );
  }

  // --- MODE 1: Pending Selection (User is actively selecting items) ---
  if (hasPending) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-indigo-600 p-0 overflow-hidden sticky top-24 flex flex-col max-h-[calc(100vh-120px)] animate-fade-in">
        <div className="p-4 border-b bg-indigo-600 text-white flex justify-between items-center flex-shrink-0">
          <h3 className="font-bold flex items-center gap-2">
             <CheckCircle2 size={18} /> Current Selection
          </h3>
          <span className="bg-white text-indigo-600 text-xs font-bold px-2 py-1 rounded-full">{pendingItems.length} items</span>
        </div>
        
        <div className="overflow-y-auto p-4 space-y-3 flex-grow custom-scrollbar bg-indigo-50/30">
          {pendingItems.map((item) => (
            <div key={item.id} className="flex justify-between items-start text-sm border-b border-indigo-100 pb-2 last:border-0 last:pb-0">
               <div className="flex-1 pr-2">
                 <div className="font-medium text-gray-900 leading-tight">{item.name}</div>
                 <div className="text-xs text-gray-600 mt-0.5">{item.unit} x {item.quantity}</div>
               </div>
               <div className="text-right font-semibold text-gray-900">
                 ₹{(item.price * item.quantity).toLocaleString()}
               </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white border-t flex-shrink-0 space-y-3">
          <div className="flex justify-between items-center text-sm">
             <span className="text-gray-600 font-medium">Selection Total</span>
             <span className="font-bold text-gray-900">₹{pendingTotal.toLocaleString()}</span>
          </div>
          
          <button 
            onClick={onAddToProposal}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            Add to Proposal <PlusCircle size={18} />
          </button>
          
          {cartItems.length > 0 && (
             <p className="text-xs text-center text-gray-500">
               You also have {cartItemCount} items already in proposal.
             </p>
          )}
        </div>
      </div>
    );
  }

  // --- MODE 2: Proposal Cart View (Default when nothing actively selected) ---
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-0 overflow-hidden sticky top-24 flex flex-col max-h-[calc(100vh-120px)]">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center flex-shrink-0">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
           <ShoppingBag size={18} /> Proposal Cart
        </h3>
        <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">{cartItemCount}</span>
      </div>
      
      <div className="overflow-y-auto p-4 space-y-3 flex-grow custom-scrollbar">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-start text-sm group border-b border-gray-100 pb-2 last:border-0 last:pb-0">
             <div className="flex-1 pr-2">
               <div className="font-medium text-gray-800 leading-tight">{item.name}</div>
               <div className="text-xs text-gray-500 mt-0.5">{item.unit} x {item.quantity}</div>
             </div>
             <div className="text-right flex flex-col items-end">
               <div className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</div>
               <button onClick={() => onRemoveFromCart(item.id)} className="text-red-400 hover:text-red-600 text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 Remove
               </button>
             </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 border-t flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
           <span className="text-gray-600 font-medium">Total Estimate</span>
           <span className="text-xl font-bold text-gray-900">₹{cartTotal.toLocaleString()}</span>
        </div>
        
        <button 
          onClick={onProceedToDownload}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          Download Proposal <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default StickySummary;