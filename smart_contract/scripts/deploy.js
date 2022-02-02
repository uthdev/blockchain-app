const main = async () => {
  const Transactions = await hre.ethers.getContractFactory("Transactions");
  const TodoLists =  await hre.ethers.getContractFactory("TodoLists");
  
  const todoLists = await TodoLists.deploy();
  const transactions = await Transactions.deploy();

  await todoLists.deployed();
  await transactions.deployed();

  console.log("Transactions deployed to: ", transactions.address);
  console.log("TodoLists deployed to: ", todoLists.address);
}

const runMain = async () => {
  try {
    await main();
    process.exit(0)
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

runMain()
