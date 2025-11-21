
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GameType } from './types';
import { MahjongGame } from './components/games/MahjongGame';
import { PokerGame } from './components/games/PokerGame';
import { SketchGame } from './components/games/SketchGame';
import { PartyGame } from './components/games/PartyGame';
import { Button } from './components/ui/Button';
import { Dice1, PenTool, LayoutGrid, PartyPopper, Trophy } from 'lucide-react';

const App = () => {
  const [activeGame, setActiveGame] = useState<GameType>(GameType.HOME);

  const renderGame = () => {
    switch (activeGame) {
      case GameType.MAHJONG:
        return <MahjongGame onBack={() => setActiveGame(GameType.HOME)} />;
      case GameType.POKER:
        return <PokerGame onBack={() => setActiveGame(GameType.HOME)} />;
      case GameType.SKETCH:
        return <SketchGame onBack={() => setActiveGame(GameType.HOME)} />;
      case GameType.PARTY:
        return <PartyGame onBack={() => setActiveGame(GameType.HOME)} />;
      default:
        return <LandingPage onSelectGame={setActiveGame} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-gray-900 font-sans">
       {renderGame()}
    </div>
  );
};

const LandingPage: React.FC<{ onSelectGame: (game: GameType) => void }> = ({ onSelectGame }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 animate-fade-in">
      <header className="text-center mb-16">
        <div className="inline-block mb-4 p-3 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
           <Trophy size={32} className="text-yellow-500" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600" style={{WebkitTextStroke: '1px black'}}>
          ARCADE AI
        </h1>
        <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto">
          A collection of experimental games powered by Google Gemini.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <GameCard 
          title="Zen Mahjong" 
          description="Classic tile matching with a peaceful twist."
          icon={<LayoutGrid className="w-8 h-8" />}
          color="bg-emerald-100"
          accent="text-emerald-600"
          onClick={() => onSelectGame(GameType.MAHJONG)}
        />
        <GameCard 
          title="Cosmic Poker" 
          description="Bluff against a witty AI opponent."
          icon={<Dice1 className="w-8 h-8" />}
          color="bg-indigo-100"
          accent="text-indigo-600"
          onClick={() => onSelectGame(GameType.POKER)}
        />
        <GameCard 
          title="Sketch & Guess" 
          description="Draw something and let AI critique your art."
          icon={<PenTool className="w-8 h-8" />}
          color="bg-pink-100"
          accent="text-pink-600"
          onClick={() => onSelectGame(GameType.SKETCH)}
        />
        <GameCard 
          title="Party Mode" 
          description="Truths, dares, and scenarios for groups."
          icon={<PartyPopper className="w-8 h-8" />}
          color="bg-orange-100"
          accent="text-orange-600"
          onClick={() => onSelectGame(GameType.PARTY)}
        />
      </div>
      
      <footer className="mt-20 text-center text-gray-400 text-sm">
        Powered by Gemini 2.5 Flash • Built with React & Tailwind
      </footer>
    </div>
  );
};

const GameCard: React.FC<{ 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  color: string;
  accent: string;
  onClick: () => void; 
}> = ({ title, description, icon, color, accent, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="group relative bg-white border-4 border-black rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full"
    >
      <div className={`${color} ${accent} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border-2 border-black group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-gray-500 font-medium leading-relaxed">{description}</p>
      <div className="mt-auto pt-6 flex items-center font-bold text-sm uppercase tracking-wider">
        Play Now <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </button>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
