use concordium_rust_sdk::{
    base::{contracts_common::NewReceiveNameError, smart_contracts::ExceedsParameterSize},
    cis2::{TokenId, Transfer, UpdateOperator},
    contract_client::{ContractClient, DecodedReason},
    endpoints::QueryError,
    smart_contracts::common::{
        self as concordium_std, AccountAddress, AccountSignatures, ContractAddress,
        OwnedEntrypointName, Serial, Timestamp,
    },
    types::{
        hashes::{HashBytes, TransactionMarker},
        Address, Nonce, RejectReason,
    },
};
use std::{collections::HashMap, sync::Arc};
use tokio::sync::Mutex;

#[derive(Debug, thiserror::Error)]
pub enum LogError {
    #[error("Nonce query error.")]
    NonceQueryError,
    #[error("Submit sponsored transaction error: {0}")]
    SubmitSponsoredTransactionError(QueryError),
    #[error("TokenAmount error.")]
    TokenAmountError,
    #[error("Rate limit error.")]
    RateLimitError,
    #[error("Signature error.")]
    SignatureError,
    #[error("Public folder does not exist. Build the front end first.")]
    PublicFolderDoesNotExist,
    #[error("AdditionalData error.")]
    AdditionalDataError,
    #[error("Node access error: {0}")]
    NodeAccess(#[from] QueryError),
    #[error("Simulation of transaction rejected with reject reason: {0:?}")]
    TransactionSimulationError(RejectReason),
    #[error(
        "Simulation of transaction rejected in smart contract with decoded reject reason: `{0}` \
         derived from: {1:?}."
    )]
    TransactionSimulationDecodedError(DecodedReason, RejectReason),
    #[error("Failed to create contract client: {0:?}")]
    FailedToCreateContractClient(QueryError),
    #[error("Invalid receive name: {0}")]
    ReceiveNameError(#[from] NewReceiveNameError),
    #[error("The input parameter exceeds the length limit: {0}")]
    ParameterSizeError(#[from] ExceedsParameterSize),
}

impl warp::reject::Reject for LogError {}

#[derive(serde::Serialize)]
/// Response in case of an error. This is going to be encoded as a JSON body
/// with fields 'code' and 'message'.
pub struct ErrorResponse {
    pub code: u16,
    pub message: String,
}

#[derive(serde::Deserialize, serde::Serialize, Debug, Clone)]
pub struct UpdateOperatorInputParams {
    pub signer: AccountAddress,
    pub nonce: u64,
    pub signature: String,
    pub operator: AccountAddress,
    pub add_operator: bool,
    pub timestamp: Timestamp,
}

#[derive(serde::Deserialize, serde::Serialize, Debug, Clone)]
pub struct TransferInputParams {
    pub signer: AccountAddress,
    pub nonce: u64,
    pub signature: String,
    pub token_id: TokenId,
    pub from: AccountAddress,
    pub to: AccountAddress,
    pub timestamp: Timestamp,
}

// #[derive(Serial, Debug, Clone, Deserial)]
// pub struct MintParams {
//     /// Owner of the newly minted tokens.
//     pub owner: Address,
//     pub token_metadata_base_url: String,
//     // / A collection of tokens to mint.
//     // #[concordium(size_length = 1)]
//     // pub tokens: collections::BTreeSet<ContractTokenId>,
// }

#[derive(Serial, Debug, Clone)]
pub struct MintParams(#[concordium(size_length = 2)] pub Vec<MintData>);

/// Structure representing the data needed to mint a single token.
#[derive(Serial, Debug, Clone)]
pub struct MintData {
    /// Owner of the newly minted token.
    pub owner: Address,
    /// The base URL for the token metadata.
    pub token_metadata_base_url: String,
}

#[derive(Debug, Serial, Clone)]
pub struct TransferParams(#[concordium(size_length = 2)] pub Vec<Transfer>);

#[derive(Debug, Serial, Clone)]
pub struct UpdateOperatorParams(#[concordium(size_length = 2)] pub Vec<UpdateOperator>);

#[derive(Debug, Serial)]
pub struct PermitParam {
    pub signature: AccountSignatures,
    pub signer: AccountAddress,
    pub message: PermitMessage,
}

#[derive(serde::Deserialize, serde::Serialize, Debug, Clone)]
pub struct TxHash {
    pub tx_hash: HashBytes<TransactionMarker>,
}

#[derive(Debug, Serial, Clone)]
pub struct PermitMessage {
    pub contract_address: ContractAddress,
    pub nonce: u64,
    pub timestamp: Timestamp,
    pub entry_point: OwnedEntrypointName,
    #[concordium(size_length = 2)]
    pub payload: Vec<u8>,
}

#[derive(Clone)]
pub struct Server {
    /// The contract client used to submit transactions to the smart contract instance.
    pub contract_client: Arc<Mutex<ContractClient<()>>>,
    /// The nonce of the sponsorer account at the backend.
    pub nonce: Arc<Mutex<Nonce>>,
    // The rate_limits are transient and are reset on server restart.
    pub rate_limits: Arc<Mutex<HashMap<AccountAddress, u8>>>,
}
