const fs = require('fs');
const https = require('https');

console.log('📥 Fetching complete SLIP-0044 data from official source...');

// Fetch the complete markdown document
https.get('https://raw.githubusercontent.com/satoshilabs/slips/master/slip-0044.md', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      console.log(`📄 Downloaded ${data.length} characters from official source`);
      
      // Parse the markdown table
      const lines = data.split('\n');
      const entries = {};
      let foundTable = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip until we find the table
        if (line.includes('| Coin type  | Path component') || line.includes('Coin type') && line.includes('|')) {
          foundTable = true;
          continue;
        }
        
        // Skip header separators
        if (line.includes('---') || line.includes('===')) {
          continue;
        }
        
        // Process table rows
        if (foundTable && line.startsWith('|') && line.includes('|')) {
          const parts = line.split('|').map(p => p.trim()).filter(p => p);
          
          if (parts.length >= 3) {
            const coinTypeStr = parts[0];
            const pathComponent = parts[1];
            const symbol = parts[2] || '';
            const name = parts[3] || '';
            
            // Extract coin type number
            const coinTypeMatch = coinTypeStr.match(/^\d+/);
            if (coinTypeMatch) {
              const coinType = parseInt(coinTypeMatch[0]);
              
              // Only process valid entries
              if (!isNaN(coinType) && name && name !== 'Coin') {
                entries[coinType] = {
                  index: coinType.toString(),
                  hex: pathComponent.replace('0x', '0x').toLowerCase(),
                  symbol: symbol || '',
                  name: name,
                  decimals: getDefaultDecimals(name, symbol),
                  networkType: name.toLowerCase().includes('testnet') ? 'testnet' : 'mainnet',
                  aliases: [
                    symbol ? symbol.toLowerCase() : '',
                    name.toLowerCase()
                  ].filter(a => a),
                  tokenStandards: getTokenStandards(name, symbol)
                };
                
                console.log(`✓ Parsed: ${coinType} - ${symbol} - ${name}`);
              }
            }
          }
        }
      }
      
      console.log(`\n📊 Parsed ${Object.keys(entries).length} entries from official source`);
      
      // Check for specific coin type 20000714
      if (entries[20000714]) {
        console.log(`🎯 Found coin type 20000714:`, entries[20000714]);
      } else {
        console.log(`❌ Coin type 20000714 not found in official source`);
        console.log(`🔍 Checking nearby coin types...`);
        
        // Check for similar numbers
        const similarTypes = Object.keys(entries)
          .map(Number)
          .filter(n => n.toString().includes('2000') || n.toString().includes('0714'))
          .sort((a, b) => a - b);
          
        if (similarTypes.length > 0) {
          console.log(`📝 Found similar coin types:`, similarTypes);
          similarTypes.forEach(type => {
            console.log(`  ${type}: ${entries[type].symbol} - ${entries[type].name}`);
          });
        }
      }
      
      // Save the complete parsed data
      fs.writeFileSync('src/slip44-official-complete.json', JSON.stringify(entries, null, 2));
      console.log(`💾 Saved complete official data to slip44-official-complete.json`);
      
      // Show statistics
      const highestCoinType = Math.max(...Object.keys(entries).map(Number));
      const lowestCoinType = Math.min(...Object.keys(entries).map(Number));
      console.log(`📈 Coin type range: ${lowestCoinType} to ${highestCoinType}`);
      
    } catch (error) {
      console.error('❌ Error processing data:', error);
    }
  });
}).on('error', (err) => {
  console.error('❌ Download error:', err.message);
});

// Helper functions
function getDefaultDecimals(name, symbol) {
  const lowerName = name.toLowerCase();
  const lowerSymbol = (symbol || '').toLowerCase();

  if (lowerName.includes('bitcoin') || lowerSymbol === 'btc') return 8;
  if (lowerName.includes('ethereum') || lowerSymbol === 'eth') return 18;
  if (lowerName.includes('binance') || lowerSymbol === 'bnb') return 18;
  if (lowerName.includes('tron') || lowerSymbol === 'trx') return 6;
  if (lowerName.includes('solana') || lowerSymbol === 'sol') return 9;
  if (lowerName.includes('cardano') || lowerSymbol === 'ada') return 6;
  if (lowerName.includes('polkadot') || lowerSymbol === 'dot') return 10;
  if (lowerName.includes('chainlink') || lowerSymbol === 'link') return 18;
  if (lowerName.includes('litecoin') || lowerSymbol === 'ltc') return 8;
  if (lowerName.includes('dogecoin') || lowerSymbol === 'doge') return 8;
  if (lowerName.includes('testnet')) return 18;

  return 18; // Default for most modern chains
}

function getTokenStandards(name, symbol) {
  const lowerName = name.toLowerCase();
  const lowerSymbol = (symbol || '').toLowerCase();

  if (lowerName.includes('ethereum') || lowerSymbol === 'eth') {
    return ['ERC-20', 'ERC-721', 'ERC-1155'];
  } else if (lowerName.includes('binance') || lowerSymbol === 'bnb') {
    return ['BEP-20', 'BEP-721'];
  } else if (lowerName.includes('tron') || lowerSymbol === 'trx') {
    return ['TRC-20', 'TRC-721', 'TRC-10'];
  } else if (lowerName.includes('solana') || lowerSymbol === 'sol') {
    return ['SPL Token', 'SPL NFT'];
  } else if (lowerName.includes('polygon') || lowerSymbol === 'matic') {
    return ['ERC-20', 'ERC-721', 'ERC-1155'];
  }

  return [];
}
