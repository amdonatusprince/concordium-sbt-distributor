"use client";
import Image from "next/image";
import { GetCIDResponse, PinResponse } from "pinata";
import React, { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import {
  DEFAULT_CONTRACT_INDEX,
  MAX_CONTRACT_EXECUTION_ENERGY,
  VERIFIER_URL,
} from "@/config";
import {
  AccountTransactionType,
  CcdAmount,
  ConcordiumGRPCClient,
  ContractAddress,
  Energy,
  EntrypointName,
  ReceiveName,
} from "@concordium/web-sdk";
import { useWallet } from "@/provider/WalletProvider";
import {
  binaryMessageFromHex,
  moduleSchemaFromBase64,
  typeSchemaFromBase64,
} from "@concordium/react-components";
import { generateMintPayload, getNonce, submitMint } from "@/utils";
import { CONTRACT_SCHEMAS } from "@/techfiesta_minter_contract_schema";
import { Buffer } from "buffer/";
import { BarLoader, BeatLoader, CircleLoader } from "react-spinners";

const page = () => {
  const [nftData, setNftData] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [minted, setMinted] = useState(false);
  const [nextNonce, setNextNonce] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [minting, setMinting] = useState(false);

  const {
    connection,
    contract,
    moduleSchemaBase64Embedded,
    account,
    connect,
    rpc,
  } = useWallet();

  const { CID } = useParams();

  const getNft = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/files?CID=${CID}`);
      if (response.ok) {
        const data: GetCIDResponse = await response.json();
        console.log(data.data);
        setNftData(data.data);
        setLoading(false);
        setError(false);
        toast.success("sucessfull");
      } else {
        toast.error("failed");
        setLoading(false);
        setError(true);
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
      setError(true);
    }
  };

  useEffect(() => {
    getNft();
  }, []);

  // const mintNft = async () => {
  //   if (!account) {
  //     toast.error("Please connect wallet");
  //     return;
  //   }
  //   function generateRandomTokenId() {
  //     return Math.floor(10000000 + Math.random() * 90000000);
  //   }

  //   const randomTokenId = generateRandomTokenId();

  //   const params = {
  //     parameters: {
  //       owner: {
  //         Account: [account],
  //       },
  //       token_metadata_base_url: `https://amaranth-nearby-leech-573.mypinata.cloud/ipfs/${CID}?`,
  //       // tokens: [randomTokenId.toString()],
  //     },
  //     schema: moduleSchemaFromBase64(moduleSchemaBase64Embedded),
  //   };

  //   try {
  //     const transactionHash = await connection?.signAndSendTransaction(
  //       account,
  //       AccountTransactionType.Update,
  //       {
  //         amount: CcdAmount.fromCcd(0),
  //         address: ContractAddress.create(contract?.index, 0),
  //         receiveName: ReceiveName.create(
  //           contract?.name,
  //           EntrypointName.fromString("mint")
  //         ),
  //         maxContractExecutionEnergy: Energy.create(
  //           MAX_CONTRACT_EXECUTION_ENERGY
  //         ),
  //       },
  //       params
  //     );
  //     // await completeMint(id);
  //     toast.success("SBT mint successful");
  //     setMinted(true);
  //     return transactionHash;
  //   } catch (error) {
  //     console.error("Error completing campaign:", error);
  //     toast.error("SBT Mint failed");
  //     setMinted(false);
  //     throw error;
  //   }
  // };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(DEFAULT_CONTRACT_INDEX));
      setCopySuccess(true);

      // Reset the copySuccess state after a delay
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  useEffect(() => {
    // Define the async function
    const fetchNonce = async () => {
      console.log(account);
      try {
        const value = await getNonce(
          rpc as ConcordiumGRPCClient,
          account,
          contract
        );
        setNextNonce(Number(value[0]));
      } catch (error) {
        console.error("Error fetching nonce:", error);
      }
    };

    // Call the async function
    if (account) {
      fetchNonce();
    }
  }, [account, rpc, contract]);

  const mintSponsoredNft = async () => {
    if (!account) {
      toast.error("Please connect wallet");
      return;
    }
    setMinting(true);
    // Signatures should expire in one day. Add 1 day to the current time.
    const date = new Date();
    date.setTime(date.getTime() + 86400 * 1000);

    // RFC 3339 format (e.g. 2030-08-08T05:15:00Z)
    const expiryTimeSignature = date.toISOString();

    const payload = generateMintPayload(account, CID as string);

    if (payload !== "") {
      const promise = connection?.signMessage(
        account,
        binaryMessageFromHex(
          payload,
          typeSchemaFromBase64(CONTRACT_SCHEMAS.entrypoints.mint.parameter)
        )
      );
      promise
        ?.then((permitSignature) => {
          submitMint(
            VERIFIER_URL,
            account,
            nextNonce,
            permitSignature[0][0],
            expiryTimeSignature,
            account,
            `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${CID}?`
          ).then((response) => {
            response && setMinted(true);
            setMinting(false);
          });
        })
        .catch((err: Error) => {
          toast.error(err.message);
          setMinting(false);
        });
    } else {
      setMinting(false);
      toast.error("Serialization Error");
    }
  };
  console.log(nftData);

  return (
    <Suspense fallback={<p>Loading...</p>}>
      {loading && (
        <div className="text-[25px] font-agrandir flex justify-center items-center h-full">
          <div className="flex flex-col items-center gap-3">
            <p className="text-[#3b82f6]">Loading SBT</p>
            <CircleLoader color="#3b82f6" size={200} />
          </div>
        </div>
      )}
      {error && !loading && (
        <div className="text-[25px] text-center text-gray-700 mt-7">
          <p>Error loading SBT...</p>
          <p className="text-[20px]">try to refresh page...</p>
        </div>
      )}
      {nftData && (
        <div className="p-10  flex justify-center items-center">
          <div>
            <div className="flex justify-between items-center gap-10">
              <p className="text-[30px] font-semibold">
                Here is your mint link
              </p>
              {account ? (
                "Connected"
              ) : (
                <button
                  onClick={() => connect?.()}
                  className="px-6 py-3 bg-blue-500  rounded-md text-white"
                >
                  Connect Wallet
                </button>
              )}
            </div>
            <div className="border p-4 bg-white shadow-lg rounded-lg mt-10">
              <div className=" flex  flex-col  items-center gap-4">
                <Image
                  src={nftData?.display?.url}
                  alt={nftData?.name}
                  width={300}
                  height={300}
                />
                <button
                  disabled={minted}
                  // onClick={() => mintNft()}
                  onClick={() => mintSponsoredNft()}
                  className={`${
                    minted || minting
                      ? "bg-blue-200 text-white"
                      : "bg-blue-500 text-white"
                  } border w-full p-3 rounded-md max-w-[300px] `}
                >
                  {minting ? <BeatLoader color="#ffffff" /> : "Mint SBT"}
                </button>
              </div>
              {minted && (
                <div className="border mt-10 p-3 bg-white shadow-lg rounded  flex flex-col gap-2 sm:flex-row  justify-between items-center">
                  <p>
                    Import NFT Contract in your wallet:{" "}
                    {String(DEFAULT_CONTRACT_INDEX)}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md font-normal text-sm"
                  >
                    {copySuccess ? "Copied!" : "Copy Contract Index"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Suspense>
  );
};

export default page;
