import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { getPokerCommentary } from '../../services/geminiService';
import { Suit, Card } from '../../types';

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const VALUES: Record<string, number> = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };

const createDeck = () => {
  const deck: Card[] = [];
  Object.values(Suit).forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({ suit, rank, value: VALUES[rank] });
    });
  });
  return deck.sort(() => Math.random() - 0.5);
};

const CardView: React.FC<{ card: Card | null; hidden?: boolean }> = ({ card, hidden }) => {
  if (hidden || !card) {
    return (
      <div className="w-16 h-24 md:w-20 md:h-28 bg-blue-800 border-2 border-white rounded-lg shadow-md flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]">
        <div className="w-12 h-20 border border-blue-400/30 rounded-sm m-1"></div>
      </div>
    );
  }
  const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;
  return (
    <div className="w-16 h-24 md:w-20 md:h-28 bg-white border border-gray-300 rounded-lg shadow-md flex flex-col items-center justify-between p-1 md:p-2 relative transform transition-transform hover:-translate-y-1">
      <div className={`text-sm md:text-lg font-bold self-start ${isRed ? 'text-red-600' : 'text-black'}`}>{card.rank}{card.suit}</div>
      <div className={`text-2xl md:text-4xl ${isRed ? 'text-red-600' : 'text-black'}`}>{card.suit}</div>
      <div className={`text-sm md:text-lg font-bold self-end rotate-180 ${isRed ? 'text-red-600' : 'text-black'}`}>{card.rank}{card.suit}</div>
    </div>
  );
};

export const PokerGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [gameStage, setGameStage] = useState<'preflop' | 'flop' | 'turn' | 'river' | 'showdown'>('preflop');
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [opponentHand, setOpponentHand] = useState<Card[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [pot, setPot] = useState(0);
  const [playerChips, setPlayerChips] = useState(1000);
  const [opponentChips, setOpponentChips] = useState(1000);
  const [commentary, setCommentary] = useState("Let's play some cards.");
  const [loadingAi, setLoadingAi] = useState(false);

  const startNewHand = () => {
    const newDeck = createDeck();
    setDeck(newDeck);
    setPlayerHand([newDeck.pop()!, newDeck.pop()!]);
    setOpponentHand([newDeck.pop()!, newDeck.pop()!]);
    setCommunityCards([]);
    setGameStage('preflop');
    setPot(20); // Blinds
    setPlayerChips(prev => prev - 10);
    setOpponentChips(prev => prev - 10);
    setCommentary("New hand dealt. Your move.");
  };

  useEffect(() => {
    startNewHand();
  }, []);

  const getAiComment = async (action: string) => {
    setLoadingAi(true);
    const pHandStr = playerHand.map(c => c.rank + c.suit).join(' ');
    const boardStr = communityCards.map(c => c.rank + c.suit).join(' ') || "None";
    const comment = await getPokerCommentary(pHandStr, boardStr, action, pot);
    setCommentary(comment);
    setLoadingAi(false);
  };

  const handleCall = async () => {
    setPot(prev => prev + 20);
    setPlayerChips(prev => prev - 20);
    await getAiComment("Called");
    advanceStage();
  };

  const handleFold = () => {
    setCommentary("You folded. AI wins the pot.");
    setOpponentChips(prev => prev + pot);
    setPot(0);
    setTimeout(startNewHand, 2000);
  };

  const advanceStage = () => {
    const newDeck = [...deck];
    if (gameStage === 'preflop') {
      setCommunityCards([newDeck.pop()!, newDeck.pop()!, newDeck.pop()!]);
      setGameStage('flop');
    } else if (gameStage === 'flop') {
      setCommunityCards(prev => [...prev, newDeck.pop()!]);
      setGameStage('turn');
    } else if (gameStage === 'turn') {
      setCommunityCards(prev => [...prev, newDeck.pop()!]);
      setGameStage('river');
    } else if (gameStage === 'river') {
      setGameStage('showdown');
      determineWinner();
    }
    setDeck(newDeck);
  };

  const determineWinner = () => {
    // Extremely simplified winner logic for high card logic demo
    // Real poker logic is too complex for this file size limit
    const playerSum = playerHand.reduce((acc, c) => acc + c.value, 0);
    const oppSum = opponentHand.reduce((acc, c) => acc + c.value, 0);
    
    if (playerSum > oppSum) {
      setCommentary(`You win with high cards! (+${pot})`);
      setPlayerChips(prev => prev + pot);
    } else {
      setCommentary("AI wins. Better luck next time.");
      setOpponentChips(prev => prev + pot);
    }
    setPot(0);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#35654d] text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-[#2a503d] shadow-lg">
        <Button variant="ghost" onClick={onBack} className="text-white hover:text-gray-200">Exit Table</Button>
        <div className="text-xl font-mono text-yellow-400 font-bold">POT: ${pot}</div>
      </div>

      {/* Opponent Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="flex gap-2 mb-4">
           <CardView card={opponentHand[0]} hidden={gameStage !== 'showdown'} />
           <CardView card={opponentHand[1]} hidden={gameStage !== 'showdown'} />
        </div>
        
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-800 border-4 border-gray-600 flex items-center justify-center mb-2 shadow-xl">
            <span className="text-4xl">🤖</span>
          </div>
          <div className="absolute -right-24 top-0 bg-white text-black p-3 rounded-xl rounded-tl-none shadow-lg max-w-[200px] text-sm">
            {loadingAi ? <span className="animate-pulse">Thinking...</span> : commentary}
          </div>
        </div>
        <div className="text-sm font-mono bg-black/30 px-3 py-1 rounded-full mt-2">
          AI Chips: ${opponentChips}
        </div>
      </div>

      {/* Community Cards */}
      <div className="h-32 flex items-center justify-center gap-2 md:gap-4 my-2">
        {communityCards.map((card, i) => (
          <div key={i} className="animate-bounce-slight" style={{ animationDelay: `${i * 0.1}s` }}>
            <CardView card={card} />
          </div>
        ))}
        {Array.from({ length: 5 - communityCards.length }).map((_, i) => (
           <div key={`placeholder-${i}`} className="w-16 h-24 md:w-20 md:h-28 border-2 border-white/10 rounded-lg"></div>
        ))}
      </div>

      {/* Player Area */}
      <div className="flex-1 flex flex-col items-center justify-end pb-8 bg-gradient-to-t from-black/40 to-transparent">
        <div className="flex gap-2 mb-6">
            {playerHand.map((card, i) => (
               <div key={i} className="transform hover:-translate-y-4 transition-transform duration-200">
                   <CardView card={card} />
               </div>
            ))}
        </div>
        
        <div className="text-lg font-bold mb-4">Your Chips: ${playerChips}</div>

        <div className="flex gap-4">
          {gameStage !== 'showdown' ? (
            <>
              <Button variant="secondary" onClick={handleFold} className="bg-red-500 hover:bg-red-600 text-white border-none">Fold</Button>
              <Button variant="primary" onClick={handleCall} className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-900/50">
                Call / Check
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={startNewHand} className="bg-green-600 hover:bg-green-700 border-none">Next Hand</Button>
          )}
        </div>
      </div>
    </div>
  );
};
