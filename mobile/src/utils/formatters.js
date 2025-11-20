// Helper function to format price range display
export const formatPriceRange = (priceRange) => {
  const priceMap = {
    'GHC': '💰',
    'GHC GHC': '💰💰',
    'GHC GHC GHC': '💰💰💰',
    'GHC GHC GHC GHC': '💰💰💰💰'
  };
  return priceMap[priceRange] || '💰💰';
};

// Helper function to format currency
export const formatCurrency = (amount) => {
  return `GHC ${parseFloat(amount).toFixed(2)}`;
};
