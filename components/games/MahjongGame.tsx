
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Tile } from '../../types';
import { RefreshCw, Check, X } from 'lucide-react';

const TILE_TYPES = [
  '🀀','🀁','🀂','🀃', // Winds
  '🀄','🀅','🀆',     // Dragons
  '🀇','🀈','🀉','🀊','🀋','🀌','🀍','🀎','🀏', // Characters
  '🀐','🀑','🀒','🀓','🀔','🀕','🀖','🀗','🀘', // Bamboo
  '🀙','🀚','🀛','🀜','🀝','🀞','🀟','🀠','🀡'  // Dots
];

// Define a layout: List of {x, y, z}
// Simple layered structure
const LAYOUT_CONFIG = [
  // Base Layer (z=0) - 6x4 grid roughly
  {x:0,y:0,z:0}, {x:1,y:0,z:0}, {x:2,y:0,z:0}, {x:3,y:0,z:0}, {x:4,y:0,z:0}, {x:5,y:0,z:0},
  {x:0,y:1,z:0}, {x:1,y:1,z:0}, {x:2,y:1,z:0}, {x:3,y:1,z:0}, {x:4,y:1,z:0}, {x:5,y:1,z:0},
  {x:0,y:2,z:0}, {x:1,y:2,z:0}, {x:2,y:2,z:0}, {x:3,y:2,z:0}, {x:4,y:2,z:0}, {x:5,y:2,z:0},
  {x:0,y:3,z:0}, {x:1,y:3,z:0}, {x:2,y:3,z:0}, {x:3,y:3,z:0}, {x:4,y:3,z:0}, {x:5,y:3,z:0},
  
  // Second Layer (z=1) - Central 4x2
  {x:1,y:1,z:1}, {x:2,y:1,z:1}, {x:3,y:1,z:1}, {x:4,y:1,z:1},
  {x:1,y:2,z:1}, {x:2,y:2,z:1}, {x:3,y:2,z:1}, {x:4,y:2,z:1},

  // Third Layer (z=2) - Peak 2x2
  {x:2,y:1,z:2}, {x:3,y:1,z:2},
  {x:2,y:2,z:2}, {x:3,y:2,z:2},
]; // Total 36 tiles (18 pairs)

export const MahjongGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [matchesLeft, setMatchesLeft] = useState(0);

  const initGame = () => {
    // Select random tile types for pairs
    const numPairs = LAYOUT_CONFIG.length / 2;
    const availableTypes = [...TILE_TYPES].sort(() => Math.random() - 0.5);
    const gameTypes = availableTypes.slice(0, numPairs); // Unique types per pair if possible
    // If not enough types, reuse
    while (gameTypes.length < numPairs) {
      gameTypes.push(availableTypes[Math.floor(Math.random() * availableTypes.length)]);
    }

    // Create pairs
    const tileContents = [...gameTypes, ...gameTypes].sort(() => Math.random() - 0.5);

    // Map to layout
    const newTiles: Tile[] = LAYOUT_CONFIG.map((pos, index) => ({
      id: `tile-${index}`,
      content: tileContents[index],
      status: 'idle',
      x: pos.x,
      y: pos.y,
      z: pos.z
    }));

    setTiles(newTiles);
    setSelectedId(null);
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const isTileBlocked = (target: Tile, currentTiles: Tile[]) => {
    if (target.status === 'matched') return true;

    // Check if covered by tile above (z + 1)
    const isCovered = currentTiles.some(t => 
      t.status !== 'matched' && 
      t.z === target.z + 1 && 
      t.x === target.x && 
      t.y === target.y
    );
    if (isCovered) return true;

    // Check left/right availability
    // In this simplified grid, we check for immediate neighbors at same Z
    const hasLeft = currentTiles.some(t => t.status !== 'matched' && t.z === target.z && t.x === target.x - 1 && t.y === target.y);
    const hasRight = currentTiles.some(t => t.status !== 'matched' && t.z === target.z && t.x === target.x + 1 && t.y === target.y);

    // Standard rule: needs EITHER left OR right side free
    return hasLeft && hasRight;
  };

  useEffect(() => {
    // Calculate available matches
    if (tiles.length === 0) return;
    
    const activeTiles = tiles.filter(t => t.status !== 'matched');
    if (activeTiles.length === 0 && tiles.length > 0) {
      setGameOver(true);
      return;
    }

    const available = activeTiles.filter(t => !isTileBlocked(t, tiles));
    let matches = 0;
    for (let i = 0; i < available.length; i++) {
      for (let j = i + 1; j < available.length; j++) {
        if (available[i].content === available[j].content) {
          matches++;
        }
      }
    }
    setMatchesLeft(matches);
  }, [tiles]);

  const handleTileClick = (clickedTile: Tile) => {
    if (isTileBlocked(clickedTile, tiles)) return;

    if (selectedId === null) {
      // Select
      setSelectedId(clickedTile.id);
      setTiles(prev => prev.map(t => t.id === clickedTile.id ? { ...t, status: 'selected' } : t));
    } else if (selectedId === clickedTile.id) {
      // Deselect
      setSelectedId(null);
      setTiles(prev => prev.map(t => t.id === clickedTile.id ? { ...t, status: 'idle' } : t));
    } else {
      // Match attempt
      const selectedTile = tiles.find(t => t.id === selectedId);
      if (selectedTile && selectedTile.content === clickedTile.content) {
        // Match!
        setTiles(prev => prev.map(t => 
          (t.id === clickedTile.id || t.id === selectedId) ? { ...t, status: 'matched' } : t
        ));
        setScore(prev => prev + 100);
        setSelectedId(null);
      } else {
        // No match, switch selection
        setTiles(prev => prev.map(t => {
          if (t.id === selectedId) return { ...t, status: 'idle' };
          if (t.id === clickedTile.id) return { ...t, status: 'selected' };
          return t;
        }));
        setSelectedId(clickedTile.id);
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <div className="flex flex-col items-center">
           <h1 className="text-3xl font-bold text-emerald-800">Zen Mahjong</h1>
           <div className="text-sm font-mono text-emerald-600">Matches Avail: {matchesLeft}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-2xl font-mono font-bold text-emerald-700">Score: {score}</div>
          <Button variant="ghost" size="sm" onClick={initGame} title="Reset">
             <RefreshCw size={20} />
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-[#e6f0e9] rounded-3xl shadow-inner border-4 border-[#cbdad0] relative overflow-hidden flex items-center justify-center">
        {/* Game Board */}
        <div className="relative w-[600px] h-[500px] transform scale-75 md:scale-100 transition-transform">
          {tiles.map((tile) => {
            if (tile.status === 'matched') return null;
            
            const blocked = isTileBlocked(tile, tiles);
            const isSelected = tile.status === 'selected';
            
            // Calculate position
            // Tile width approx 60px, height 80px
            // Layer offset: x+5, y-5
            const left = tile.x * 60 + (tile.z * 8);
            const top = tile.y * 80 - (tile.z * 8);
            const zIndex = tile.z * 10 + tile.x; // Simple z-index sort

            return (
              <div
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                className={`
                  absolute w-[54px] h-[72px] flex items-center justify-center text-3xl cursor-pointer transition-all duration-200
                  ${isSelected ? '-translate-y-2 z-50' : ''}
                  ${blocked ? 'opacity-90 brightness-90 cursor-not-allowed' : 'hover:-translate-y-1 hover:brightness-110'}
                `}
                style={{
                  left: `${left + 100}px`, // Center offset
                  top: `${top + 100}px`,
                  zIndex: zIndex + (isSelected ? 100 : 0),
                  backgroundColor: '#fdf6e3',
                  borderRadius: '8px',
                  boxShadow: isSelected 
                    ? '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 4px 4px 0px #d4c5a5'
                    : '2px 2px 5px rgba(0,0,0,0.2), 4px 4px 0px #d4c5a5',
                  border: '1px solid #e8dbc0'
                }}
              >
                {/* Tile Face */}
                <div className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-md bg-gradient-to-br from-white to-[#f4e6c7]">
                   {blocked && <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>}
                   <span className={`select-none ${tile.content.length > 1 ? 'text-2xl' : 'text-4xl'}`} style={{color: blocked ? '#888' : '#000'}}>
                     {tile.content}
                   </span>
                </div>
                
                {/* Selection Ring */}
                {isSelected && (
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-lg animate-pulse"></div>
                )}
              </div>
            );
          })}
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center transform animate-bounce-slight">
              <h2 className="text-4xl font-bold mb-4 text-emerald-600">Cleared!</h2>
              <p className="text-xl mb-6">Final Score: {score}</p>
              <Button size="lg" onClick={initGame}>Play Again</Button>
            </div>
          </div>
        )}
        
        {/* No moves hint */}
        {!gameOver && matchesLeft === 0 && tiles.filter(t=>t.status!=='matched').length > 0 && (
           <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 px-4 py-2 rounded-full shadow-lg border border-red-200 animate-pulse">
             No moves available! Shuffle required.
             <button onClick={initGame} className="ml-2 underline font-bold">Restart</button>
           </div>
        )}
      </div>
    </div>
  );
};
