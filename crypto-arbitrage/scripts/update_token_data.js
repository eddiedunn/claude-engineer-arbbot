const fs = require('fs');
const yaml = require('js-yaml');
const axios = require('axios');

// Read YAML configuration
const config = yaml.load(fs.readFileSync('./config/tokens.yaml', 'utf8'));

// Function to fetch token info from 1inch API
async function fetchTokenInfo(tokenAddress) {
    try {
        const response = await axios.get(`${config.api.base_url}/1/token/${tokenAddress}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching token info for ${tokenAddress}:`, error.message);
        return null;
    }
}

// Function to fetch liquidity sources (DEXes) from 1inch API
async function fetchLiquiditySources() {
    try {
        const response = await axios.get(`${config.api.base_url}/${config.api.chain_id}/liquidity-sources`);
        return response.data.protocols;
    } catch (error) {
        console.error('Error fetching liquidity sources:', error.message);
        return [];
    }
}

// Function to fetch and update token data
async function updateTokenData() {
    const tokenData = {};
    const dexes = await fetchLiquiditySources();

    // Fetch and update token information
    for (const token of config.tokens) {
        const tokenInfo = await fetchTokenInfo(token.address);
        if (tokenInfo) {
            tokenData[token.symbol] = {
                address: token.address,
                decimals: tokenInfo.decimals,
                name: tokenInfo.name,
                logoURI: tokenInfo.logoURI
            };
        } else {
            tokenData[token.symbol] = {
                address: token.address,
                decimals: null,
                name: null,
                logoURI: null
            };
        }
    }

    // Update DEX information
    const updatedDexes = dexes.filter(dex => config.dexes.includes(dex.title));

    // Combine token and DEX data
    const updatedData = {
        tokens: tokenData,
        dexes: updatedDexes,
        lastUpdated: new Date().toISOString()
    };

    // Write updated data to JSON file
    fs.writeFileSync('./config/token_data.json', JSON.stringify(updatedData, null, 2));
    console.log('Token data updated successfully');
}

// Run the update function
updateTokenData().catch(console.error);