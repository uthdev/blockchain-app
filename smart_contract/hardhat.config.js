//https://eth-ropsten.alchemyapi.io/v2/iFiuMdgXlelNfqOpma2sfI_mcJZduT2T

require("@nomiclabs/hardhat-waffle");
const accessEnv = require('./helpers')

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/iFiuMdgXlelNfqOpma2sfI_mcJZduT2T',
      accounts: ['6c445fc3931164ea14fa3790606401afd43455c48bfa0f510ca3ff33e73e25dd']
    }
  }
}
































// require("@nomiclabs/hardhat-waffle");

// // This is a sample Hardhat task. To learn how to create your own go to
// // https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// // You need to export an object to set up your config
// // Go to https://hardhat.org/config/ to learn more

// /**
//  * @type import('hardhat/config').HardhatUserConfig
//  */
// module.exports = {
//   solidity: "0.8.4",
// };