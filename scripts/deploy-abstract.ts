
import { ethers } from "ethers";
import dotenv from "dotenv";
import { CONTRACT_ADDRESSES } from "../client/src/lib/contracts";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.ABSTRACT_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  console.log("Deploying contracts to Abstract Network with address:", wallet.address);

  // Deploy base contract first
  const CasinoBase = await ethers.getContractFactory("AbstractCasinoBase");
  const casinoBase = await CasinoBase.connect(wallet).deploy(
    250, // 2.5% house edge
    ethers.parseEther("0.01"), // min bet
    ethers.parseEther("1.0")  // max bet
  );
  await casinoBase.deployed();
  console.log("CasinoBase deployed to:", casinoBase.address);

  // Deploy DiceGame with Pyth integration
  const DiceGame = await ethers.getContractFactory("DiceGame");
  const diceGame = await DiceGame.connect(wallet).deploy(
    250,
    ethers.parseEther("0.01"),
    ethers.parseEther("1.0"),
    process.env.PYTH_ENTROPY_ADDRESS
  );
  await diceGame.deployed();
  console.log("DiceGame deployed to:", diceGame.address);

  // Log all addresses for easy .env update
  console.log("\nAdd these addresses to your .env file:");
  console.log(`CASINO_BASE_ADDRESS=${casinoBase.address}`);
  console.log(`DICE_GAME_ADDRESS=${diceGame.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
