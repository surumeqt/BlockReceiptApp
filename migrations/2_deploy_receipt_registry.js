const ReceiptRegistry = artifacts.require("ReceiptRegistry");

module.exports = async function (deployer, _network, accounts) {
  await deployer.deploy(ReceiptRegistry, accounts[0]); // Passing the deployer's address as the owner
};