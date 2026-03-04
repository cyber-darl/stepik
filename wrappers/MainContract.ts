import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from "@ton/core";

export class MainContract implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

static createFromConfig(config: any, code: Cell, workchain = 0) {
  const data = beginCell()
    .storeUint(0, 2)   // Store a zero address (addr_none$00) as default
    .endCell();
  const init = { code, data };
  const address = contractAddress(workchain, init);
  return new MainContract(address, init);
}

  async sendInternalMessage(
    provider: ContractProvider,
    sender: Sender,
    value: bigint
  ) {
    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }
  async getData(provider: ContractProvider) {
    const { stack } = await provider.get("get_the_latest_sender", []);
    return {
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
