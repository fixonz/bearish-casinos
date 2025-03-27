import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlayerProfile } from './PlayerProfile';
import { Wallet } from '@/types';

interface PlayerInfo extends Wallet {
  bet?: number;
  hasExited?: boolean;
  exitMultiplier?: number;
}

interface PlayersPanelProps {
  players: PlayerInfo[];
  currentPlayer?: Wallet;
  className?: string;
}

export function PlayersPanel({ players, currentPlayer, className = '' }: PlayersPanelProps) {
  // Sort players: first those who cashed out (by multiplier), then active players (by bet amount)
  const sortedPlayers = [...players].sort((a, b) => {
    // First, prioritize players who cashed out
    if (a.hasExited && !b.hasExited) return -1;
    if (!a.hasExited && b.hasExited) return 1;
    
    // If both cashed out, sort by exit multiplier
    if (a.hasExited && b.hasExited) {
      const multiplierA = a.exitMultiplier || 0;
      const multiplierB = b.exitMultiplier || 0;
      return multiplierB - multiplierA; // Descending order
    }
    
    // If neither cashed out, sort by bet amount
    const betA = a.bet || 0;
    const betB = b.bet || 0;
    return betB - betA; // Descending order
  });
  
  return (
    <div className={`flex flex-col bg-black/20 border border-zinc-800 rounded-lg h-full ${className}`}>
      <div className="flex items-center justify-between bg-zinc-900 border-b border-zinc-800 px-3 py-2">
        <h3 className="text-sm font-semibold">Players</h3>
        <span className="text-xs text-zinc-500">{players.length} online</span>
      </div>
      
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {sortedPlayers.map((player) => (
            <PlayerProfile
              key={player.userId}
              player={player}
              betAmount={player.bet}
              hasExited={player.hasExited}
              exitMultiplier={player.exitMultiplier}
              isCurrentPlayer={currentPlayer?.userId === player.userId}
            />
          ))}
          
          {players.length === 0 && (
            <div className="text-center py-6 text-zinc-500 text-sm">
              No players in this game yet.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}