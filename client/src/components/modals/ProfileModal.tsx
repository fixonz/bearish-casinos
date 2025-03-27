import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWalletContext } from '@/context/WalletContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const avatarOptions = [
  '/attached_assets/Y2HmxLIx_400x400.jpg',
  '/attached_assets/processed-nft-33-1-dark (1).png',
  '/attached_assets/bearishshs.png',
  '/attached_assets/head.png',
  '/attached_assets/image_1743101567935.png',
  '/attached_assets/image_1743104494799.png'
];

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { wallet, updateUsername, updateProfilePicture } = useWalletContext();
  const [username, setUsername] = useState(wallet.username || 'Guest');
  const [selectedAvatar, setSelectedAvatar] = useState(wallet.profilePicture || '/attached_assets/head.png');
  
  const handleSave = () => {
    if (username.trim() !== wallet.username) {
      updateUsername(username.trim());
    }
    
    if (selectedAvatar !== wallet.profilePicture) {
      updateProfilePicture(selectedAvatar);
    }
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-white border-zinc-700">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Customize how other players see you during multiplayer games.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center space-y-2 mb-4">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={selectedAvatar} alt="Profile picture" />
              <AvatarFallback className="bg-zinc-800">
                {username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {avatarOptions.map((avatar, index) => (
              <button
                key={index}
                className={`p-1 rounded-md ${
                  selectedAvatar === avatar ? 'ring-2 ring-primary' : 'ring-0'
                }`}
                onClick={() => setSelectedAvatar(avatar)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatar} alt={`Avatar option ${index + 1}`} />
                </Avatar>
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4 mt-4">
            <Label htmlFor="username" className="text-right">
              Display Name
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3 bg-zinc-800 border-zinc-700"
              maxLength={20}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}