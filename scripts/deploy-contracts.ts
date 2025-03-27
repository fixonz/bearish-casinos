
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  console.log("Deploying contracts with account:", wallet.address);

  // Deploy AbstractCasinoBase first
  const CasinoBase = await ethers.getContractFactory("AbstractCasinoBase");
  const casinoBase = await CasinoBase.connect(wallet).deploy(
    250, // 2.5% house edge
    ethers.parseEther("0.01"), // min bet
    ethers.parseEther("1.0")  // max bet
  );
  await casinoBase.deployed();
  console.log("CasinoBase deployed to:", casinoBase.address);

  // Deploy games with Pyth integration
  const pythEntropyAddress = process.env.PYTH_ENTROPY_ADDRESS;
  
  const DiceGame = await ethers.getContractFactory("DiceGame");
  const diceGame = await DiceGame.connect(wallet).deploy(
    250,
    ethers.parseEther("0.01"),
    ethers.parseEther("1.0"),
    pythEntropyAddress
  );
  await diceGame.deployed();
  console.log("DiceGame deployed to:", diceGame.address);

  // Add other game deployments as needed
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
