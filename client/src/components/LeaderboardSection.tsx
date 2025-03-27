import React from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ArrowRightIcon } from '@/lib/icons';
import headImg from '@assets/head.png';
import tailsImg from '@assets/taills.png';
import bearImg from '@assets/Y2HmxLIx_400x400.jpg';

// Mock leaderboard data
const LEADERBOARD_DATA = [
  {
    id: 1,
    username: 'CryptoBear',
    avatar: headImg,
    wins: 2456,
    bestMultiplier: 25.5,
    totalWagered: 12800,
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60) // 2 months ago
  },
  {
    id: 2,
    username: 'LuckyTails',
    avatar: tailsImg,
    wins: 1852,
    bestMultiplier: 18.2,
    totalWagered: 9400,
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150) // 5 months ago
  },
  {
    id: 3,
    username: 'BullMarket',
    avatar: bearImg,
    wins: 1205,
    bestMultiplier: 45.0,
    totalWagered: 8750,
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365) // 1 year ago
  }
];

const formatJoinedDate = (date: Date): string => {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 30) {
    return `Joined ${diffInDays} days ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `Joined ${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `Joined ${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

const LeaderboardSection: React.FC = () => {
  return (
    <section id="leaderboard" className="py-12">
      <h2 className="font-poppins font-bold text-3xl mb-8">Top Players</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#222222] text-left">
            <tr>
              <th className="p-4 rounded-tl-xl">Rank</th>
              <th className="p-4">Player</th>
              <th className="p-4">Wins</th>
              <th className="p-4">Best Multiplier</th>
              <th className="p-4 rounded-tr-xl">Total Wagered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {LEADERBOARD_DATA.map((entry, index) => (
              <tr key={entry.id} className="bg-[#1a1a1a] hover:bg-[#222222] transition-colors">
                <td className="p-4 font-medium">
                  <div className="flex items-center">
                    <span className={`w-8 h-8 ${
                      index === 0 ? 'bg-[#FFD700]' : 
                      index === 1 ? 'bg-gray-600' : 
                      'bg-amber-800'
                    } text-black rounded-full flex items-center justify-center mr-2`}>
                      {index + 1}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#FF4081] flex items-center justify-center mr-3">
                      <img src={entry.avatar} alt={entry.username} className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="font-medium">{entry.username}</div>
                      <div className="text-xs text-gray-400">{formatJoinedDate(entry.joinedAt)}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-[#00FF00]">+{entry.wins} ATOM</div>
                </td>
                <td className="p-4">
                  <div className="font-medium">{entry.bestMultiplier}x</div>
                </td>
                <td className="p-4">
                  <div className="font-medium">{entry.totalWagered.toLocaleString()} ATOM</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-center">
        <Button 
          variant="outline"
          className="px-4 py-2 bg-[#222222] rounded-lg hover:bg-opacity-80 transition-all flex items-center"
        >
          <span>View Full Leaderboard</span>
          <ArrowRightIcon className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </section>
  );
};

export default LeaderboardSection;
