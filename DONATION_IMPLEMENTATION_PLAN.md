# Donation System Implementation Plan

This plan outlines the process for implementing a transparent, blockchain-verified donation system that converts crypto (ETH) to USD values for tracking goals and milestones.

## 1. Core Architecture

### Blockchain Layer
- **Network**: Sepolia Testnet (Ethereum).
- **Transaction**: Direct transfer from Donor Wallet to NGO Verified Wallet.
- **Verification**: Transaction Hash is captured and verified via `useWaitForTransactionReceipt`.

### Data Mapping (ETH to USD)
- **Problem**: Campaigns track goals in USD, but donations are made in ETH.
- **Solution**: Use a price oracle (or mock for academic purposes) to convert ETH value to USD at the time of donation.
- **Formula**: `USD_Amount = ETH_Amount * Current_ETH_Price`.

## 2. Process Flow

1.  **Initiation**: Donor enters ETH amount on [CampaignDetail.jsx](file:///e:/dvd/DeReFund/frontend/src/pages/public/CampaignDetail.jsx).
2.  **Conversion**: Frontend displays the approximate USD value before the donor confirms.
3.  **Transaction**: Donor triggers `sendTransaction`. MetaMask/Wallet popup appears.
4.  **Confirmation**: Frontend waits for the block confirmation.
5.  **Recording**:
    -   Frontend calls a new backend endpoint `/donations/record`.
    -   Payload: `campaign_id`, `donor_address`, `tx_hash`, `eth_amount`, `usd_amount`.
6.  **Public Ledger Update**: The backend adds this to the `donations` table, which the [PublicLedger.jsx](file:///e:/dvd/DeReFund/frontend/src/pages/public/PublicLedger.jsx) will now fetch from.
7.  **Campaign Progress**: The `current_amount` (USD) in the `campaigns` table is updated.

## 3. Milestone Integration

-   **Escrow**: Currently, donations go directly to the NGO. 
-   **Future Phase**: Donations will go to a **Campaign Smart Contract**. 
-   **Release**: Funds are released to the NGO's wallet only when a milestone is "Approved" by volunteers/admin.
-   **Transparency**: Every release (disbursement) will also appear on the Public Ledger as a "Milestone Payout" type.

## 4. Required Changes

### Backend
-   **Schema**: Ensure `donations` table tracks `tx_hash`, `currency` (ETH), and `amount_usd`.
-   **Controller**: Implement `recordDonation` logic to update campaign totals.

### Frontend
-   **Price Oracle**: Add a simple helper to fetch current ETH price (e.g., from CoinGecko API).
-   **Sync Logic**: Update `handleDonate` to call the backend after `isConfirmed` becomes true.
-   **Ledger**: Update `PublicLedger.jsx` to fetch real data from the `donations` API.

## 5. Security & Verification
-   Backend will periodically verify transaction hashes against the Sepolia explorer (using an Infura/Alchemy provider) to prevent fake donation records.
