import React, { useState } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { getProposalRecommendations } from '../services/geminiService';
import { ServiceItem } from '../types';

interface AIAssistantProps {
  services: ServiceItem[];
  onApplyRecommendations: (ids: string[]) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ services, onApplyRecommendations }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleRecommend = async () => {
    if (!description.trim()) return;
    setLoading(true);
    const recommendedIds = await getProposalRecommendations(description, services);
    if (recommendedIds.length > 0) {
      onApplyRecommendations(recommendedIds);
    }
    setLoading(false);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between hover:shadow-lg transition-all"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="text-yellow-300" />
          <div className="text-left">
            <h3 className="font-bold">Not sure what to quote?</h3>
            <p className="text-sm text-purple-100">Let AI suggest a package based on the client need.</p>
          </div>
        </div>
        <ArrowRight />
      </button>
    );
  }

  return (
    <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-100 p-6 rounded-xl relative">
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
      
      <div className="flex items-center gap-2 mb-3 text-indigo-800 font-semibold">
        <Sparkles size={20} />
        <h3>AI Proposal Assistant</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Briefly describe the client's business and their marketing goals (e.g., "A new fashion startup wanting to launch on Instagram and build a website").
      </p>

      <div className="flex gap-3">
        <input 
          type="text" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe client needs..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleRecommend()}
        />
        <button 
          onClick={handleRecommend}
          disabled={loading || !description}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Generate'}
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
