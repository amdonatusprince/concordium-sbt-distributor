import {
  AccountAddress,
  ConcordiumGRPCClient,
  ContractAddress,
  ContractName,
  deserializeReceiveReturnValue,
  deserializeTypeValue,
  EntrypointName,
  InitName,
  Parameter,
  ReceiveName,
  SchemaVersion,
  serializeTypeValue,
  serializeUpdateContractParameters,
  toBuffer,
} from "@concordium/web-sdk";
import {
  CONTRACT_SUB_INDEX,
  DEFAULT_CONTRACT_INDEX,
  SPONSORED_TX_CONTRACT_NAME,
} from "./config";
import { CONTRACT_SCHEMAS } from "./techfiesta_minter_contract_schema";
import { Buffer } from "buffer/";
import toast from "react-hot-toast";

export interface TxHashResponse {
  tx_hash: string;
}

export async function initContract(
  rpc: ConcordiumGRPCClient | undefined,
  index: bigint
) {
  console.debug(`Refreshing info for contract ${index.toString()}`);
  const info = await rpc?.getInstanceInfo(ContractAddress.create(index, 0));
  console.log("Contract fecthed");
  if (!info) {
    throw new Error(`contract ${index} not found`);
  }

  const { version, name, owner, amount, methods, sourceModule } = info;
  const prefix = "init_";
  if (!InitName.toString(name).startsWith(prefix)) {
    throw new Error(`name "${name}" doesn't start with "init_"`);
  }
  return {
    version,
    index,
    name: ContractName.fromInitName(name),
    amount,
    owner,
    methods,
    sourceModule,
  };

  // return info;
}

export function generateMintPayload(account: any, CID: string) {
  const mint = {
    owner: {
      Account: [account],
    },
    token_metadata_base_url: `https://amaranth-nearby-leech-573.mypinata.cloud/ipfs/${CID}?`,
  };

  const payload = Parameter.toHexString(
    serializeTypeValue(
      mint,
      toBuffer(CONTRACT_SCHEMAS.entrypoints.mint.parameter, "base64")
    )
  ).toString();

  return payload;
}

export async function submitMint(
  backend: string,
  signer: string,
  nonce: number,
  signature: string,
  expiryTimeSignature: string,
  owner: string,
  token_metadata_base_url: string
): Promise<TxHashResponse> {
  const response = await fetch(`${backend}/submitMint`, {
    method: "POST",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({
      signer,
      nonce: nonce,
      signature,
      owner,
      token_metadata_base_url,
      timestamp: expiryTimeSignature,
    }),
  });
  if (!response.ok) {
    const error = (await response.json()) as unknown;
    toast.error("SBT mint failed");
    throw new Error(`Unable to submit transfer: ${JSON.stringify(error)}`);
  }
  const body = (await response.json()) as TxHashResponse;
  if (body) {
    toast.success("SBT mint successful");
    return body;
  }
  throw new Error("Unable to submit transfer");
}

export const getNonce = async (
  rpc: ConcordiumGRPCClient,
  account: string,
  contract: any
) => {
  const receiveName = "nonceOf";

  try {
    if (contract) {
      const contract_schema = await rpc?.getEmbeddedSchema(
        contract?.sourceModule
      );

      const serializedParameter = serializeUpdateContractParameters(
        ContractName.fromString(SPONSORED_TX_CONTRACT_NAME),
        EntrypointName.fromString(receiveName),
        [account],
        contract_schema,
        SchemaVersion.V1
      );

      const result = await rpc?.invokeContract({
        contract: contract && ContractAddress?.create(contract?.index, 0),
        method:
          contract &&
          ReceiveName?.create(
            contract?.name,
            EntrypointName?.fromString(receiveName)
          ),
        invoker: AccountAddress?.fromJSON(account),
        parameter: serializedParameter,
      });
      const buffer = Buffer.from(result.returnValue?.buffer as Uint8Array);
      const newschema = Buffer?.from(contract_schema).buffer;

      const name = ContractName?.fromString(SPONSORED_TX_CONTRACT_NAME);
      const entry_point = EntrypointName?.fromString(receiveName);

      const values = await deserializeReceiveReturnValue(
        buffer,
        contract_schema,
        name,
        entry_point,
        SchemaVersion?.V1
      );
      return values;
    }
  } catch (err) {
    console.error("Error fetching products:", err);
    // toast.error("Error fetching products", {
    //   id: loading,
    // });
  }
};
