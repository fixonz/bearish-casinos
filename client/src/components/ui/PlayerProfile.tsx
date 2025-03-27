import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatAddress } from '@/lib/utils';
import { Wallet } from '@/types';

interface PlayerProfileProps {
  player: Wallet;
  betAmount?: number;
  hasExited?: boolean;
  exitMultiplier?: number;
  isCurrentPlayer?: boolean;
  className?: string;
}

export function PlayerProfile({
  player,
  betAmount,
  hasExited,
  exitMultiplier,
  isCurrentPlayer = false,
  className = ''
}: PlayerProfileProps) {
  return (
    <div className={`flex items-center p-2 ${hasExited ? 'bg-green-900/20' : ''} ${isCurrentPlayer ? 'border-l-2 border-primary' : ''} rounded-md ${className}`}>
      <Avatar className="h-8 w-8 mr-2">
        <AvatarImage src={player.profilePicture} alt={player.username || 'Player'} />
        <AvatarFallback className="bg-primary/20 text-primary text-xs">
          {player.username?.substring(0, 2).toUpperCase() || 'P'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col min-w-0">
        <div className="flex items-center">
          <span className="font-medium text-sm truncate mr-1">
            {player.username || formatAddress(player.address)}
          </span>
          {isCurrentPlayer && (
            <Badge variant="outline" className="text-xs px-1 py-0 h-4 border-primary text-primary">
              You
            </Badge>
          )}
        </div>
        
        {betAmount !== undefined && (
          <div className="text-xs text-zinc-400 flex items-center">
            <span className="mr-1">{betAmount.toFixed(2)} ATOM</span>
            {hasExited && exitMultiplier && (
              <span className="text-green-500">
                @ {exitMultiplier.toFixed(2)}x
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}