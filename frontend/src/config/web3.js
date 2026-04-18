import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, sepolia } from '@reown/appkit/networks'

// Get projectID from https://cloud.reown.com/
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID'

if (!projectId || projectId === 'YOUR_PROJECT_ID') {
  console.warn('Reown Project ID is missing. Please add VITE_REOWN_PROJECT_ID to your .env file.')
}

export const networks = [mainnet, sepolia]

// Set up Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig
