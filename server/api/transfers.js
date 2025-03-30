const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const TOKEN_CONTRACTS = {
    'usdc': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    'usdt': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    'dai': '0x6B175474E89094C44Da98b954EedeAC495271d0F'
};

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ALCHEMY_ETH_MAINNET_URL = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

const handler = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { token, fromAddress, toAddress, mode } = req.body;
        let transfers = [];
        
        if (mode === 'from' || mode === 'both') {
            const fromTransfers = await fetchTransfers(token, fromAddress, null);
            transfers = transfers.concat(fromTransfers);
        }
        
        if (mode === 'to' || mode === 'both') {
            const toTransfers = await fetchTransfers(token, null, toAddress);
            transfers = transfers.concat(toTransfers);
        }
        
        if (mode === 'between') {
            const aToBAll = await fetchTransfers(token, fromAddress, null);
            const aToBfiltered = aToBAll.filter(t => 
                t.toAddress && t.toAddress.toLowerCase() === toAddress.toLowerCase()
            );
            
            const bToAAll = await fetchTransfers(token, toAddress, null);
            const bToAfiltered = bToAAll.filter(t => 
                t.toAddress && t.toAddress.toLowerCase() === fromAddress.toLowerCase()
            );
            
            transfers = transfers.concat(aToBfiltered, bToAfiltered);
        }
        
        res.json({ transfers: deduplicateTransfers(transfers) });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
};

async function fetchTransfers(tokenName, fromAddress, toAddress) {
    const contractAddress = TOKEN_CONTRACTS[tokenName.toLowerCase()];
    if (!contractAddress) {
        throw new Error(`Unknown token: ${tokenName}`);
    }
    
    const params = {
        fromBlock: "0x0",
        toBlock: "latest",
        category: ["erc20"],
        contractAddresses: [contractAddress],
        withMetadata: true
    };
    
    if (fromAddress) params.fromAddress = fromAddress;
    if (toAddress) params.toAddress = toAddress;
    
    const response = await fetch(ALCHEMY_ETH_MAINNET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "alchemy_getAssetTransfers",
            id: 1,
            params: [params]
        })
    });
    
    if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.status}`);
    }
    
    const data = await response.json();
    return parseTransfers(data);
}

function parseTransfers(json) {
    if (!json.result || !json.result.transfers) return [];
    
    return json.result.transfers.map(tx => ({
        blockNum: tx.blockNum || null,
        fromAddress: tx.from || null,
        toAddress: tx.to || null,
        amount: tx.value || "0",
        transactionHash: tx.hash || null,
        token: tx.asset || null,
        metadata: tx.metadata ? JSON.stringify(tx.metadata) : null
    }));
}

function deduplicateTransfers(transfers) {
    const seen = new Set();
    return transfers.filter(t => {
        const key = [
            t.transactionHash || '',
            (t.fromAddress || '').toLowerCase(),
            (t.toAddress || '').toLowerCase(),
            t.amount
        ].join('|');
        
        if (!seen.has(key)) {
            seen.add(key);
            return true;
        }
        return false;
    });
}

module.exports = handler;
