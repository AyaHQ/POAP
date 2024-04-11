import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { deployer } = await hre.getNamedAccounts()

	console.log(deployer)

	await hre.deployments.deploy("NFTContract", {
		from: deployer,
		args: ["Test NFT", "TST", "https://example.com/", deployer],
		log: true,
	})
}
export default func
func.tags = ["erc721"]
