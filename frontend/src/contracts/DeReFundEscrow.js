export const derefundEscrowAbi = [
  {
    type: 'function',
    name: 'donate',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'submitProof',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'milestoneId', type: 'uint256' },
      { name: 'proofURI', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'approveAndRelease',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'milestoneId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'addMilestone',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getMilestone',
    stateMutability: 'view',
    inputs: [{ name: 'milestoneId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'title', type: 'string' },
          { name: 'amount', type: 'uint256' },
          { name: 'proofURI', type: 'string' },
          { name: 'proofSubmitted', type: 'bool' },
          { name: 'approved', type: 'bool' },
          { name: 'released', type: 'bool' },
          { name: 'releasedAt', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'milestoneCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'targetAmount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'totalDonated',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'totalReleased',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'DonationReceived',
    inputs: [
      { name: 'donor', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'totalDonated', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'FundsReleased',
    inputs: [
      { name: 'milestoneId', type: 'uint256', indexed: true },
      { name: 'ngoWallet', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
];
