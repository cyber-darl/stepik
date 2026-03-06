import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from "@ton/core";

export type MainContractConfig = {
  number: number;
  address: Address;
}

export function mainContractConfigToCell (config: MainContractConfig) : Cell {
  return beginCell().storeUint(config.number, 32).storeAddress(config.address).endCell();
}

export class MainContract implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

static createFromConfig(config: MainContractConfig, code: Cell, workchain = 0) {
  const data = mainContractConfigToCell(config);    
  const init = { code, data };
  const address = contractAddress(workchain, init);
  return new MainContract(address, init);
}

  async sendIncrement(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    increment_by: number
  ) {
    const msg_body = beginCell()
    .storeUint(1,32) //OP code
    .storeUint(increment_by, 32) //increment_by value
    .endCell();
    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    });
  }
  async getData(provider: ContractProvider) {
    const { stack } = await provider.get("get_contract_storage_data", []);
    return {
      number: stack.readNumber(),
      recent_sender: stack.readAddress(),
    };
}
async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
}

}


// ContractProvider is used in Blueprint wrappers to interact with smart contracts on the blockchain. It's automatically provided as the first argument to wrapper methods when you use the open() method.

// Key uses:

// provider.internal(via, {...}) — sends internal messages to the contract
// provider.external(body) — sends external messages
// provider.get(methodName, args) — calls get methods (read-only)
// In testing, provider(address, init?) creates a ContractProvider for a given address. In the Blueprint API, provider() takes an address and optional StateInit (code + data).
