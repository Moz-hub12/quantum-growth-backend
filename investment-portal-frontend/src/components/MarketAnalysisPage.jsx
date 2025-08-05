import React from 'react';
import TradingViewChart from './TradingViewChart';

const MarketAnalysisPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Forex Market Analysis</h1>
      <p className="text-lg text-gray-700 mb-8 text-center">Explore real-time Forex market data and perform technical analysis with our integrated TradingView charts.</p>

      <div className="mb-12 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">EUR/USD Chart</h2>
        <TradingViewChart symbol="FX_IDC:EURUSD" interval="1D" theme="light" height={500} />
      </div>

      <div className="mb-12 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">USD/JPY Chart</h2>
        <TradingViewChart symbol="FX_IDC:USDJPY" interval="1D" theme="light" height={500} />
      </div>

      <div className="mb-12 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">GBP/USD Chart</h2>
        <TradingViewChart symbol="FX_IDC:GBPUSD" interval="1D" theme="light" height={500} />
      </div>

      <div className="mb-12 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">AUD/USD Chart</h2>
        <TradingViewChart symbol="FX_IDC:AUDUSD" interval="1D" theme="light" height={500} />
      </div>

      <div className="mb-12 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">USD/CAD Chart</h2>
        <TradingViewChart symbol="FX_IDC:USDCAD" interval="1D" theme="light" height={500} />
      </div>

      <div className="mb-12 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">USD/CHF Chart</h2>
        <TradingViewChart symbol="FX_IDC:USDCHF" interval="1D" theme="light" height={500} />
      </div>

      <div className="mb-12 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">NZD/USD Chart</h2>
        <TradingViewChart symbol="FX_IDC:NZDUSD" interval="1D" theme="light" height={500} />
      </div>

      <div className="text-center text-gray-600 text-sm mt-8">
        <p>Charts provided by <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">TradingView</a></p>
      </div>
    </div>
  );
};

export default MarketAnalysisPage;

