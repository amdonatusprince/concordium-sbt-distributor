mod handlers;
mod types;
use crate::{handlers::*, types::*};
use anyhow::{anyhow, Context};
use clap::Parser;
use concordium_rust_sdk::{
    contract_client::ContractClient,
    types::{ContractAddress, WalletAccount},
    v2::{Endpoint, Scheme},
};
use dotenv::dotenv;
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    sync::Arc,
};
use tokio::sync::Mutex;
use tonic::transport::ClientTlsConfig;
use warp::Filter;

/// Structure used to receive the correct command line arguments.
#[derive(clap::Parser, Debug)]
#[clap(arg_required_else_help(true))]
#[clap(version, author)]
struct IdVerifierConfig {
    #[clap(
        long = "node",
        help = "GRPC V2 interface of the node.",
        default_value = "http://localhost:20000"
    )]
    endpoint: Endpoint,
    #[structopt(
        long = "port",
        default_value = "8100",
        help = "Port on which the server will listen on."
    )]
    port: u16,
    #[structopt(
        long = "smart-contract-index",
        default_value = "10266",
        help = "The smart contract index which the sponsored transaction is submitted to."
    )]
    smart_contract_index: u64,
    #[structopt(
        long = "log-level",
        default_value = "debug",
        help = "Maximum log level."
    )]
    log_level: log::LevelFilter,
    #[structopt(
        long = "public-folder",
        default_value = "public",
        help = "location of the folder to serve"
    )]
    public_folder: String,

    #[clap(
        long = "account",
        env = "ACCOUNT_KEYS_PATH",
        help = "Path to the account key file."
    )]
    keys_path: Option<PathBuf>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    let app = IdVerifierConfig::parse();
    let mut log_builder = env_logger::Builder::new();
    // only log the current module (main).
    log_builder.filter_level(app.log_level); // filter filter_module(module_path!(), app.log_level);
    log_builder.init();

    let endpoint = if app
        .endpoint
        .uri()
        .scheme()
        .map_or(false, |x| x == &Scheme::HTTPS)
    {
        app.endpoint.tls_config(ClientTlsConfig::new())?
    } else {
        app.endpoint
    };

    let mut node_client = concordium_rust_sdk::v2::Client::new(endpoint).await?;

    let cors = warp::cors()
        .allow_any_origin()
        .allow_header("Content-Type")
        .allow_methods(vec!["POST", "GET"]);

    log::debug!("Acquire keys.");

    // load account keys and sender address from a file
    // let keys: WalletAccount = serde_json::from_str(
    //     &std::fs::read_to_string(app.keys_path).context("Could not read the keys file.")?,
    // )
    // .context("Could not parse the keys file.")?;

    println!("Looking for keys at: {:?}", app.keys_path);

    // let keys_path = app.keys_path.unwrap_or_else(|| {
    //     PathBuf::from(std::env::var("ACCOUNT_KEYS_PATH").expect("ACCOUNT_KEYS_PATH .env not set"))
    // });

    // // Load account keys from the file
    // let keys: WalletAccount = serde_json::from_str(
    //     &std::fs::read_to_string(keys_path).context("Could not read the keys file.")?,
    // )
    // .context("Could not parse the keys file.")?;

    // Check for the file in multiple locations
    let possible_paths = vec![
        PathBuf::from("key.json"), // Local development
        PathBuf::from("/etc/secrets/key.json"), // Render secret file path
    ];

    let keys_path = possible_paths
        .into_iter()
        .find(|path| path.exists())
        .ok_or_else(|| anyhow!("Could not find account_keys.json"))?;

    log::debug!("Using keys from: {:?}", keys_path);

    // Load account keys from the file
    let keys: WalletAccount = serde_json::from_str(
        &std::fs::read_to_string(&keys_path).context("Could not read the keys file.")?,
    )
    .context("Could not parse the keys file.")?;

    let key_update_operator: Arc<WalletAccount> = Arc::new(keys);

    let key_transfer = key_update_operator.clone();

    let key_mint = Arc::clone(&key_update_operator);

    log::debug!("Acquire nonce of wallet account.");

    let nonce_response = node_client
        .get_next_account_sequence_number(&key_update_operator.address)
        .await
        .map_err(|e| {
            log::warn!("NonceQueryError {:#?}.", e);
            LogError::NonceQueryError
        })?;

    let contract_client = ContractClient::<()>::create(
        node_client,
        ContractAddress {
            index: app.smart_contract_index,
            subindex: 0,
        },
    )
    .await
    .map_err(LogError::FailedToCreateContractClient)?;

    let state_update_operator = Server {
        nonce: Arc::new(Mutex::new(nonce_response.nonce)),
        rate_limits: Arc::new(Mutex::new(HashMap::new())),
        contract_client: Arc::new(Mutex::new(contract_client.clone())),
    };

    let state_transfer = state_update_operator.clone();

    let state_mint = Server {
        nonce: Arc::new(Mutex::new(nonce_response.nonce)),
        rate_limits: Arc::new(Mutex::new(HashMap::new())),
        contract_client: Arc::new(Mutex::new(contract_client.clone())),
    };

    // 1. Provide submit update operator
    let provide_submit_update_operator = warp::post()
        .and(warp::filters::body::content_length_limit(50 * 1024))
        .and(warp::path!("api" / "submitUpdateOperator"))
        .and(warp::body::json())
        .and_then(move |request: UpdateOperatorInputParams| {
            log::debug!("Process update operator transaction.");

            handle_signature_update_operator(
                key_update_operator.clone(), // Use cloned version
                request,
                app.smart_contract_index,
                state_update_operator.clone(),
            )
        });

    // 2. Provide submit transfer
    let provide_submit_transfer = warp::post()
        .and(warp::filters::body::content_length_limit(50 * 1024))
        .and(warp::path!("api" / "submitTransfer"))
        .and(warp::body::json())
        .and_then(move |request: TransferInputParams| {
            log::debug!("Process transfer transaction.");

            handle_signature_transfer(
                key_transfer.clone(), // Use cloned version
                request,
                app.smart_contract_index,
                state_transfer.clone(),
            )
        });

    // 3. Provide submit mint
    let provide_submit_mint = warp::post()
        .and(warp::filters::body::content_length_limit(50 * 1024))
        .and(warp::path!("api" / "submitMint"))
        .and(warp::body::json())
        .and_then(move |request: MintInputParams| {
            log::debug!("Process mint transaction.");

            handle_signature_mint(
                key_mint.clone(), // Use cloned version
                request,
                app.smart_contract_index,
                state_mint.clone(),
            )
        });

    log::debug!("Get public files to serve.");

    // // Check if the front end has been built and the public folder exists.
    // if !Path::new(&app.public_folder).exists() {
    //     return Err(anyhow!(LogError::PublicFolderDoesNotExist));
    // }

    // let serve_public_files = warp::get().and(warp::fs::dir(app.public_folder));

    // log::debug!("Serve response back to frontend.");

    let server = provide_submit_update_operator
        .or(provide_submit_transfer)
        .or(provide_submit_mint)
        // .or(serve_public_files)
        .recover(handle_rejection)
        .with(cors)
        .with(warp::trace::request());
    warp::serve(server).run(([0, 0, 0, 0], app.port)).await;

    Ok(())
}
