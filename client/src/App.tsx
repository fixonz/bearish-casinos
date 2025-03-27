import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import CoinFlipGame from "@/pages/CoinFlipGame";
import DiceGame from "@/pages/DiceGame";
import SlotsGame from "@/pages/SlotsGame";
import CrashGame from "@/pages/CrashGame";
import BlackjackGame from "@/pages/BlackjackGame";
import RouletteGame from "@/pages/RouletteGame";
import PokerGame from "@/pages/PokerGame";
import TokenTraderGame from "@/pages/TokenTraderGame";
import MemeRaceGame from "@/pages/MemeRaceGame";
import MiningGamePage from "@/pages/MiningGame";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/not-found";
import { WalletProvider } from "@/context/WalletContext";
import { GamesProvider } from "@/context/GamesContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/games/coinflip" component={CoinFlipGame} />
      <Route path="/games/dice" component={DiceGame} />
      <Route path="/games/slots" component={SlotsGame} />
      <Route path="/games/crash" component={CrashGame} />
      <Route path="/games/blackjack" component={BlackjackGame} />
      <Route path="/games/roulette" component={RouletteGame} />
      <Route path="/games/poker" component={PokerGame} />
      <Route path="/games/tokentrader" component={TokenTraderGame} />
      <Route path="/games/memerace" component={MemeRaceGame} />
      <Route path="/games/mining" component={MiningGamePage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GamesProvider>
        <WalletProvider>
          <Router />
          <Toaster />
        </WalletProvider>
      </GamesProvider>
    </QueryClientProvider>
  );
}

export default App;
