const fs = require('fs');

console.log('🔄 Merging all SLIP-0044 data sources...');

try {
  // Load all data sources
  const officialData = JSON.parse(fs.readFileSync('src/slip44-official-complete.json', 'utf8'));
  const currentData = JSON.parse(fs.readFileSync('src/slip44-complete.json', 'utf8'));
  
  console.log(`📥 Official entries: ${Object.keys(officialData).length}`);
  console.log(`📥 Current enhanced entries: ${Object.keys(currentData).length}`);
  
  // Merge all data (current enhanced data takes priority for conflicts)
  const mergedData = { ...officialData, ...currentData };
  
  console.log(`📊 Total merged entries: ${Object.keys(mergedData).length}`);
  
  // Show statistics
  const coinTypes = Object.keys(mergedData).map(Number).sort((a, b) => a - b);
  const highest = Math.max(...coinTypes);
  const lowest = Math.min(...coinTypes);
  
  console.log(`📈 Coin type range: ${lowest} to ${highest}`);
  
  // Check for specific coin types user mentioned
  console.log('\n🔍 Checking for specific coin types:');
  const testCoinTypes = [20000714, 2000, 22000118, 1000, 60, 714];
  testCoinTypes.forEach(coinType => {
    if (mergedData[coinType]) {
      const entry = mergedData[coinType];
      console.log(`✅ ${coinType}: ${entry.symbol || 'N/A'} - ${entry.name}`);
    } else {
      console.log(`❌ ${coinType}: Not found`);
    }
  });
  
  // Network type distribution
  const entries = Object.values(mergedData);
  const mainnetCount = entries.filter(e => e.networkType === 'mainnet').length;
  const testnetCount = entries.filter(e => e.networkType === 'testnet').length;
  console.log(`\n🌐 Network distribution: ${mainnetCount} mainnet, ${testnetCount} testnet`);
  
  // Decimals coverage
  const withDecimals = entries.filter(e => e.decimals).length;
  console.log(`🔢 Entries with decimals: ${withDecimals}/${entries.length}`);
  
  // Save the final comprehensive dataset
  fs.writeFileSync('src/slip44-complete.json', JSON.stringify(mergedData, null, 2));
  console.log('\n💾 Saved final comprehensive dataset to slip44-complete.json');
  
  console.log('\n✅ Merge completed successfully!');
  console.log(`🎯 Final result: ${Object.keys(mergedData).length} total coin types`);
  
} catch (error) {
  console.error('❌ Error during merge:', error);
}
