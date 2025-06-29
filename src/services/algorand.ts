import algosdk from 'algosdk';

// Algorand configuration for TestNet
const algodToken = '';
const algodServer = 'https://testnet-api.algonode.cloud';
const algodPort = 443;

export const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

export interface VoteTransaction {
  proposalId: string;
  voterAddress: string;
  voteType: 'up' | 'down';
  timestamp: number;
}

export const submitVote = async (
  voterAccount: algosdk.Account,
  proposalId: string,
  voteType: 'up' | 'down'
): Promise<string> => {
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
    
    // Create note with vote data
    const note = new TextEncoder().encode(JSON.stringify(voteData));
    
    // Create transaction
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: voterAccount.addr,
      to: voterAccount.addr, // Self-transaction to store vote data
      amount: 0, // No ALGOs transferred
      note: note,
      suggestedParams: suggestedParams,
    });
    
    // Sign transaction
    const signedTxn = txn.signTxn(voterAccount.sk);
    
    // Submit transaction
    const txId = txn.txID().toString();
    await algodClient.sendRawTransaction(signedTxn).do();
    
    // Wait for confirmation
    await algosdk.waitForConfirmation(algodClient, txId, 3);
    
    return txId;
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw new Error('Failed to submit vote to blockchain');
  }
};

export const getVoteHistory = async (proposalId: string): Promise<VoteTransaction[]> => {
  try {
    // This is a simplified implementation
    // In a real-world scenario, you'd need to implement proper indexing
    // or use Algorand's indexer API to efficiently query vote transactions
    
    // For now, return mock data
    return [
      {
        proposalId,
        voterAddress: 'EXAMPLE_ADDRESS_1',
        voteType: 'up',
        timestamp: Date.now() - 86400000
      },
      {
        proposalId,
        voterAddress: 'EXAMPLE_ADDRESS_2',
        voteType: 'up',
        timestamp: Date.now() - 43200000
      }
    ];
  } catch (error) {
    console.error('Error fetching vote history:', error);
    return [];
  }
};

export const generateAccount = (): algosdk.Account => {
  return algosdk.generateAccount();
};

export const isValidAddress = (address: string): boolean => {
  return algosdk.isValidAddress(address);
};