import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Info, Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { verificationUtils } from '@/lib/provablyFair';

interface ProvablyFairModalProps {
  defaultClientSeed?: string;
  onClientSeedChange?: (seed: string) => void;
}

export default function ProvablyFairModal({
  defaultClientSeed = '',
  onClientSeedChange
}: ProvablyFairModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clientSeed, setClientSeed] = useState(defaultClientSeed);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('how');
  
  // Verification state (filled by user when verifying a game)
  const [verifyClientSeed, setVerifyClientSeed] = useState('');
  const [verifyServerSeed, setVerifyServerSeed] = useState('');
  const [verifyServerSeedHash, setVerifyServerSeedHash] = useState('');
  const [verifyNonce, setVerifyNonce] = useState('0');
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [verifyGameType, setVerifyGameType] = useState<'coinflip' | 'dice' | 'crash'>('coinflip');
  const [verifyGameValue, setVerifyGameValue] = useState('');

  const handleSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientSeed(e.target.value);
  };

  const handleSaveSeed = () => {
    if (onClientSeedChange) {
      onClientSeedChange(clientSeed);
    }
    setIsOpen(false);
  };

  const handleCopySeed = () => {
    navigator.clipboard.writeText(clientSeed);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleGenerateRandomSeed = () => {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    const randomSeed = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setClientSeed(randomSeed);
  };

  const handleVerifyResult = () => {
    let isVerified = false;
    
    try {
      const nonce = parseInt(verifyNonce);
      
      if (verifyGameType === 'coinflip') {
        const expectedResult = verifyGameValue.toLowerCase() === 'heads';
        isVerified = verificationUtils.verifyCoinFlip(
          verifyServerSeed,
          nonce,
          verifyClientSeed
        ) === expectedResult;
      } else if (verifyGameType === 'dice') {
        const diceResult = parseInt(verifyGameValue);
        isVerified = verificationUtils.verifyDiceRoll(
          verifyServerSeed,
          nonce,
          verifyClientSeed,
          diceResult,
          1,
          100
        );
      } else if (verifyGameType === 'crash') {
        const multiplier = parseFloat(verifyGameValue);
        isVerified = verificationUtils.verifyCrashPoint(
          verifyServerSeed,
          nonce,
          verifyClientSeed,
          multiplier
        );
      }
      
      setVerifyResult(isVerified);
    } catch (error) {
      console.error('Verification error:', error);
      setVerifyResult(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 px-2 py-1 text-xs bg-[#222222] hover:bg-[#333333]"
        >
          <Shield className="h-3 w-3 text-[#00c853]" />
          Provably Fair
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#1a1a1a] border-[#333333]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#00c853]" />
            Provably Fair System
          </DialogTitle>
          <DialogDescription>
            Our provably fair system ensures that all game results are transparent and verifiable.
          </DialogDescription>
        </DialogHeader>

        <Tabs 
          defaultValue="how" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="how">How It Works</TabsTrigger>
            <TabsTrigger value="client-seed">Client Seed</TabsTrigger>
            <TabsTrigger value="verify">Verify Results</TabsTrigger>
          </TabsList>

          <TabsContent value="how" className="space-y-4">
            <div className="space-y-4">
              <Alert className="bg-[#222222] border-[#333333]">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Our provably fair system uses cryptographic hashing to ensure game outcomes cannot be manipulated.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <h4 className="font-medium">The System Works In These Steps:</h4>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-300">
                  <li>Before each game, the server generates a random <b>Server Seed</b> and calculates its hash (SHA-256).</li>
                  <li>The Server Seed Hash is publicly shown to you <b>before</b> you play.</li>
                  <li>You can provide your own <b>Client Seed</b> for added randomness.</li>
                  <li>Game results are calculated using both seeds together.</li>
                  <li>After the game, the original Server Seed is revealed so you can verify the result.</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Why This Is Fair:</h4>
                <p className="text-sm text-gray-300">
                  Since the Server Seed Hash is shown before you play, the server cannot change the seed after seeing your bet. 
                  And since your Client Seed is combined with the Server Seed, neither party can predict or manipulate the outcome.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="client-seed" className="space-y-4">
            <div className="space-y-4">
              <Alert className="bg-[#222222] border-[#333333]">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Customize your client seed to add your own randomness to the game results.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="clientSeed" className="text-right">
                    Your Client Seed
                  </Label>
                  <div className="col-span-3 flex">
                    <Input
                      id="clientSeed"
                      value={clientSeed}
                      onChange={handleSeedChange}
                      className="flex-1 bg-[#222222] border-[#333333]"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopySeed}
                      className="ml-2"
                    >
                      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-span-4 flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={handleGenerateRandomSeed}
                      className="bg-[#222222] border-[#333333] hover:bg-[#333333]"
                    >
                      Generate Random Seed
                    </Button>
                    <Button 
                      onClick={handleSaveSeed}
                      className="bg-[#FFD700] text-black hover:bg-[#e6c300]"
                    >
                      Save Seed
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-300 mt-2">
                <p>
                  A unique client seed will be combined with the server seed to generate game results.
                  You can change your client seed at any time, which will cause a new server seed to be generated.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="verify" className="space-y-4">
            <div className="space-y-4">
              <Alert className="bg-[#222222] border-[#333333]">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Verify any past game result by entering the seeds and nonce values provided after each game.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-3">
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="gameType" className="text-right">
                    Game Type
                  </Label>
                  <div className="col-span-3">
                    <select 
                      id="gameType" 
                      value={verifyGameType}
                      onChange={(e) => setVerifyGameType(e.target.value as any)}
                      className="w-full p-2 rounded bg-[#222222] border border-[#333333]"
                    >
                      <option value="coinflip">Coin Flip</option>
                      <option value="dice">Dice Roll</option>
                      <option value="crash">Crash Game</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="resultValue" className="text-right">
                    Result 
                  </Label>
                  <div className="col-span-3">
                    {verifyGameType === 'coinflip' ? (
                      <select
                        id="resultValue"
                        value={verifyGameValue}
                        onChange={(e) => setVerifyGameValue(e.target.value)}
                        className="w-full p-2 rounded bg-[#222222] border border-[#333333]"
                      >
                        <option value="">Select result</option>
                        <option value="heads">Heads</option>
                        <option value="tails">Tails</option>
                      </select>
                    ) : (
                      <Input
                        id="resultValue"
                        value={verifyGameValue}
                        onChange={(e) => setVerifyGameValue(e.target.value)}
                        placeholder={verifyGameType === 'dice' ? "Dice Roll (1-100)" : "Crash Point (e.g., 2.53)"}
                        className="bg-[#222222] border-[#333333]"
                      />
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="serverSeed" className="text-right">
                    Server Seed
                  </Label>
                  <Input
                    id="serverSeed"
                    className="col-span-3 bg-[#222222] border-[#333333]"
                    value={verifyServerSeed}
                    onChange={(e) => setVerifyServerSeed(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="serverSeedHash" className="text-right">
                    Server Seed Hash
                  </Label>
                  <Input
                    id="serverSeedHash"
                    className="col-span-3 bg-[#222222] border-[#333333]"
                    value={verifyServerSeedHash}
                    onChange={(e) => setVerifyServerSeedHash(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="clientSeedVerify" className="text-right">
                    Client Seed
                  </Label>
                  <Input
                    id="clientSeedVerify"
                    className="col-span-3 bg-[#222222] border-[#333333]"
                    value={verifyClientSeed}
                    onChange={(e) => setVerifyClientSeed(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="nonce" className="text-right">
                    Nonce
                  </Label>
                  <Input
                    id="nonce"
                    type="number"
                    className="col-span-3 bg-[#222222] border-[#333333]"
                    value={verifyNonce}
                    onChange={(e) => setVerifyNonce(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end mt-2">
                  <Button onClick={handleVerifyResult}>
                    Verify
                  </Button>
                </div>
                
                {verifyResult !== null && (
                  <Alert className={verifyResult ? "bg-green-900/30 border-green-700" : "bg-red-900/30 border-red-700"}>
                    {verifyResult ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <AlertDescription>
                          Verification successful! The result matches the seeds and nonce.
                        </AlertDescription>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <AlertDescription>
                          Verification failed. The provided information does not produce the expected result.
                        </AlertDescription>
                      </>
                    )}
                  </Alert>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}