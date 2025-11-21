
export enum GameType {
  HOME = 'HOME',
  MAHJONG = 'MAHJONG',
  POKER = 'POKER',
  SKETCH = 'SKETCH',
  PARTY = 'PARTY'
}

export enum Suit {
  HEARTS = '♥',
  DIAMONDS = '♦',
  CLUBS = '♣',
  SPADES = '♠'
}

export interface Card {
  suit: Suit;
  rank: string; // 2, 3, ... J, Q, K, A
  value: number;
}

export interface Tile {
  id: string;
  content: string;
  status: 'idle' | 'selected' | 'matched';
  x: number;
  y: number;
  z: number;
}

export interface ChatMessage {
  role: 'user' | 'ai' | 'system';
  text: string;
}
