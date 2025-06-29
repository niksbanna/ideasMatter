import algosdk from 'algosdk';

// Algorand configuration for TestNet
const algodToken = '';
const algodServer = 'https://testnet-api.algonode.cloud';
const algodPort = 443;

export const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

export interface VoteTransaction {
  proposalId: string;
  voterAddress: string;
  voteType: 'up' | 'down' | 'yes' | 'no' | 'like';
  timestamp: number;
  txId?: string;
}

export interface AlgorandVoteResult {
  success: boolean;
  txId?: string;
  error?: string;
  confirmedRound?: number;
}

// Smart contract application ID for voting (would be deployed separately)
const VOTING_APP_ID = 0; // Replace with actual deployed app ID

export const submitVoteToBlockchain = async (
  voterAccount: algosdk.Account,
  proposalId: string,
  voteType: 'up' | 'down' | 'yes' | 'no' | 'like'
): Promise<AlgorandVoteResult> => {
  try {
    // Get suggested transaction parameters
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    // Create vote data
    const voteData: VoteTransaction = {
      proposalId,
      voterAddress: voterAccount.addr,
      voteType,
      timestamp: Date.now()
    };
    
    // Create note with vote data (max 1024 bytes)
    const noteData = {
      type: 'VOTE',
      proposal: proposalId.substring(0, 8), // Truncate for space
      vote: voteType,
      platform: 'IdeasMatter',
      timestamp: voteData.timestamp
    };
    const note = new TextEncoder().encode(JSON.stringify(noteData));
    
    if (note.length > 1024) {
      throw new Error('Vote data too large for transaction note');
    }
    
    // Create transaction (minimal ALGOs transfer to record vote)
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: voterAccount.addr,
      to: voterAccount.addr, // Self-transaction to store vote data
      amount: 1000, // 0.001 ALGO (minimal amount)
      note: note,
      suggestedParams: suggestedParams,
    });
    
    // Sign transaction
    const signedTxn = txn.signTxn(voterAccount.sk);
    
    // Submit transaction
    const txId = txn.txID().toString();
    await algodClient.sendRawTransaction(signedTxn).do();
    
    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
    
    return {
      success: true,
      txId: txId,
      confirmedRound: confirmedTxn['confirmed-round']
    };
  } catch (error) {
    console.error('Error submitting vote to blockchain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown blockchain error'
    };
  }
};

export const getVoteHistory = async (proposalId: string): Promise<VoteTransaction[]> => {
  try {
    // In a production environment, you would use Algorand Indexer API
    // to efficiently query transactions with specific note patterns
    
    // For now, return mock data structure
    // In reality, you'd query: /v2/transactions?note-prefix=<base64_encoded_search>
    
    return [];
  } catch (error) {
    console.error('Error fetching vote history:', error);
    return [];
  }
};

export const verifyVoteTransaction = async (txId: string): Promise<VoteTransaction | null> => {
  try {
    // Get transaction details
    const txnInfo = await algodClient.pendingTransactionInformation(txId).do();
    
    if (txnInfo.note) {
      // Decode note data
      const noteBytes = new Uint8Array(Buffer.from(txnInfo.note, 'base64'));
      const noteString = new TextDecoder().decode(noteBytes);
      const voteData = JSON.parse(noteString);
      
      if (voteData.type === 'VOTE' && voteData.platform === 'IdeasMatter') {
        return {
          proposalId: voteData.proposal,
          voterAddress: txnInfo.from,
          voteType: voteData.vote,
          timestamp: voteData.timestamp,
          txId: txId
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying vote transaction:', error);
    return null;
  }
};

export const generateAccount = (): algosdk.Account => {
  return algosdk.generateAccount();
};

export const isValidAddress = (address: string): boolean => {
  return algosdk.isValidAddress(address);
};

export const getAccountBalance = async (address: string): Promise<number> => {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    return accountInfo.amount; // Amount in microALGOs
  } catch (error) {
    console.error('Error getting account balance:', error);
    return 0;
  }
};

export const formatAlgoAmount = (microAlgos: number): string => {
  return (microAlgos / 1000000).toFixed(6) + ' ALGO';
};

// Wallet integration utilities
export const connectWallet = async (): Promise<{ address: string; provider: string } | null> => {
  try {
    // Check if Pera Wallet is available
    if (typeof window !== 'undefined' && (window as any).PeraWallet) {
      const peraWallet = (window as any).PeraWallet;
      const accounts = await peraWallet.connect();
      if (accounts.length > 0) {
        return {
          address: accounts[0],
          provider: 'Pera Wallet'
        };
      }
    }
    
    // Check if Defly is available
    if (typeof window !== 'undefined' && (window as any).DeflyWalletConnect) {
      const deflyWallet = (window as any).DeflyWalletConnect;
      const accounts = await deflyWallet.connect();
      if (accounts.length > 0) {
        return {
          address: accounts[0],
          provider: 'Defly'
        };
      }
    }
    
    // Fallback: generate temporary account for demo
    const account = generateAccount();
    return {
      address: account.addr,
      provider: 'Demo Account'
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return null;
  }
};

export const disconnectWallet = async (): Promise<void> => {
  try {
    if (typeof window !== 'undefined') {
      if ((window as any).PeraWallet) {
        await (window as any).PeraWallet.disconnect();
      }
      if ((window as any).DeflyWalletConnect) {
        await (window as any).DeflyWalletConnect.disconnect();
      }
    }
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
  }
};

// Demo account for testing (DO NOT use in production)
export const createDemoAccount = (): algosdk.Account => {
  // Generate a new account for demo purposes
  const account = algosdk.generateAccount();
  
  // In a real application, you would fund this account through TestNet faucet
  console.log('Demo account created:', account.addr);
  console.log('Fund this account at: https://testnet.algoexplorer.io/dispenser');
  
  return account;
};

// Blockchain voting status tracking
export interface BlockchainVoteStatus {
  isOnChain: boolean;
  txId?: string;
  confirmedRound?: number;
  timestamp?: number;
  explorerUrl?: string;
}

export const getVoteBlockchainStatus = async (proposalId: string, voterAddress: string): Promise<BlockchainVoteStatus> => {
  try {
    // In production, query Algorand Indexer for transactions from this address
    // with notes containing the proposal ID
    
    // For demo, return mock status
    return {
      isOnChain: false
    };
  } catch (error) {
    console.error('Error checking blockchain vote status:', error);
    return {
      isOnChain: false
    };
  }
};

export const getTransactionExplorerUrl = (txId: string): string => {
  return `https://testnet.algoexplorer.io/tx/${txId}`;
};