import React from 'react';
import { Trash2, X, ArrowRight, FileText, Edit2, Repeat, CreditCard } from 'lucide-react';
import { CartItem } from '../types';

interface CartSidebarProps {
  cart: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onUpdatePrice: (id: string, newPrice: number) => void;
  onRemove: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ cart, onUpdateQty, onUpdatePrice, onRemove, isOpen, onClose, onProceed }) => {
  
  const oneTimeSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const monthlySubtotal = cart.reduce((acc, item) => acc + ((item.monthlyPrice || 0) * item.quantity), 0);
  const tax = oneTimeSubtotal * 0.18;
  const totalOneTime = oneTimeSubtotal + tax;

  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
          <FileText size={20} className="text-indigo-600" />
          Proposal Cart ({cart.reduce((a,b) => a + b.quantity, 0)})
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cart.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <FileText size={32} className="text-gray-300" />
            </div>
            <p className="font-medium text-gray-900">Your proposal is empty</p>
            <p className="text-sm mt-1">Select services to build your quote.</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="border border-gray-100 rounded-xl p-3 shadow-sm bg-white hover:border-indigo-100 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-800 text-sm leading-tight pr-4">{item.name}</h4>
                <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
              </div>
              
              <div className="space-y-1 mb-3">
                 {item.price > 0 && (
                   <div className="flex items-center gap-2 text-xs text-gray-600">
                     <CreditCard size={12} className="text-gray-400" /> One-time: ₹{item.price.toLocaleString()}
                   </div>
                 )}
                 {item.monthlyPrice && (
                   <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
                     <Repeat size={12} className="text-indigo-400" /> Monthly: ₹{item.monthlyPrice.toLocaleString()}
                   </div>
                 )}
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                <div className="flex items-center bg-white border rounded shadow-sm">
                  <button onClick={() => onUpdateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 text-gray-600">-</button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 text-gray-600">+</button>
                </div>
                <div className="text-right">
                   <div className="text-[10px] text-gray-500 uppercase font-bold">Line Total</div>
                   <div className="font-bold text-gray-900">₹{( (item.price + (item.monthlyPrice || 0)) * item.quantity ).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="p-4 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>One-time (Incl. GST)</span>
              <span>₹{totalOneTime.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-indigo-600 font-bold bg-indigo-50 p-2 rounded">
              <span>Monthly Recurring</span>
              <span>₹{monthlySubtotal.toLocaleString()}</span>
            </div>
          </div>
          
          <button onClick={() => { onClose(); onProceed(); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all">
            Review Proposal <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CartSidebar;