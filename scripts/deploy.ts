import { address, toNano } from "@ton/core";
import { MainContract } from "../wrappers/MainContract";
import { compile, NetworkProvider } from "@ton/blueprint";

export async function run(provider: NetworkProvider) {
  const myContract = MainContract.createFromConfig(
    {
      number: 0,
      address: address("0QATA2P3V3XrVgGEi7Rz6AbBCppIcTRmC7lvIZz7mX2XJVoE"),
      owner_address: address(
        "0QATA2P3V3XrVgGEi7Rz6AbBCppIcTRmC7lvIZz7mX2XJVoE"
      ),
    },
    await compile("MainContract")
  );

  const openedContract = provider.open(myContract);

  openedContract.sendDeploy(provider.sender(), toNano("0.05"));

  await provider.waitForDeploy(myContract.address);
}

