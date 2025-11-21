import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { generatePartyPrompt } from '../../services/geminiService';
import { Sparkles, RefreshCw, Users, Wine, MessageCircle } from 'lucide-react';

export const PartyGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (cat: string) => {
    setCategory(cat);
    setLoading(true);
    const text = await generatePartyPrompt(cat);
    setPrompt(text);
    setLoading(false);
  };

  const categories = [
    { id: 'Truth', icon: <MessageCircle />, color: 'bg-blue-500' },
    { id: 'Dare', icon: <Sparkles />, color: 'bg-red-500' },
    { id: 'Never Have I Ever', icon: <Wine />, color: 'bg-purple-500' },
    { id: 'Would You Rather', icon: <Users />, color: 'bg-green-500' },
  ];

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6 animate-fade-in">
      <Button variant="ghost" onClick={onBack} className="self-start mb-4">← Back to Arcade</Button>
      
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-black mb-2 text-gray-900 tracking-tight">PARTY MODE</h1>
        <p className="text-gray-500 text-lg">AI-generated chaos for your social gathering.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleGenerate(cat.id)}
            disabled={loading}
            className={`${cat.color} hover:brightness-110 transition-all transform active:scale-95 text-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-3 h-32`}
          >
            <div className="p-2 bg-white/20 rounded-full">
              {React.cloneElement(cat.icon as React.ReactElement, { size: 24 })}
            </div>
            <span className="font-bold text-lg leading-tight">{cat.id}</span>
          </button>
        ))}
      </div>

      <div className="relative min-h-[200px] flex items-center justify-center">
        {loading ? (
           <div className="flex flex-col items-center animate-pulse">
             <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
             <div className="h-4 w-48 bg-gray-200 rounded"></div>
           </div>
        ) : prompt ? (
          <div className="w-full bg-white border-4 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform transition-all duration-500 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
               <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-black">{category}</span>
               <Sparkles className="text-yellow-500" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-6">
              {prompt}
            </p>
            <div className="flex justify-end">
               <Button size="sm" variant="outline" onClick={() => handleGenerate(category)}>
                 Next {category} <RefreshCw size={14} className="ml-2" />
               </Button>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-center italic">
            Select a category above to start the fun...
          </div>
        )}
      </div>
    </div>
  );
};
