import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ComposedChart, Area, Line, ReferenceLine, Cell } from 'recharts';

// Currency constants - must be defined before components that use them
const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'SGD', 'NOK', 'SEK', 'MXN', 'ZAR', 'TRY', 'BRL', 'INR', 'RUB', 'PLN', 'CZK', 'HUF', 'PEN'];

const currencyColors = {
  USD: '#22c55e', EUR: '#10b981', GBP: '#ef4444', JPY: '#f97316', CHF: '#a855f7',
  AUD: '#eab308', CAD: '#ec4899', NZD: '#14b8a6', SGD: '#06b6d4', NOK: '#0ea5e9',
  SEK: '#10b981', MXN: '#d946ef', ZAR: '#84cc16', TRY: '#fb923c', BRL: '#34d399',
  INR: '#f472b6', RUB: '#64748b', PLN: '#a78bfa', CZK: '#fbbf24', HUF: '#10b981',
  PEN: '#10b981',
};

// Sidebar Menu Configuration
const menuItems = [
  { id: 'home', name: 'Dashboard', icon: '🏠', description: 'Overview & quick access' },
  { id: 'trade-station', name: 'Trade Station', icon: '📊', description: 'Currency strength analysis & AI charts' },
  { id: 'news-calendar', name: 'Tradable News Calendar', icon: '📰', description: 'High-impact economic events' },
  { id: 'cot-data', name: 'COT Data', icon: '📈', description: 'Commitment of Traders reports' },
  { id: 'trade-journal', name: 'Trade Journal', icon: '📓', description: 'Track and analyze your trades' },
  { id: 'seasonality', name: 'Seasonality Dashboard', icon: '🗓️', description: 'Historical seasonal patterns' },
  { id: 'contract-specs', name: 'Contract Specifications', icon: '📋', description: 'Futures contract data' },
  { id: 'geometry-scanner', name: 'Geometry Scanner', icon: '📐', description: 'Pattern recognition & analysis' },
];

// Main Dashboard Home Page
const MainDashboard = ({ onNavigate, scores, sorted, pairs, cotData }) => {
  const topCurrencies = sorted?.slice(0, 5) || [];
  const bottomCurrencies = sorted?.slice(-5).reverse() || [];
  const strongPairs = pairs?.filter(p => p.signal === 'Strong').slice(0, 6) || [];
  
  const quickStats = [
    { label: 'Currencies Tracked', value: '21', icon: '💱', colorClass: 'text-cyan-400' },
    { label: 'Economic Indicators', value: '23', icon: '📊', colorClass: 'text-brand-400' },
    { label: 'Currency Pairs', value: '210', icon: '🔄', colorClass: 'text-emerald-400' },
    { label: 'COT Reports', value: '9', icon: '📈', colorClass: 'text-amber-400' },
  ];

  const features = [
    {
      id: 'trade-station',
      title: 'Trade Station',
      icon: '📊',
      description: 'Comprehensive currency strength analysis with 23 economic indicators, weighted scoring, and AI-powered technical analysis.',
      stats: ['21 Currencies', '23 Indicators', 'AI Charts'],
      color: 'from-brand-400 to-brand-500',
      highlights: ['Real-time Rankings', 'Strength Scores', 'Radar Analysis', 'Pair Forecasts']
    },
    {
      id: 'news-calendar',
      title: 'Tradable News Calendar',
      icon: '📰',
      description: 'High-impact economic events with tradable statistics including pip ranges, direction accuracy, and spike data.',
      stats: ['Weekly View', 'Multi-Timezone', 'Trade Stats'],
      color: 'from-amber-500 to-brand-500',
      highlights: ['2H-50+ Stats', 'Avg Range', 'Direction %', 'Spike Data']
    },
    {
      id: 'cot-data',
      title: 'COT Data',
      icon: '📈',
      description: 'CFTC Commitment of Traders positioning data showing institutional long/short positions and sentiment.',
      stats: ['9 Currencies', 'Weekly Updates', 'Net Positions'],
      color: 'from-emerald-500 to-teal-500',
      highlights: ['Long Positions', 'Short Positions', 'Net Changes', 'Sentiment']
    },
    {
      id: 'geometry-scanner',
      title: 'Geometry Scanner',
      icon: '📐',
      description: 'Advanced pattern recognition including Elliott Wave analysis, harmonic patterns, Gann tools, and Fibonacci clusters.',
      stats: ['Elliott Waves', 'Harmonics', 'Gann Tools'],
      color: 'from-brand-500 to-brand-500',
      highlights: ['Wave Analysis', 'Pattern Detection', 'Fib Clusters', 'Trading Signals']
    },
    {
      id: 'trade-journal',
      title: 'Trade Journal',
      icon: '📓',
      description: 'Track your trades, analyze performance metrics, and identify patterns in your trading behavior.',
      stats: ['Performance', 'Analytics', 'Insights'],
      color: 'from-rose-500 to-pink-500',
      highlights: ['Trade Log', 'Win Rate', 'P&L Tracking', 'Risk Analysis']
    },
    {
      id: 'seasonality',
      title: 'Seasonality Dashboard',
      icon: '🗓️',
      description: 'Historical seasonal patterns and tendencies for currencies, commodities, and indices.',
      stats: ['Monthly Trends', 'Historical Data', 'Patterns'],
      color: 'from-brand-500 to-brand-500',
      highlights: ['Monthly Bias', 'Yearly Cycles', 'Best Months', 'Worst Months']
    },
    {
      id: 'contract-specs',
      title: 'Contract Specifications',
      icon: '📋',
      description: 'Detailed futures and forex contract specifications including tick values, margins, and trading hours.',
      stats: ['Tick Values', 'Margins', 'Hours'],
      color: 'from-slate-500 to-gray-500',
      highlights: ['Contract Size', 'Tick Value', 'Margin Req', 'Trading Hours']
    },
  ];

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-brand-400 to-fuchsia-400 bg-clip-text text-transparent">
          Welcome to MMITPS
        </h1>
        <p className="text-slate-400 mt-2 text-lg">Multi-Market Institutional Trading Platform System</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, idx) => (
          <div key={idx} className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{stat.icon}</span>
              <div>
                <div className={`text-2xl font-bold ${stat.colorClass}`}>{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Market Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Currencies */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <span>🏆</span> Strongest Currencies
            </h3>
            <button onClick={() => onNavigate('trade-station')} className="text-xs text-cyan-400 hover:text-cyan-300">View All →</button>
          </div>
          <div className="space-y-3">
            {topCurrencies.map((curr, idx) => (
              <div key={curr} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-500 text-amber-900' : idx === 1 ? 'bg-slate-400 text-slate-900' : idx === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-700 text-slate-300'}`}>
                    {idx + 1}
                  </span>
                  <span className="font-bold" style={{ color: currencyColors[curr] }}>{curr}</span>
                </div>
                <span className="text-emerald-400 font-mono text-sm">{scores?.[curr]?.toFixed(1) || '0.0'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weakest Currencies */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <span>📉</span> Weakest Currencies
            </h3>
            <button onClick={() => onNavigate('trade-station')} className="text-xs text-cyan-400 hover:text-cyan-300">View All →</button>
          </div>
          <div className="space-y-3">
            {bottomCurrencies.map((curr, idx) => (
              <div key={curr} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-rose-500/20 text-rose-400">
                    {sorted?.length - idx}
                  </span>
                  <span className="font-bold" style={{ color: currencyColors[curr] }}>{curr}</span>
                </div>
                <span className="text-rose-400 font-mono text-sm">{scores?.[curr]?.toFixed(1) || '0.0'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strong Signals */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <span>🎯</span> Strong Signals
            </h3>
            <button onClick={() => onNavigate('trade-station')} className="text-xs text-cyan-400 hover:text-cyan-300">View All →</button>
          </div>
          <div className="space-y-2">
            {strongPairs.length > 0 ? strongPairs.map((pair, idx) => (
              <div key={pair.pair} className={`flex items-center justify-between p-2 rounded-lg ${pair.direction === 'Bullish' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                <span className="font-bold text-slate-200">{pair.pair}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${pair.direction === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {pair.direction === 'Bullish' ? '↑' : '↓'} {pair.diff}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${pair.direction === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {pair.direction}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-slate-500">No strong signals currently</div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-200 mb-4">🚀 Platform Features</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {features.map((feature) => (
          <div
            key={feature.id}
            onClick={() => onNavigate(feature.id)}
            className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 overflow-hidden hover:border-slate-600 transition-all cursor-pointer group hover:scale-[1.02]"
          >
            {/* Gradient Header */}
            <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
            
            <div className="p-5">
              {/* Icon & Title */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{feature.icon}</span>
                <h3 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
              </div>
              
              {/* Description */}
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{feature.description}</p>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-2 mb-4">
                {feature.stats.map((stat, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">{stat}</span>
                ))}
              </div>
              
              {/* Highlights */}
              <div className="flex flex-wrap gap-1">
                {feature.highlights.map((highlight, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-800/50 rounded text-xs text-slate-500">{highlight}</span>
                ))}
              </div>
              
              {/* Arrow */}
              <div className="mt-4 flex justify-end">
                <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-brand-400/10 via-brand-500/10 to-fuchsia-500/10 rounded-lg border border-slate-800 p-6">
        <h3 className="font-bold text-slate-200 mb-4">⚡ Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => onNavigate('trade-station')} className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 text-sm font-medium flex items-center gap-2">
            <span>📊</span> Analyze Currencies
          </button>
          <button onClick={() => onNavigate('news-calendar')} className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 hover:bg-amber-500/30 text-sm font-medium flex items-center gap-2">
            <span>📰</span> Check News Calendar
          </button>
          <button onClick={() => onNavigate('cot-data')} className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/30 text-sm font-medium flex items-center gap-2">
            <span>📈</span> View COT Data
          </button>
          <button onClick={() => onNavigate('geometry-scanner')} className="px-4 py-2 bg-brand-500/20 border border-brand-500/30 rounded-lg text-brand-400 hover:bg-brand-500/30 text-sm font-medium flex items-center gap-2">
            <span>📐</span> Scan Patterns
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-slate-600 text-xs">
        <p>MMITPS v2.0 • Multi-Market Institutional Trading Platform System</p>
        <p className="mt-1">Real-time Analysis • AI Technical Charts • Elliott Wave • COT Data • Economic Calendar</p>
      </div>
    </div>
  );
};

// Logo as base64
const MMITPS_LOGO = "data:image/webp;base64,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";

// Sidebar Component
const Sidebar = ({ isOpen, onToggle, activeMenu, onMenuChange }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 z-50 transition-all duration-300 ${isOpen ? 'w-72' : 'w-20'} flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <img 
                src={MMITPS_LOGO} 
                alt="MMITPS Logo" 
                className={`${isOpen ? 'w-14 h-14' : 'w-10 h-10'} object-contain rounded-lg transition-all duration-300`}
              />
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <h1 className="text-lg font-bold text-[var(--color-text-primary)] whitespace-nowrap">MMITPS INC</h1>
                <p className="text-xs text-slate-400 whitespace-nowrap">Trading The Institutional Way</p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button onClick={onToggle} className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500 transition-colors z-50">
          {isOpen ? '◀' : '▶'}
        </button>

        {/* Menu Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onMenuChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
                activeMenu === item.id
                  ? 'bg-gradient-to-r from-brand-400/20 to-brand-500/20 border border-cyan-500/30 text-cyan-300'
                  : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {isOpen && (
                <div className="text-left overflow-hidden">
                  <div className="font-medium text-sm whitespace-nowrap">{item.name}</div>
                  <div className="text-xs text-slate-500 truncate">{item.description}</div>
                </div>
              )}
              {!isOpen && activeMenu === item.id && (
                <span className="absolute left-0 w-1 h-8 bg-cyan-500 rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          {isOpen ? (
            <div className="text-xs text-slate-500 text-center">
              <p>MMITPS v2.0</p>
              <p className="mt-1">© 2026 Trading Platform</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="text-slate-500 text-lg">⚙️</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

// Placeholder Pages
const NewsCalendarPage = () => {
  const [selectedTimezone, setSelectedTimezone] = useState('EST');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [impactFilter, setImpactFilter] = useState('high');
  const [expandedEvent, setExpandedEvent] = useState(null);

  const timezones = [
    { id: 'EST', name: '(GMT-05:00) Eastern Time (US & Canada)' },
    { id: 'CST', name: '(GMT-06:00) Central Time (US & Canada)' },
    { id: 'PST', name: '(GMT-08:00) Pacific Time (US & Canada)' },
    { id: 'GMT', name: '(GMT+00:00) Greenwich Mean Time' },
    { id: 'CET', name: '(GMT+01:00) Central European Time' },
    { id: 'JST', name: '(GMT+09:00) Japan Standard Time' },
  ];

  // Tradable pairs mapping by currency
  const tradablePairsByCurrency = {
    USD: [
      { pair: 'EUR/USD', direction: 'Inverse', description: 'Sell on positive USD news', liquidity: 'Highest', spread: '0.1-0.3 pips' },
      { pair: 'GBP/USD', direction: 'Inverse', description: 'Sell on positive USD news', liquidity: 'Very High', spread: '0.3-0.8 pips' },
      { pair: 'USD/JPY', direction: 'Direct', description: 'Buy on positive USD news', liquidity: 'Very High', spread: '0.2-0.5 pips' },
      { pair: 'USD/CHF', direction: 'Direct', description: 'Buy on positive USD news', liquidity: 'High', spread: '0.5-1.2 pips' },
      { pair: 'USD/CAD', direction: 'Direct', description: 'Buy on positive USD news', liquidity: 'High', spread: '0.8-1.5 pips' },
      { pair: 'AUD/USD', direction: 'Inverse', description: 'Sell on positive USD news', liquidity: 'High', spread: '0.4-0.8 pips' },
      { pair: 'NZD/USD', direction: 'Inverse', description: 'Sell on positive USD news', liquidity: 'Medium', spread: '0.8-1.5 pips' },
    ],
    EUR: [
      { pair: 'EUR/USD', direction: 'Direct', description: 'Buy on positive EUR news', liquidity: 'Highest', spread: '0.1-0.3 pips' },
      { pair: 'EUR/GBP', direction: 'Direct', description: 'Buy on positive EUR news', liquidity: 'High', spread: '0.4-0.9 pips' },
      { pair: 'EUR/JPY', direction: 'Direct', description: 'Buy on positive EUR news', liquidity: 'High', spread: '0.5-1.2 pips' },
      { pair: 'EUR/CHF', direction: 'Direct', description: 'Buy on positive EUR news', liquidity: 'Medium', spread: '0.8-1.5 pips' },
      { pair: 'EUR/AUD', direction: 'Direct', description: 'Buy on positive EUR news', liquidity: 'Medium', spread: '1.0-2.0 pips' },
      { pair: 'EUR/CAD', direction: 'Direct', description: 'Buy on positive EUR news', liquidity: 'Medium', spread: '1.2-2.5 pips' },
    ],
    GBP: [
      { pair: 'GBP/USD', direction: 'Direct', description: 'Buy on positive GBP news', liquidity: 'Very High', spread: '0.3-0.8 pips' },
      { pair: 'EUR/GBP', direction: 'Inverse', description: 'Sell on positive GBP news', liquidity: 'High', spread: '0.4-0.9 pips' },
      { pair: 'GBP/JPY', direction: 'Direct', description: 'Buy on positive GBP news', liquidity: 'High', spread: '1.0-2.5 pips' },
      { pair: 'GBP/CHF', direction: 'Direct', description: 'Buy on positive GBP news', liquidity: 'Medium', spread: '1.5-3.0 pips' },
      { pair: 'GBP/AUD', direction: 'Direct', description: 'Buy on positive GBP news', liquidity: 'Medium', spread: '2.0-4.0 pips' },
      { pair: 'GBP/CAD', direction: 'Direct', description: 'Buy on positive GBP news', liquidity: 'Medium', spread: '2.0-4.0 pips' },
    ],
    JPY: [
      { pair: 'USD/JPY', direction: 'Inverse', description: 'Sell on positive JPY news', liquidity: 'Very High', spread: '0.2-0.5 pips' },
      { pair: 'EUR/JPY', direction: 'Inverse', description: 'Sell on positive JPY news', liquidity: 'High', spread: '0.5-1.2 pips' },
      { pair: 'GBP/JPY', direction: 'Inverse', description: 'Sell on positive JPY news', liquidity: 'High', spread: '1.0-2.5 pips' },
      { pair: 'AUD/JPY', direction: 'Inverse', description: 'Sell on positive JPY news', liquidity: 'Medium', spread: '1.0-2.0 pips' },
      { pair: 'CAD/JPY', direction: 'Inverse', description: 'Sell on positive JPY news', liquidity: 'Medium', spread: '1.2-2.5 pips' },
      { pair: 'CHF/JPY', direction: 'Inverse', description: 'Sell on positive JPY news', liquidity: 'Medium', spread: '1.5-3.0 pips' },
    ],
    AUD: [
      { pair: 'AUD/USD', direction: 'Direct', description: 'Buy on positive AUD news', liquidity: 'High', spread: '0.4-0.8 pips' },
      { pair: 'AUD/JPY', direction: 'Direct', description: 'Buy on positive AUD news', liquidity: 'Medium', spread: '1.0-2.0 pips' },
      { pair: 'AUD/NZD', direction: 'Direct', description: 'Buy on positive AUD news', liquidity: 'Medium', spread: '1.5-3.0 pips' },
      { pair: 'AUD/CAD', direction: 'Direct', description: 'Buy on positive AUD news', liquidity: 'Medium', spread: '1.5-3.0 pips' },
      { pair: 'EUR/AUD', direction: 'Inverse', description: 'Sell on positive AUD news', liquidity: 'Medium', spread: '1.0-2.0 pips' },
      { pair: 'GBP/AUD', direction: 'Inverse', description: 'Sell on positive AUD news', liquidity: 'Medium', spread: '2.0-4.0 pips' },
    ],
    NZD: [
      { pair: 'NZD/USD', direction: 'Direct', description: 'Buy on positive NZD news', liquidity: 'Medium', spread: '0.8-1.5 pips' },
      { pair: 'NZD/JPY', direction: 'Direct', description: 'Buy on positive NZD news', liquidity: 'Medium', spread: '1.5-3.0 pips' },
      { pair: 'AUD/NZD', direction: 'Inverse', description: 'Sell on positive NZD news', liquidity: 'Medium', spread: '1.5-3.0 pips' },
      { pair: 'NZD/CAD', direction: 'Direct', description: 'Buy on positive NZD news', liquidity: 'Low', spread: '2.0-4.0 pips' },
      { pair: 'NZD/CHF', direction: 'Direct', description: 'Buy on positive NZD news', liquidity: 'Low', spread: '2.5-5.0 pips' },
      { pair: 'EUR/NZD', direction: 'Inverse', description: 'Sell on positive NZD news', liquidity: 'Low', spread: '2.0-4.0 pips' },
    ],
    CAD: [
      { pair: 'USD/CAD', direction: 'Inverse', description: 'Sell on positive CAD news', liquidity: 'High', spread: '0.8-1.5 pips' },
      { pair: 'CAD/JPY', direction: 'Direct', description: 'Buy on positive CAD news', liquidity: 'Medium', spread: '1.2-2.5 pips' },
      { pair: 'CAD/CHF', direction: 'Direct', description: 'Buy on positive CAD news', liquidity: 'Low', spread: '2.0-4.0 pips' },
      { pair: 'EUR/CAD', direction: 'Inverse', description: 'Sell on positive CAD news', liquidity: 'Medium', spread: '1.2-2.5 pips' },
      { pair: 'GBP/CAD', direction: 'Inverse', description: 'Sell on positive CAD news', liquidity: 'Medium', spread: '2.0-4.0 pips' },
      { pair: 'AUD/CAD', direction: 'Inverse', description: 'Sell on positive CAD news', liquidity: 'Medium', spread: '1.5-3.0 pips' },
    ],
    CHF: [
      { pair: 'USD/CHF', direction: 'Inverse', description: 'Sell on positive CHF news', liquidity: 'High', spread: '0.5-1.2 pips' },
      { pair: 'EUR/CHF', direction: 'Inverse', description: 'Sell on positive CHF news', liquidity: 'Medium', spread: '0.8-1.5 pips' },
      { pair: 'GBP/CHF', direction: 'Inverse', description: 'Sell on positive CHF news', liquidity: 'Medium', spread: '1.5-3.0 pips' },
      { pair: 'CHF/JPY', direction: 'Direct', description: 'Buy on positive CHF news', liquidity: 'Medium', spread: '1.5-3.0 pips' },
      { pair: 'AUD/CHF', direction: 'Inverse', description: 'Sell on positive CHF news', liquidity: 'Low', spread: '2.0-4.0 pips' },
      { pair: 'CAD/CHF', direction: 'Inverse', description: 'Sell on positive CHF news', liquidity: 'Low', spread: '2.0-4.0 pips' },
    ],
  };

  // Sample news calendar data
  const newsData = [
    {
      day: 'SUN',
      date: 19,
      events: []
    },
    {
      day: 'MON',
      date: 20,
      events: []
    },
    {
      day: 'TUE',
      date: 21,
      events: [
        {
          time: '10:00am',
          currency: 'USD',
          flag: '🇺🇸',
          event: 'CB Consumer Confidence',
          tradableDeviation: '3.5',
          actual: null,
          forecast: '104.5',
          previous: '104.1',
          stats: { h2_50plus: '68.2%', range: '45 pips', direction: '92.1%', spike: '28 pips' },
          tradablePairs: tradablePairsByCurrency['USD'],
          tradingTips: [
            'Wait for actual release before entering',
            'Best traded within first 30 minutes',
            'Consider EUR/USD and USD/JPY for best liquidity',
            'Set stop loss 20-30 pips from entry'
          ]
        }
      ]
    },
    {
      day: 'WED',
      date: 22,
      events: [
        {
          time: '4:00pm',
          currency: 'NZD',
          flag: '🇳🇿',
          event: 'RBNZ Interest Rate',
          tradableDeviation: '0.25%',
          actual: '2.75%',
          forecast: '2.75%',
          previous: '2.50%',
          stats: { h2_50plus: '77.8%', range: '69 pips', direction: '97.8%', spike: '39 pips' },
          tradablePairs: tradablePairsByCurrency['NZD'],
          tradingTips: [
            'Interest rate decisions have highest impact',
            'Watch for accompanying statement tone',
            'NZD/USD primary pair for this event',
            'Expect 50-100 pip moves on surprises'
          ]
        },
        {
          time: '8:30pm',
          currency: 'AUD',
          flag: '🇦🇺',
          event: 'Australian Employment Change',
          tradableDeviation: '25K',
          actual: null,
          forecast: '15.3K',
          previous: '-3.7K',
          stats: { h2_50plus: '42.6%', range: '52 pips', direction: '94.4%', spike: '36 pips' },
          tradablePairs: tradablePairsByCurrency['AUD'],
          tradingTips: [
            'Full-time vs part-time breakdown matters',
            'Unemployment rate released simultaneously',
            'AUD/USD and AUD/JPY most reactive',
            'Can affect RBA rate expectations'
          ]
        }
      ]
    },
    {
      day: 'THU',
      date: 23,
      events: [
        {
          time: '8:30am',
          currency: 'USD',
          flag: '🇺🇸',
          event: 'US Core Retail Sales',
          tradableDeviation: '0.5%',
          actual: null,
          forecast: '0.2%',
          previous: '0.0%',
          stats: { h2_50plus: '56.7%', range: '62 pips', direction: '96.5%', spike: '22 pips' },
          tradablePairs: tradablePairsByCurrency['USD'],
          tradingTips: [
            'Core figure excludes auto sales volatility',
            'Revision to previous month also important',
            'Direct impact on Fed rate expectations',
            'Best traded on EUR/USD and GBP/USD'
          ]
        },
        {
          time: '8:30am',
          currency: 'USD',
          flag: '🇺🇸',
          event: 'Unemployment Claims',
          tradableDeviation: '15K',
          actual: null,
          forecast: '215K',
          previous: '212K',
          stats: { h2_50plus: '38.5%', range: '35 pips', direction: '88.2%', spike: '18 pips' },
          tradablePairs: tradablePairsByCurrency['USD'],
          tradingTips: [
            'Weekly data - less impactful than NFP',
            'Continuing claims also important',
            'Usually overshadowed by same-time releases',
            'Better for scalping strategies'
          ]
        },
        {
          time: '10:00am',
          currency: 'USD',
          flag: '🇺🇸',
          event: 'Existing Home Sales',
          tradableDeviation: '0.15M',
          actual: null,
          forecast: '4.15M',
          previous: '4.00M',
          stats: { h2_50plus: '32.1%', range: '28 pips', direction: '85.6%', spike: '15 pips' },
          tradablePairs: tradablePairsByCurrency['USD'],
          tradingTips: [
            'Secondary tier USD event',
            'Housing data affects Fed outlook',
            'Lower volatility than retail/employment',
            'Consider as confluence with other data'
          ]
        }
      ]
    },
    {
      day: 'FRI',
      date: 24,
      events: [
        {
          time: '8:30am',
          currency: 'CAD',
          flag: '🇨🇦',
          event: 'Core Retail Sales m/m',
          tradableDeviation: '0.6%',
          actual: null,
          forecast: '0.4%',
          previous: '-0.2%',
          stats: { h2_50plus: '51.2%', range: '48 pips', direction: '91.8%', spike: '25 pips' },
          tradablePairs: tradablePairsByCurrency['CAD'],
          tradingTips: [
            'USD/CAD primary trading pair',
            'Oil prices can amplify CAD moves',
            'Watch for simultaneous US data',
            'CAD/JPY for risk-on sentiment plays'
          ]
        },
        {
          time: '10:00am',
          currency: 'USD',
          flag: '🇺🇸',
          event: 'New Home Sales',
          tradableDeviation: '30K',
          actual: null,
          forecast: '680K',
          previous: '664K',
          stats: { h2_50plus: '28.4%', range: '24 pips', direction: '82.3%', spike: '12 pips' },
          tradablePairs: tradablePairsByCurrency['USD'],
          tradingTips: [
            'Lower impact housing data',
            'More volatile than existing home sales',
            'Rarely traded as standalone event',
            'Use for longer-term USD bias confirmation'
          ]
        }
      ]
    },
    {
      day: 'SAT',
      date: 25,
      events: []
    }
  ];
          stats: { h2_50plus: '28.4%', range: '24 pips', direction: '82.3%', spike: '12 pips' }
        }
      ]
    },
    {
      day: 'SAT',
      date: 25,
      events: []
    }
  ];

  const getWeekDateRange = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (currentWeekOffset * 7));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `Week of ${months[startOfWeek.getMonth()]} ${startOfWeek.getDate()} ~ ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
  };

  const getDayColor = (day) => {
    switch(day) {
      case 'SUN': return 'bg-rose-600';
      case 'MON': return 'bg-slate-600';
      case 'TUE': return 'bg-amber-600';
      case 'WED': return 'bg-emerald-600';
      case 'THU': return 'bg-cyan-600';
      case 'FRI': return 'bg-violet-600';
      case 'SAT': return 'bg-brand-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-brand-400 bg-clip-text text-transparent">Tradable News Calendar</h1>
        <p className="text-slate-500 mt-2">High-impact economic events with tradable statistics</p>
      </div>

      {/* Controls */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm">News Release Times Below Are In</span>
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
            >
              {timezones.map(tz => (
                <option key={tz.id} value={tz.id}>{tz.name}</option>
              ))}
            </select>
            <button className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm hover:bg-cyan-500/30">
              Set Time Zone
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">2H-50+</span>
              <span className="text-slate-400">= % of 50+ pips move in 2hrs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">Range</span>
              <span className="text-slate-400">= Average range in 2 hrs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-brand-500/20 text-brand-400 rounded">Direction</span>
              <span className="text-slate-400">= % match following news direction</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded">Spike</span>
              <span className="text-slate-400">= Initial Average Spike</span>
            </div>
          </div>
        </div>
      </div>

      {/* Week Title & Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
          className="px-4 py-2 text-cyan-400 hover:text-cyan-300 font-medium text-sm"
        >
          ← PREV WEEK
        </button>
        <h2 className="text-xl font-bold text-slate-200">{getWeekDateRange()} | High Impact News Calendar</h2>
        <button 
          onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
          className="px-4 py-2 text-cyan-400 hover:text-cyan-300 font-medium text-sm"
        >
          NEXT WEEK →
        </button>
      </div>

      {/* Calendar Table */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-slate-800/80 border-b border-slate-700">
          <div className="col-span-1 px-4 py-3 text-slate-400 font-semibold text-sm">Date</div>
          <div className="col-span-1 px-4 py-3 text-slate-400 font-semibold text-sm">Time</div>
          <div className="col-span-3 px-4 py-3 text-slate-400 font-semibold text-sm">Event</div>
          <div className="col-span-1 px-4 py-3 text-slate-400 font-semibold text-sm text-center">Actual</div>
          <div className="col-span-1 px-4 py-3 text-slate-400 font-semibold text-sm text-center">Forecast</div>
          <div className="col-span-1 px-4 py-3 text-slate-400 font-semibold text-sm text-center">Previous</div>
          <div className="col-span-4 px-4 py-3 text-slate-400 font-semibold text-sm text-center">Info | Chart | News | Videos...</div>
        </div>

        {/* Calendar Rows */}
        {newsData.map((dayData, dayIdx) => (
          <div key={dayIdx} className="border-b border-slate-800 last:border-b-0">
            {dayData.events.length === 0 ? (
              /* No Events Row */
              <div className="grid grid-cols-12 items-center py-4 bg-slate-900/30 hover:bg-slate-800/30">
                <div className="col-span-1 px-4">
                  <div className="flex flex-col items-center">
                    <span className={`${getDayColor(dayData.day)} text-[var(--color-text-primary)] text-xs font-bold px-2 py-0.5 rounded-t`}>{dayData.day}</span>
                    <span className="bg-surface text-slate-900 text-xl font-bold px-3 py-1 rounded-b">{dayData.date}</span>
                  </div>
                </div>
                <div className="col-span-11 px-4 text-slate-500 italic">
                  No High Impact News Scheduled
                </div>
              </div>
            ) : (
              /* Events Rows */
              dayData.events.map((event, eventIdx) => {
                const eventKey = `${dayData.day}-${eventIdx}`;
                const isExpanded = expandedEvent === eventKey;
                
                return (
                <div key={eventIdx}>
                  <div className={`grid grid-cols-12 items-center py-4 ${eventIdx % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-800/20'} hover:bg-slate-800/50 transition-colors cursor-pointer`} onClick={() => setExpandedEvent(isExpanded ? null : eventKey)}>
                  {/* Date - only show for first event of the day */}
                  <div className="col-span-1 px-4">
                    {eventIdx === 0 ? (
                      <div className="flex flex-col items-center">
                        <span className={`${getDayColor(dayData.day)} text-[var(--color-text-primary)] text-xs font-bold px-2 py-0.5 rounded-t`}>{dayData.day}</span>
                        <span className="bg-surface text-slate-900 text-xl font-bold px-3 py-1 rounded-b">{dayData.date}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Time */}
                  <div className="col-span-1 px-4 font-mono text-slate-300">{event.time}</div>

                  {/* Event */}
                  <div className="col-span-3 px-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{event.flag}</span>
                      <span className="text-cyan-400 font-medium hover:text-cyan-300">{event.event}</span>
                      <span className={`text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                      Tradable Deviation: <span className="text-amber-400 font-medium">{event.tradableDeviation}</span>
                    </div>
                  </div>

                  {/* Actual */}
                  <div className="col-span-1 px-4 text-center">
                    {event.actual ? (
                      <span className={`font-mono font-bold ${parseFloat(event.actual) > parseFloat(event.forecast) ? 'text-emerald-400' : parseFloat(event.actual) < parseFloat(event.forecast) ? 'text-rose-400' : 'text-slate-300'}`}>
                        {event.actual}
                      </span>
                    ) : (
                      <span className="text-slate-500">N/A</span>
                    )}
                  </div>

                  {/* Forecast */}
                  <div className="col-span-1 px-4 text-center font-mono text-slate-300">{event.forecast}</div>

                  {/* Previous */}
                  <div className="col-span-1 px-4 text-center font-mono text-slate-400">{event.previous}</div>

                  {/* Stats & Actions */}
                  <div className="col-span-4 px-4">
                    <div className="flex items-center justify-between">
                      {/* Stats */}
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs font-mono">
                          2H-50+ <span className="font-bold">{event.stats.h2_50plus}</span>
                        </span>
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-mono">
                          Range <span className="font-bold">{event.stats.range}</span>
                        </span>
                        <span className="px-2 py-1 bg-brand-500/20 text-brand-400 rounded text-xs font-mono">
                          Direction <span className="font-bold">{event.stats.direction}</span>
                        </span>
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs font-mono">
                          Spike <span className="font-bold">{event.stats.spike}</span>
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1 ml-2">
                        <button className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-sm" title="Info" onClick={(e) => e.stopPropagation()}>ℹ️</button>
                        <button className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-sm" title="Chart" onClick={(e) => e.stopPropagation()}>📈</button>
                        <button className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-sm" title="News" onClick={(e) => e.stopPropagation()}>📰</button>
                        <button className="w-8 h-8 bg-cyan-600 hover:bg-cyan-500 rounded flex items-center justify-center text-sm" title="Download" onClick={(e) => e.stopPropagation()}>⬇️</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Tradable Pairs Section */}
                {isExpanded && event.tradablePairs && (
                  <div className="bg-slate-800/40 border-t border-slate-700 p-6 animate-slideDown">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Tradable Pairs */}
                      <div className="lg:col-span-2">
                        <h4 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                          <span>💱</span> Suggested Tradable Pairs for {event.currency} News
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {event.tradablePairs.slice(0, 6).map((pair, pairIdx) => (
                            <div key={pairIdx} className={`p-4 rounded-lg border ${pair.direction === 'Direct' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-lg text-slate-200">{pair.pair}</span>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${pair.direction === 'Direct' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                  {pair.direction === 'Direct' ? '↑ Direct' : '↓ Inverse'}
                                </span>
                              </div>
                              <p className="text-sm text-slate-400 mb-2">{pair.description}</p>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Liquidity: <span className={`font-medium ${pair.liquidity === 'Highest' || pair.liquidity === 'Very High' ? 'text-emerald-400' : pair.liquidity === 'High' ? 'text-cyan-400' : pair.liquidity === 'Medium' ? 'text-amber-400' : 'text-rose-400'}`}>{pair.liquidity}</span></span>
                                <span className="text-slate-500">Spread: <span className="text-cyan-400 font-mono">{pair.spread}</span></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Trading Tips */}
                      <div>
                        <h4 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                          <span>💡</span> Trading Tips
                        </h4>
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                          <ul className="space-y-3">
                            {event.tradingTips?.map((tip, tipIdx) => (
                              <li key={tipIdx} className="flex items-start gap-2 text-sm">
                                <span className="text-cyan-400 mt-0.5">•</span>
                                <span className="text-slate-300">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-4 bg-gradient-to-r from-brand-400/10 to-brand-500/10 rounded-lg p-4 border border-cyan-500/20">
                          <h5 className="text-sm font-semibold text-slate-300 mb-3">📊 Historical Performance</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">50+ pip moves</span>
                              <span className="text-cyan-400 font-bold">{event.stats.h2_50plus}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Avg 2hr Range</span>
                              <span className="text-emerald-400 font-bold">{event.stats.range}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Direction Match</span>
                              <span className="text-brand-400 font-bold">{event.stats.direction}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Initial Spike</span>
                              <span className="text-amber-400 font-bold">{event.stats.spike}</span>
                            </div>
                          </div>
                        </div>

                        {/* Best Pair Recommendation */}
                        <div className="mt-4 bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/30">
                          <h5 className="text-sm font-semibold text-emerald-400 mb-2">⭐ Recommended Pair</h5>
                          <div className="text-xl font-bold text-[var(--color-text-primary)]">{event.tradablePairs[0]?.pair}</div>
                          <p className="text-xs text-slate-400 mt-1">{event.tradablePairs[0]?.liquidity} liquidity • {event.tradablePairs[0]?.spread} spread</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              )})
            )}
          </div>
        ))}
      </div>

      {/* Week Navigation Bottom */}
      <div className="flex items-center justify-between mt-6">
        <button 
          onClick={() => setCurrentWeekOffset(currentWeekOffset - 1)}
          className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-lg text-cyan-400 hover:bg-slate-700 font-medium"
        >
          ← PREV WEEK
        </button>
        <button 
          onClick={() => setCurrentWeekOffset(0)}
          className="px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 font-medium"
        >
          📅 CURRENT WEEK
        </button>
        <button 
          onClick={() => setCurrentWeekOffset(currentWeekOffset + 1)}
          className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-lg text-cyan-400 hover:bg-slate-700 font-medium"
        >
          NEXT WEEK →
        </button>
      </div>

      {/* Upcoming High Impact Events Summary */}
      <div className="mt-6 bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-6">
        <h3 className="text-lg font-bold text-slate-200 mb-4">🎯 This Week's Key Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {newsData.flatMap(d => d.events).slice(0, 4).map((event, idx) => (
            <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{event.flag}</span>
                <div>
                  <div className="text-cyan-400 font-medium text-sm">{event.event}</div>
                  <div className="text-slate-500 text-xs">{event.time}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                <div className="text-center">
                  <div className="text-xs text-slate-500">Forecast</div>
                  <div className="text-slate-300 font-mono">{event.forecast}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500">Previous</div>
                  <div className="text-slate-400 font-mono">{event.previous}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500">Range</div>
                  <div className="text-emerald-400 font-mono">{event.stats.range}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TradeJournalPage = () => (
  <div className="p-6">
    <div className="mb-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-brand-400 bg-clip-text text-transparent">Trade Journal</h1>
      <p className="text-slate-500 mt-2">Track, analyze, and improve your trading performance</p>
    </div>
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-8">
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">📓</span>
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Coming Soon</h2>
        <p className="text-slate-400 max-w-md mx-auto">Log trades, track P&L, analyze win rates, and identify patterns in your trading behavior.</p>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { label: 'Total Trades', value: '---' },
            { label: 'Win Rate', value: '---%' },
            { label: 'Profit Factor', value: '---' },
            { label: 'Avg R:R', value: '---' },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-cyan-400">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const SeasonalityPage = () => (
  <div className="p-6">
    <div className="mb-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-brand-400 bg-clip-text text-transparent">Seasonality Dashboard</h1>
      <p className="text-slate-500 mt-2">Historical seasonal patterns and tendencies</p>
    </div>
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-8">
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">🗓️</span>
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Coming Soon</h2>
        <p className="text-slate-400 max-w-md mx-auto">Analyze historical seasonal trends for currencies, commodities, and indices across different timeframes.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
            <div key={month} className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-medium ${i % 3 === 0 ? 'bg-emerald-500/20 text-emerald-400' : i % 3 === 1 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
              {month}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ContractSpecsPage = () => (
  <div className="p-6">
    <div className="mb-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-brand-400 bg-clip-text text-transparent">Contract Specifications</h1>
      <p className="text-slate-500 mt-2">Futures and forex contract details</p>
    </div>
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-8">
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">📋</span>
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Coming Soon</h2>
        <p className="text-slate-400 max-w-md mx-auto">Access tick values, contract sizes, margin requirements, and trading hours for all major instruments.</p>
        <div className="mt-8 overflow-x-auto">
          <table className="mx-auto text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="px-4 py-2">Symbol</th>
                <th className="px-4 py-2">Contract Size</th>
                <th className="px-4 py-2">Tick Value</th>
                <th className="px-4 py-2">Margin</th>
              </tr>
            </thead>
            <tbody className="text-slate-500">
              <tr><td className="px-4 py-2">6E</td><td>€125,000</td><td>$12.50</td><td>$2,500</td></tr>
              <tr><td className="px-4 py-2">6B</td><td>£62,500</td><td>$6.25</td><td>$2,200</td></tr>
              <tr><td className="px-4 py-2">6J</td><td>¥12,500,000</td><td>$12.50</td><td>$2,800</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

const GeometryScannerPage = () => {
  const [activeTab, setActiveTab] = useState('harmonics');
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('4H');
  const [elliottWaveData, setElliottWaveData] = useState({
    currentWave: '3',
    degree: 'Intermediate',
    direction: 'Bullish',
    confidence: 78,
    waves: [
      { wave: '1', start: 1.0520, end: 1.0680, status: 'complete', type: 'impulse' },
      { wave: '2', start: 1.0680, end: 1.0590, status: 'complete', type: 'corrective' },
      { wave: '3', start: 1.0590, end: null, status: 'in-progress', type: 'impulse', target: 1.0850 },
      { wave: '4', start: null, end: null, status: 'pending', type: 'corrective', target: 1.0750 },
      { wave: '5', start: null, end: null, status: 'pending', type: 'impulse', target: 1.0950 },
    ],
    subWaves: [
      { wave: 'i', status: 'complete' },
      { wave: 'ii', status: 'complete' },
      { wave: 'iii', status: 'in-progress' },
      { wave: 'iv', status: 'pending' },
      { wave: 'v', status: 'pending' },
    ],
    rules: [
      { rule: 'Wave 2 cannot retrace more than 100% of Wave 1', status: 'valid', icon: '✅' },
      { rule: 'Wave 3 cannot be the shortest impulse wave', status: 'valid', icon: '✅' },
      { rule: 'Wave 4 cannot overlap Wave 1 territory', status: 'valid', icon: '✅' },
      { rule: 'Alternation between Wave 2 and Wave 4', status: 'checking', icon: '⏳' },
    ],
    fibonacci: {
      wave2Retracement: '61.8%',
      wave3Extension: '161.8%',
      wave4Retracement: '38.2%',
      wave5Target: '100%',
    }
  });

  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'USD/CHF', 'EUR/GBP'];
  const timeframes = ['1H', '4H', 'Daily', 'Weekly'];
  const waveDegrees = ['Grand Supercycle', 'Supercycle', 'Cycle', 'Primary', 'Intermediate', 'Minor', 'Minute', 'Minuette', 'Subminuette'];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-brand-400 bg-clip-text text-transparent">Geometry Scanner</h1>
        <p className="text-slate-500 mt-2">Advanced pattern recognition, harmonic analysis & Elliott Wave theory</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          ['harmonics', '🦋 Harmonic Patterns'],
          ['elliott', '🌊 Elliott Wave'],
          ['chartPatterns', '📊 Chart Patterns'],
          ['gann', '📐 Gann Analysis'],
          ['fibonacci', '🔢 Fibonacci Clusters'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-3 rounded-lg text-sm whitespace-nowrap border transition-all ${
              activeTab === id
                ? 'bg-slate-800 text-cyan-400 border-cyan-500/50'
                : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Harmonic Patterns Tab */}
      {activeTab === 'harmonics' && (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-8">
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🦋</span>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Harmonic Pattern Scanner</h2>
            <p className="text-slate-400 max-w-md mx-auto">Detect harmonic patterns automatically with precision entry and exit zones.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {['Gartley', 'Butterfly', 'Bat', 'Crab', 'Cypher', 'Shark', 'ABCD', '3-Drives'].map(pattern => (
                <span key={pattern} className="px-4 py-2 bg-brand-500/20 border border-brand-500/30 rounded-lg text-violet-300 text-sm">{pattern}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Elliott Wave Tab */}
      {activeTab === 'elliott' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Currency Pair</label>
                <select
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  {pairs.map(pair => <option key={pair} value={pair}>{pair}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Timeframe</label>
                <div className="flex gap-1">
                  {timeframes.map(tf => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`px-3 py-2 rounded-lg text-sm ${selectedTimeframe === tf ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Wave Degree</label>
                <select
                  value={elliottWaveData.degree}
                  onChange={(e) => setElliottWaveData({...elliottWaveData, degree: e.target.value})}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  {waveDegrees.map(deg => <option key={deg} value={deg}>{deg}</option>)}
                </select>
              </div>
              <button className="px-6 py-2 bg-gradient-to-r from-brand-500 to-violet-600 rounded-lg font-semibold text-sm hover:from-brand-400 hover:to-brand-500 ml-auto">
                🔍 Scan Waves
              </button>
            </div>
          </div>

          {/* Wave Analysis Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-4">
              <div className="text-slate-400 text-sm mb-1">Current Wave</div>
              <div className="text-3xl font-bold text-cyan-400">Wave {elliottWaveData.currentWave}</div>
              <div className="text-xs text-slate-500 mt-1">{elliottWaveData.degree} Degree</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-4">
              <div className="text-slate-400 text-sm mb-1">Direction</div>
              <div className={`text-3xl font-bold ${elliottWaveData.direction === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {elliottWaveData.direction === 'Bullish' ? '🐂' : '🐻'} {elliottWaveData.direction}
              </div>
              <div className="text-xs text-slate-500 mt-1">Impulse Phase</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-4">
              <div className="text-slate-400 text-sm mb-1">Confidence</div>
              <div className="text-3xl font-bold text-brand-400">{elliottWaveData.confidence}%</div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div className="bg-gradient-to-r from-brand-400 to-brand-500 h-2 rounded-full" style={{ width: `${elliottWaveData.confidence}%` }} />
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-4">
              <div className="text-slate-400 text-sm mb-1">Wave 3 Target</div>
              <div className="text-3xl font-bold text-emerald-400">{elliottWaveData.waves[2].target}</div>
              <div className="text-xs text-slate-500 mt-1">161.8% Extension</div>
            </div>
          </div>

          {/* Main Wave Structure */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-200">🌊 Elliott Wave Structure</h3>
                <p className="text-sm text-slate-500">{selectedPair} • {selectedTimeframe} • {elliottWaveData.degree}</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Impulse: 1-3-5</span>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs">Corrective: 2-4</span>
              </div>
            </div>

            {/* Wave Visualization */}
            <div className="p-6">
              <div className="relative h-48 bg-slate-800/50 rounded-lg mb-6 overflow-hidden">
                {/* Simplified Wave Chart */}
                <svg viewBox="0 0 500 150" className="w-full h-full">
                  <defs>
                    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  {/* Grid */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line key={i} x1="0" y1={30 + i * 25} x2="500" y2={30 + i * 25} stroke="#334155" strokeWidth="0.5" strokeDasharray="4" />
                  ))}
                  {/* Wave Path */}
                  <path
                    d="M 20,120 L 80,60 L 120,90 L 220,30 L 280,55 L 380,20 L 420,45 L 480,10"
                    fill="none"
                    stroke="url(#waveGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Wave Labels */}
                  <circle cx="20" cy="120" r="4" fill="#06b6d4" />
                  <text x="20" y="138" textAnchor="middle" fill="#94a3b8" fontSize="10">0</text>
                  
                  <circle cx="80" cy="60" r="6" fill="#22c55e" />
                  <text x="80" y="50" textAnchor="middle" fill="#22c55e" fontSize="12" fontWeight="bold">1</text>
                  
                  <circle cx="120" cy="90" r="6" fill="#10b981" />
                  <text x="120" y="108" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold">2</text>
                  
                  <circle cx="220" cy="30" r="8" fill="#06b6d4" className="animate-pulse" />
                  <text x="220" y="20" textAnchor="middle" fill="#06b6d4" fontSize="14" fontWeight="bold">3</text>
                  
                  <circle cx="280" cy="55" r="5" fill="#64748b" strokeDasharray="2" stroke="#10b981" />
                  <text x="280" y="73" textAnchor="middle" fill="#64748b" fontSize="11">4?</text>
                  
                  <circle cx="380" cy="20" r="5" fill="#64748b" strokeDasharray="2" stroke="#22c55e" />
                  <text x="380" y="12" textAnchor="middle" fill="#64748b" fontSize="11">5?</text>

                  {/* Sub-waves for Wave 3 */}
                  <text x="150" y="45" fill="#10b981" fontSize="8">i</text>
                  <text x="170" y="55" fill="#10b981" fontSize="8">ii</text>
                  <text x="195" y="35" fill="#10b981" fontSize="8">iii</text>
                </svg>
              </div>

              {/* Wave Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Wave</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-medium">Type</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-medium">Start</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-medium">End/Target</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-medium">Fibonacci</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {elliottWaveData.waves.map((wave, idx) => (
                      <tr key={wave.wave} className={`border-b border-slate-800 ${wave.status === 'in-progress' ? 'bg-cyan-500/10' : ''}`}>
                        <td className="py-3 px-4">
                          <span className={`text-lg font-bold ${wave.type === 'impulse' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {wave.wave}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${wave.type === 'impulse' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {wave.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-300">
                          {wave.start || '---'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-300">
                          {wave.end || wave.target || '---'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-brand-400 font-mono text-xs">
                            {idx === 1 ? elliottWaveData.fibonacci.wave2Retracement : 
                             idx === 2 ? elliottWaveData.fibonacci.wave3Extension :
                             idx === 3 ? elliottWaveData.fibonacci.wave4Retracement :
                             idx === 4 ? elliottWaveData.fibonacci.wave5Target : '---'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            wave.status === 'complete' ? 'bg-emerald-500/20 text-emerald-400' :
                            wave.status === 'in-progress' ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' :
                            'bg-slate-700 text-slate-400'
                          }`}>
                            {wave.status === 'complete' ? '✓ Complete' : wave.status === 'in-progress' ? '● In Progress' : '○ Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sub-Wave Analysis & Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sub-Wave Structure */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-6">
              <h3 className="font-bold text-lg text-slate-200 mb-4">📊 Wave 3 Sub-Waves</h3>
              <div className="space-y-3">
                {elliottWaveData.subWaves.map((sw, idx) => (
                  <div key={sw.wave} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                      sw.status === 'complete' ? 'bg-emerald-500/20 text-emerald-400' :
                      sw.status === 'in-progress' ? 'bg-cyan-500/20 text-cyan-400' :
                      'bg-slate-800 text-slate-500'
                    }`}>
                      {sw.wave}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            sw.status === 'complete' ? 'bg-emerald-500 w-full' :
                            sw.status === 'in-progress' ? 'bg-cyan-500 w-1/2 animate-pulse' :
                            'bg-slate-700 w-0'
                          }`}
                        />
                      </div>
                    </div>
                    <span className={`text-xs ${
                      sw.status === 'complete' ? 'text-emerald-400' :
                      sw.status === 'in-progress' ? 'text-cyan-400' :
                      'text-slate-500'
                    }`}>
                      {sw.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Elliott Wave Rules Validation */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-6">
              <h3 className="font-bold text-lg text-slate-200 mb-4">📏 Elliott Wave Rules</h3>
              <div className="space-y-3">
                {elliottWaveData.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-lg">{rule.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300">{rule.rule}</p>
                      <span className={`text-xs ${rule.status === 'valid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {rule.status === 'valid' ? 'Rule Validated' : 'Checking...'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trading Signals */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-6">
            <h3 className="font-bold text-lg text-slate-200 mb-4">🎯 Elliott Wave Trading Signals</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🟢</span>
                  <span className="font-semibold text-emerald-400">Entry Zone</span>
                </div>
                <div className="text-2xl font-bold text-emerald-300 font-mono">1.0590 - 1.0620</div>
                <p className="text-xs text-slate-400 mt-1">Wave 3 pullback entry</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🎯</span>
                  <span className="font-semibold text-amber-400">Target 1</span>
                </div>
                <div className="text-2xl font-bold text-amber-300 font-mono">1.0850</div>
                <p className="text-xs text-slate-400 mt-1">Wave 3 @ 161.8% ext.</p>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🛑</span>
                  <span className="font-semibold text-rose-400">Invalidation</span>
                </div>
                <div className="text-2xl font-bold text-rose-300 font-mono">1.0520</div>
                <p className="text-xs text-slate-400 mt-1">Below Wave 1 start</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Patterns Tab */}
      {activeTab === 'chartPatterns' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Currency Pair</label>
                <select
                  value={selectedPair}
                  onChange={(e) => setSelectedPair(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  {pairs.map(pair => <option key={pair} value={pair}>{pair}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Timeframe</label>
                <div className="flex gap-1">
                  {timeframes.map(tf => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`px-3 py-2 rounded-lg text-sm ${selectedTimeframe === tf ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Pattern Type</label>
                <select className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none">
                  <option value="all">All Patterns</option>
                  <option value="reversal">Reversal Patterns</option>
                  <option value="continuation">Continuation Patterns</option>
                  <option value="bilateral">Bilateral Patterns</option>
                </select>
              </div>
              <button className="px-6 py-2 bg-gradient-to-r from-brand-500 to-violet-600 rounded-lg font-semibold text-sm hover:from-brand-400 hover:to-brand-500 ml-auto">
                🔍 Scan Patterns
              </button>
            </div>
          </div>

          {/* Detected Patterns Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-4">
              <div className="text-slate-400 text-sm mb-1">Patterns Found</div>
              <div className="text-3xl font-bold text-cyan-400">7</div>
              <div className="text-xs text-slate-500 mt-1">Across all timeframes</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-4">
              <div className="text-slate-400 text-sm mb-1">Bullish Patterns</div>
              <div className="text-3xl font-bold text-emerald-400">4</div>
              <div className="text-xs text-slate-500 mt-1">Reversal & Continuation</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-4">
              <div className="text-slate-400 text-sm mb-1">Bearish Patterns</div>
              <div className="text-3xl font-bold text-rose-400">2</div>
              <div className="text-xs text-slate-500 mt-1">Reversal & Continuation</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-4">
              <div className="text-slate-400 text-sm mb-1">Forming</div>
              <div className="text-3xl font-bold text-amber-400">1</div>
              <div className="text-xs text-slate-500 mt-1">In progress</div>
            </div>
          </div>

          {/* Pattern Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Reversal Patterns */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 overflow-hidden">
              <div className="px-4 py-3 bg-rose-500/10 border-b border-slate-800">
                <h3 className="font-bold text-rose-400 flex items-center gap-2">
                  <span>🔄</span> Reversal Patterns
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { name: 'Head & Shoulders', status: 'detected', direction: 'bearish', confidence: 85 },
                  { name: 'Inverse H&S', status: 'detected', direction: 'bullish', confidence: 78 },
                  { name: 'Double Top', status: 'forming', direction: 'bearish', confidence: 62 },
                  { name: 'Double Bottom', status: 'detected', direction: 'bullish', confidence: 91 },
                  { name: 'Triple Top', status: 'none', direction: 'bearish', confidence: 0 },
                  { name: 'Triple Bottom', status: 'none', direction: 'bullish', confidence: 0 },
                  { name: 'Rounding Top', status: 'none', direction: 'bearish', confidence: 0 },
                  { name: 'Rounding Bottom', status: 'none', direction: 'bullish', confidence: 0 },
                ].map(pattern => (
                  <div key={pattern.name} className={`flex items-center justify-between p-3 rounded-lg border ${
                    pattern.status === 'detected' ? 'bg-slate-800/80 border-slate-700' :
                    pattern.status === 'forming' ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-slate-800/30 border-slate-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        pattern.status === 'detected' ? pattern.direction === 'bullish' ? 'bg-emerald-500' : 'bg-rose-500' :
                        pattern.status === 'forming' ? 'bg-amber-500 animate-pulse' :
                        'bg-slate-600'
                      }`} />
                      <span className={`text-sm ${pattern.status !== 'none' ? 'text-slate-200' : 'text-slate-500'}`}>
                        {pattern.name}
                      </span>
                    </div>
                    {pattern.status !== 'none' && (
                      <span className={`text-xs font-mono ${
                        pattern.confidence >= 80 ? 'text-emerald-400' :
                        pattern.confidence >= 60 ? 'text-amber-400' :
                        'text-slate-400'
                      }`}>
                        {pattern.confidence}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Continuation Patterns */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 overflow-hidden">
              <div className="px-4 py-3 bg-cyan-500/10 border-b border-slate-800">
                <h3 className="font-bold text-cyan-400 flex items-center gap-2">
                  <span>➡️</span> Continuation Patterns
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { name: 'Bull Flag', status: 'detected', direction: 'bullish', confidence: 88 },
                  { name: 'Bear Flag', status: 'none', direction: 'bearish', confidence: 0 },
                  { name: 'Bull Pennant', status: 'detected', direction: 'bullish', confidence: 72 },
                  { name: 'Bear Pennant', status: 'none', direction: 'bearish', confidence: 0 },
                  { name: 'Ascending Triangle', status: 'detected', direction: 'bullish', confidence: 81 },
                  { name: 'Descending Triangle', status: 'none', direction: 'bearish', confidence: 0 },
                  { name: 'Rising Wedge', status: 'none', direction: 'bearish', confidence: 0 },
                  { name: 'Falling Wedge', status: 'none', direction: 'bullish', confidence: 0 },
                ].map(pattern => (
                  <div key={pattern.name} className={`flex items-center justify-between p-3 rounded-lg border ${
                    pattern.status === 'detected' ? 'bg-slate-800/80 border-slate-700' :
                    pattern.status === 'forming' ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-slate-800/30 border-slate-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        pattern.status === 'detected' ? pattern.direction === 'bullish' ? 'bg-emerald-500' : 'bg-rose-500' :
                        pattern.status === 'forming' ? 'bg-amber-500 animate-pulse' :
                        'bg-slate-600'
                      }`} />
                      <span className={`text-sm ${pattern.status !== 'none' ? 'text-slate-200' : 'text-slate-500'}`}>
                        {pattern.name}
                      </span>
                    </div>
                    {pattern.status !== 'none' && (
                      <span className={`text-xs font-mono ${
                        pattern.confidence >= 80 ? 'text-emerald-400' :
                        pattern.confidence >= 60 ? 'text-amber-400' :
                        'text-slate-400'
                      }`}>
                        {pattern.confidence}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bilateral & Other Patterns */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 overflow-hidden">
              <div className="px-4 py-3 bg-brand-500/10 border-b border-slate-800">
                <h3 className="font-bold text-brand-400 flex items-center gap-2">
                  <span>⬌</span> Bilateral & Candlestick
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { name: 'Symmetrical Triangle', status: 'none', direction: 'neutral', confidence: 0 },
                  { name: 'Rectangle', status: 'detected', direction: 'neutral', confidence: 76 },
                  { name: 'Cup & Handle', status: 'none', direction: 'bullish', confidence: 0 },
                  { name: 'Inv Cup & Handle', status: 'none', direction: 'bearish', confidence: 0 },
                  { name: 'Engulfing (Bull)', status: 'detected', direction: 'bullish', confidence: 94 },
                  { name: 'Engulfing (Bear)', status: 'none', direction: 'bearish', confidence: 0 },
                  { name: 'Morning Star', status: 'none', direction: 'bullish', confidence: 0 },
                  { name: 'Evening Star', status: 'detected', direction: 'bearish', confidence: 67 },
                ].map(pattern => (
                  <div key={pattern.name} className={`flex items-center justify-between p-3 rounded-lg border ${
                    pattern.status === 'detected' ? 'bg-slate-800/80 border-slate-700' :
                    pattern.status === 'forming' ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-slate-800/30 border-slate-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        pattern.status === 'detected' ? pattern.direction === 'bullish' ? 'bg-emerald-500' : pattern.direction === 'bearish' ? 'bg-rose-500' : 'bg-brand-500' :
                        pattern.status === 'forming' ? 'bg-amber-500 animate-pulse' :
                        'bg-slate-600'
                      }`} />
                      <span className={`text-sm ${pattern.status !== 'none' ? 'text-slate-200' : 'text-slate-500'}`}>
                        {pattern.name}
                      </span>
                    </div>
                    {pattern.status !== 'none' && (
                      <span className={`text-xs font-mono ${
                        pattern.confidence >= 80 ? 'text-emerald-400' :
                        pattern.confidence >= 60 ? 'text-amber-400' :
                        'text-slate-400'
                      }`}>
                        {pattern.confidence}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Pattern Details */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-200">📊 Active Pattern: Double Bottom</h3>
                <p className="text-sm text-slate-500">{selectedPair} • {selectedTimeframe} • Bullish Reversal</p>
              </div>
              <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-semibold">91% Confidence</span>
            </div>
            
            <div className="p-6">
              {/* Pattern Visualization */}
              <div className="relative h-56 bg-slate-800/50 rounded-lg mb-6 overflow-hidden">
                <svg viewBox="0 0 500 180" className="w-full h-full">
                  <defs>
                    <linearGradient id="patternGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                  </defs>
                  {/* Grid */}
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <line key={i} x1="0" y1={20 + i * 28} x2="500" y2={20 + i * 28} stroke="#334155" strokeWidth="0.5" strokeDasharray="4" />
                  ))}
                  {/* Neckline */}
                  <line x1="80" y1="50" x2="420" y2="50" stroke="#10b981" strokeWidth="2" strokeDasharray="8,4" />
                  <text x="450" y="55" fill="#10b981" fontSize="10">Neckline</text>
                  
                  {/* Double Bottom Pattern */}
                  <path
                    d="M 30,40 L 80,50 L 130,130 L 180,50 L 230,50 L 280,130 L 330,50 L 380,50 L 430,20"
                    fill="none"
                    stroke="url(#patternGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Bottom 1 */}
                  <circle cx="130" cy="130" r="6" fill="#22c55e" />
                  <text x="130" y="150" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="bold">Bottom 1</text>
                  
                  {/* Bottom 2 */}
                  <circle cx="280" cy="130" r="6" fill="#22c55e" />
                  <text x="280" y="150" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="bold">Bottom 2</text>
                  
                  {/* Breakout */}
                  <circle cx="380" cy="50" r="6" fill="#06b6d4" className="animate-pulse" />
                  <text x="380" y="40" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold">Breakout</text>
                  
                  {/* Target projection */}
                  <line x1="380" y1="50" x2="380" y2="20" stroke="#22c55e" strokeWidth="1" strokeDasharray="4" />
                  <line x1="130" y1="130" x2="130" y2="50" stroke="#64748b" strokeWidth="1" strokeDasharray="4" />
                  <text x="400" y="25" fill="#22c55e" fontSize="10">Target</text>
                </svg>
              </div>

              {/* Pattern Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-slate-400 text-xs mb-1">Bottom 1</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono">1.0520</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-slate-400 text-xs mb-1">Bottom 2</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono">1.0525</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-slate-400 text-xs mb-1">Neckline</div>
                  <div className="text-xl font-bold text-amber-400 font-mono">1.0680</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <div className="text-slate-400 text-xs mb-1">Pattern Height</div>
                  <div className="text-xl font-bold text-cyan-400 font-mono">160 pips</div>
                </div>
              </div>

              {/* Trading Setup */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🟢</span>
                    <span className="font-semibold text-emerald-400">Entry</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-300 font-mono">1.0680</div>
                  <p className="text-xs text-slate-400 mt-1">Neckline breakout confirmation</p>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🎯</span>
                    <span className="font-semibold text-cyan-400">Target</span>
                  </div>
                  <div className="text-2xl font-bold text-cyan-300 font-mono">1.0840</div>
                  <p className="text-xs text-slate-400 mt-1">Measured move (100%)</p>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🛑</span>
                    <span className="font-semibold text-rose-400">Stop Loss</span>
                  </div>
                  <div className="text-2xl font-bold text-rose-300 font-mono">1.0510</div>
                  <p className="text-xs text-slate-400 mt-1">Below Bottom 2</p>
                </div>
              </div>

              {/* Risk/Reward */}
              <div className="mt-4 p-4 bg-slate-800/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">Risk/Reward Ratio:</span>
                  <span className="text-2xl font-bold text-brand-400">1 : 2.35</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm">+160 pips potential</span>
                  <span className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded text-sm">-68 pips risk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pattern History */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h3 className="font-bold text-lg text-slate-200">📜 Recent Pattern Signals</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/50">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Pattern</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Pair</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">TF</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Direction</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Entry</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Target</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { pattern: 'Double Bottom', pair: 'EUR/USD', tf: '4H', direction: 'Bullish', entry: '1.0680', target: '1.0840', status: 'active' },
                    { pattern: 'Bull Flag', pair: 'GBP/USD', tf: '1H', direction: 'Bullish', entry: '1.2650', target: '1.2780', status: 'active' },
                    { pattern: 'Head & Shoulders', pair: 'USD/JPY', tf: 'Daily', direction: 'Bearish', entry: '148.50', target: '145.20', status: 'hit' },
                    { pattern: 'Ascending Triangle', pair: 'AUD/USD', tf: '4H', direction: 'Bullish', entry: '0.6580', target: '0.6720', status: 'active' },
                    { pattern: 'Engulfing', pair: 'EUR/GBP', tf: '1H', direction: 'Bullish', entry: '0.8540', target: '0.8610', status: 'stopped' },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-medium text-slate-200">{row.pattern}</td>
                      <td className="py-3 px-4 text-center text-slate-300">{row.pair}</td>
                      <td className="py-3 px-4 text-center text-slate-400">{row.tf}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${row.direction === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {row.direction === 'Bullish' ? '🐂' : '🐻'} {row.direction}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-300">{row.entry}</td>
                      <td className="py-3 px-4 text-center font-mono text-cyan-400">{row.target}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          row.status === 'active' ? 'bg-cyan-500/20 text-cyan-400' :
                          row.status === 'hit' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>
                          {row.status === 'active' ? '● Active' : row.status === 'hit' ? '✓ Target Hit' : '✗ Stopped'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Gann Analysis Tab */}
      {activeTab === 'gann' && (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-8">
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📐</span>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Gann Analysis</h2>
            <p className="text-slate-400 max-w-md mx-auto">Time and price squaring with Gann angles, fans, and grid analysis.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {['1x1 Angle', '2x1 Angle', '1x2 Angle', 'Gann Fan', 'Gann Grid', 'Square of 9', 'Gann Box'].map(tool => (
                <span key={tool} className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 text-sm">{tool}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fibonacci Clusters Tab */}
      {activeTab === 'fibonacci' && (
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 p-8">
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🔢</span>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">Fibonacci Clusters</h2>
            <p className="text-slate-400 max-w-md mx-auto">Multi-timeframe Fibonacci confluence zones and cluster analysis.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {['23.6%', '38.2%', '50%', '61.8%', '78.6%', '100%', '127.2%', '161.8%', '261.8%'].map(level => (
                <span key={level} className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-300 text-sm">{level}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const defaultIndicators = [
  { id: 'interest', name: 'Interest Rate (%)', weight: 15 },
  { id: 'inflation', name: 'Inflation Rate CPI YoY (%)', weight: 10, inverse: true },
  { id: 'coreCpi', name: 'Core CPI YoY (%)', weight: 5, inverse: true },
  { id: 'gdpQoq', name: 'GDP Growth QoQ (%)', weight: 7 },
  { id: 'gdpAnnual', name: 'GDP Growth Annual (%)', weight: 3 },
  { id: 'pmiMfg', name: 'Manufacturing PMI / ISM MPMI', weight: 8 },
  { id: 'pmiSvc', name: 'ISM Services PMI (SPMI)', weight: 7 },
  { id: 'unemployment', name: 'Unemployment Rate (%)', weight: 5, inverse: true },
  { id: 'consumer', name: 'Consumer Confidence', weight: 5 },
  { id: 'retailSales', name: 'Core Retail Sales MoM (%)', weight: 5 },
  { id: 'currentAccount', name: 'Current Account (B)', weight: 10 },
  { id: 'debt', name: 'Debt-to-GDP Ratio (%)', weight: 10, inverse: true },
  { id: 'trade', name: 'Trade Balance (B)', weight: 5 },
  { id: 'earnings', name: 'Average Hourly Earnings (%)', weight: 3 },
  { id: 'ppi', name: 'PPI (Producer Price Index) (%)', weight: 0.5, inverse: true },
  { id: 'housing', name: 'Housing Starts', weight: 0.4 },
  { id: 'industrial', name: 'Industrial Production (%)', weight: 0.3 },
  { id: 'inventories', name: 'Business Inventories (%)', weight: 0.2 },
  { id: 'jolts', name: 'JOLTS (M)', weight: 0.2 },
  { id: 'credit', name: 'Consumer Credit (B)', weight: 0.1 },
  { id: 'factory', name: 'Factory Orders (%)', weight: 0.1 },
  { id: 'capacity', name: 'Capacity Utilization (%)', weight: 0.1 },
  { id: 'importExport', name: 'Import/Export Prices (%)', weight: 0.1 },
];

const defaultData = {
  interest: { USD: 5.25, EUR: 4.5, GBP: 5.25, JPY: 0.25, CHF: 1.75, AUD: 4.35, CAD: 5.0, NZD: 5.5, SGD: 3.5, NOK: 4.5, SEK: 4.0, MXN: 11.0, ZAR: 8.25, TRY: 50.0, BRL: 10.75, INR: 6.5, RUB: 16.0, PLN: 5.75, CZK: 5.75, HUF: 6.5, PEN: 5.75 },
  inflation: { USD: 3.2, EUR: 2.4, GBP: 4.2, JPY: 2.8, CHF: 1.4, AUD: 3.5, CAD: 2.9, NZD: 4.1, SGD: 2.5, NOK: 3.0, SEK: 2.3, MXN: 4.3, ZAR: 5.1, TRY: 58.5, BRL: 4.5, INR: 5.1, RUB: 7.4, PLN: 2.8, CZK: 2.1, HUF: 3.7, PEN: 2.9 },
  coreCpi: { USD: 3.4, EUR: 2.7, GBP: 4.0, JPY: 2.3, CHF: 1.2, AUD: 3.2, CAD: 2.7, NZD: 3.8, SGD: 2.2, NOK: 2.8, SEK: 2.1, MXN: 4.0, ZAR: 4.8, TRY: 52.1, BRL: 4.1, INR: 4.5, RUB: 6.8, PLN: 3.1, CZK: 2.4, HUF: 3.9, PEN: 2.7 },
  gdpQoq: { USD: 0.8, EUR: 0.3, GBP: 0.2, JPY: 0.3, CHF: 0.5, AUD: 0.6, CAD: 0.4, NZD: 0.4, SGD: 0.7, NOK: 0.3, SEK: 0.2, MXN: 0.8, ZAR: 0.2, TRY: 1.1, BRL: 0.7, INR: 1.7, RUB: 0.9, PLN: 0.7, CZK: 0.6, HUF: 0.5, PEN: 0.6 },
  gdpAnnual: { USD: 2.8, EUR: 0.8, GBP: 0.6, JPY: 1.2, CHF: 1.8, AUD: 2.1, CAD: 1.5, NZD: 1.4, SGD: 2.8, NOK: 1.1, SEK: 0.9, MXN: 3.2, ZAR: 0.8, TRY: 4.5, BRL: 2.9, INR: 6.8, RUB: 3.6, PLN: 2.9, CZK: 2.4, HUF: 1.8, PEN: 2.5 },
  pmiMfg: { USD: 51.2, EUR: 46.8, GBP: 47.3, JPY: 49.8, CHF: 48.5, AUD: 50.8, CAD: 50.1, NZD: 49.2, SGD: 50.5, NOK: 50.2, SEK: 47.5, MXN: 51.6, ZAR: 48.7, TRY: 47.1, BRL: 52.8, INR: 56.5, RUB: 52.4, PLN: 49.5, CZK: 48.2, HUF: 47.8, PEN: 50.8 },
  pmiSvc: { USD: 52.4, EUR: 48.9, GBP: 50.2, JPY: 51.2, CHF: 49.5, AUD: 51.5, CAD: 51.8, NZD: 50.8, SGD: 52.2, NOK: 50.8, SEK: 49.2, MXN: 52.8, ZAR: 49.4, TRY: 48.2, BRL: 54.1, INR: 58.2, RUB: 53.1, PLN: 51.2, CZK: 50.5, HUF: 49.8, PEN: 51.5 },
  unemployment: { USD: 3.9, EUR: 6.5, GBP: 4.3, JPY: 2.6, CHF: 2.3, AUD: 4.1, CAD: 6.1, NZD: 4.5, SGD: 2.0, NOK: 4.1, SEK: 8.4, MXN: 2.8, ZAR: 32.1, TRY: 9.4, BRL: 7.8, INR: 7.1, RUB: 2.9, PLN: 5.0, CZK: 2.7, HUF: 4.5, PEN: 6.2 },
  consumer: { USD: 102.5, EUR: -14.5, GBP: -19.2, JPY: 36.8, CHF: -28.4, AUD: 82.4, CAD: 52.1, NZD: 88.2, SGD: 78.5, NOK: -18.2, SEK: 71.2, MXN: 45.8, ZAR: -10.5, TRY: 78.2, BRL: 91.2, INR: 89.5, RUB: -12.4, PLN: -8.5, CZK: 98.5, HUF: -12.8, PEN: 38.5 },
  retailSales: { USD: 0.4, EUR: 0.2, GBP: -0.1, JPY: 0.2, CHF: 0.1, AUD: 0.5, CAD: 0.3, NZD: 0.3, SGD: 0.5, NOK: 0.2, SEK: 0.1, MXN: 0.3, ZAR: -0.2, TRY: 0.6, BRL: 0.4, INR: 0.7, RUB: 0.8, PLN: 0.5, CZK: 0.4, HUF: 0.2, PEN: 0.2 },
  currentAccount: { USD: -221.5, EUR: 38.5, GBP: -28.6, JPY: 18.2, CHF: 21.4, AUD: -5.2, CAD: -8.5, NZD: -6.8, SGD: 28.5, NOK: 28.5, SEK: 8.2, MXN: -5.8, ZAR: -4.5, TRY: -8.2, BRL: -12.4, INR: -18.5, RUB: 12.8, PLN: 1.8, CZK: -1.2, HUF: -2.4, PEN: -2.1 },
  debt: { USD: 123.0, EUR: 89.0, GBP: 101.0, JPY: 264.0, CHF: 41.0, AUD: 57.0, CAD: 107.0, NZD: 52.0, SGD: 168.0, NOK: 43.0, SEK: 33.0, MXN: 52.0, ZAR: 72.0, TRY: 31.0, BRL: 74.0, INR: 83.0, RUB: 21.0, PLN: 49.0, CZK: 44.0, HUF: 73.0, PEN: 33.0 },
  trade: { USD: -78.2, EUR: 28.6, GBP: -18.4, JPY: -1.8, CHF: 8.5, AUD: 5.2, CAD: 2.1, NZD: -1.2, SGD: 12.8, NOK: 12.5, SEK: 4.8, MXN: -1.8, ZAR: -2.1, TRY: -5.8, BRL: 6.2, INR: -23.4, RUB: 15.2, PLN: -1.2, CZK: 2.1, HUF: -0.8, PEN: 0.8 },
  earnings: { USD: 4.1, EUR: 3.8, GBP: 5.8, JPY: 2.8, CHF: 2.2, AUD: 4.2, CAD: 3.5, NZD: 3.9, SGD: 4.8, NOK: 3.6, SEK: 3.2, MXN: 4.5, ZAR: 5.5, TRY: 12.4, BRL: 5.2, INR: 4.8, RUB: 8.5, PLN: 4.8, CZK: 4.5, HUF: 5.2, PEN: 3.8 },
  ppi: { USD: 2.2, EUR: 0.5, GBP: 2.8, JPY: 0.8, CHF: -0.2, AUD: 1.8, CAD: 1.5, NZD: 1.2, SGD: 1.2, NOK: 1.2, SEK: 0.6, MXN: 2.9, ZAR: 3.2, TRY: 45.2, BRL: 3.5, INR: 2.8, RUB: 4.5, PLN: 1.8, CZK: 1.4, HUF: 2.5, PEN: 1.5 },
  housing: { USD: 1420, EUR: 185, GBP: 215, JPY: 820, CHF: 52, AUD: 175, CAD: 245, NZD: 35, SGD: 8, NOK: 32, SEK: 48, MXN: 165, ZAR: 18, TRY: 125, BRL: 185, INR: 450, RUB: 95, PLN: 65, CZK: 38, HUF: 28, PEN: 45 },
  industrial: { USD: 0.4, EUR: -0.1, GBP: -0.3, JPY: -0.2, CHF: 0.1, AUD: 0.5, CAD: 0.3, NZD: 0.2, SGD: 0.6, NOK: 0.2, SEK: -0.2, MXN: 0.5, ZAR: -0.5, TRY: 0.8, BRL: 0.7, INR: 1.5, RUB: 1.2, PLN: 0.6, CZK: 0.4, HUF: 0.1, PEN: 0.3 },
  inventories: { USD: 0.3, EUR: 0.1, GBP: 0.2, JPY: 0.1, CHF: 0.1, AUD: 0.4, CAD: 0.2, NZD: 0.2, SGD: 0.3, NOK: 0.1, SEK: 0.1, MXN: 0.2, ZAR: 0.2, TRY: 0.4, BRL: 0.3, INR: 0.6, RUB: 0.5, PLN: 0.3, CZK: 0.3, HUF: 0.2, PEN: 0.2 },
  jolts: { USD: 8.8, EUR: 3.2, GBP: 0.85, JPY: 2.5, CHF: 0.12, AUD: 0.45, CAD: 0.9, NZD: 0.12, SGD: 0.18, NOK: 0.08, SEK: 0.15, MXN: 0.95, ZAR: 0.35, TRY: 1.2, BRL: 1.8, INR: 2.5, RUB: 1.8, PLN: 0.25, CZK: 0.18, HUF: 0.08, PEN: 0.18 },
  credit: { USD: 15.2, EUR: 5.5, GBP: 2.1, JPY: 2.8, CHF: 0.8, AUD: 1.2, CAD: 3.5, NZD: 0.4, SGD: 1.8, NOK: 0.4, SEK: 0.6, MXN: 1.5, ZAR: 0.9, TRY: 3.2, BRL: 2.8, INR: 4.5, RUB: 2.5, PLN: 0.8, CZK: 0.5, HUF: 0.3, PEN: 0.3 },
  factory: { USD: 0.5, EUR: 0.1, GBP: -0.2, JPY: -0.3, CHF: 0.1, AUD: 0.4, CAD: 0.2, NZD: 0.2, SGD: 0.4, NOK: 0.2, SEK: -0.1, MXN: 0.4, ZAR: -0.3, TRY: 0.5, BRL: 0.6, INR: 1.2, RUB: 0.8, PLN: 0.4, CZK: 0.3, HUF: 0.1, PEN: 0.2 },
  capacity: { USD: 78.5, EUR: 77.8, GBP: 76.4, JPY: 75.2, CHF: 82.1, AUD: 80.2, CAD: 79.8, NZD: 78.5, SGD: 81.5, NOK: 81.5, SEK: 76.8, MXN: 79.2, ZAR: 72.5, TRY: 75.8, BRL: 77.8, INR: 76.5, RUB: 74.2, PLN: 78.8, CZK: 79.5, HUF: 77.2, PEN: 78.1 },
  importExport: { USD: 0.3, EUR: 0.1, GBP: 0.8, JPY: -0.5, CHF: -0.3, AUD: 0.6, CAD: 0.2, NZD: 0.4, SGD: 0.3, NOK: 0.3, SEK: 0.2, MXN: 1.2, ZAR: 1.2, TRY: 8.5, BRL: 1.8, INR: 1.5, RUB: 2.8, PLN: 0.4, CZK: 0.5, HUF: 0.7, PEN: 0.6 },
};

// COT Data - Commitment of Traders
const defaultCotData = {
  USD: [
    { date: '1/13/2026', long: 17929, short: 21659, changeLong: 258, changeShort: 157, pctLong: 60.0, pctShort: 72.5, netPositions: -3730 },
    { date: '1/6/2026', long: 17671, short: 21502, changeLong: 1776, changeShort: 1012, pctLong: 58.8, pctShort: 71.5, netPositions: -3831 },
    { date: '12/16/2025', long: 15895, short: 20490, changeLong: 1117, changeShort: -8162, pctLong: 58.9, pctShort: 75.9, netPositions: -4595 },
    { date: '12/9/2025', long: 14778, short: 28652, changeLong: 334, changeShort: -2010, pctLong: 34.4, pctShort: 66.7, netPositions: -13874 },
    { date: '12/2/2025', long: 14444, short: 30662, changeLong: -4004, changeShort: -4133, pctLong: 33.0, pctShort: 70.0, netPositions: -16218 },
    { date: '11/25/2025', long: 18448, short: 34795, changeLong: 1555, changeShort: 1794, pctLong: 39.1, pctShort: 73.8, netPositions: -16347 },
    { date: '11/18/2025', long: 16893, short: 33001, changeLong: 889, changeShort: 1370, pctLong: 38.0, pctShort: 74.3, netPositions: -16108 },
    { date: '11/10/2025', long: 16004, short: 31631, changeLong: -641, changeShort: -576, pctLong: 37.4, pctShort: 73.9, netPositions: -15627 },
    { date: '11/4/2025', long: 16645, short: 32207, changeLong: 6038, changeShort: 5474, pctLong: 38.3, pctShort: 74.1, netPositions: -15562 },
    { date: '10/28/2025', long: 10607, short: 26733, changeLong: -530, changeShort: 229, pctLong: 30.3, pctShort: 76.4, netPositions: -16126 },
    { date: '10/21/2025', long: 11137, short: 26504, changeLong: -1142, changeShort: -708, pctLong: 31.5, pctShort: 74.9, netPositions: -15367 },
    { date: '10/14/2025', long: 12279, short: 27212, changeLong: -177, changeShort: 1611, pctLong: 33.1, pctShort: 73.3, netPositions: -14933 },
    { date: '10/7/2025', long: 12456, short: 25601, changeLong: 2730, changeShort: 2239, pctLong: 32.2, pctShort: 66.1, netPositions: -13145 },
    { date: '9/30/2025', long: 9726, short: 23362, changeLong: -4306, changeShort: -1014, pctLong: 27.2, pctShort: 65.4, netPositions: -13636 },
  ],
  EUR: [
    { date: '1/13/2026', long: 185420, short: 142350, changeLong: 5280, changeShort: -2150, pctLong: 56.6, pctShort: 43.4, netPositions: 43070 },
    { date: '1/6/2026', long: 180140, short: 144500, changeLong: 3250, changeShort: 1820, pctLong: 55.5, pctShort: 44.5, netPositions: 35640 },
    { date: '12/16/2025', long: 176890, short: 142680, changeLong: -1450, changeShort: -3280, pctLong: 55.4, pctShort: 44.6, netPositions: 34210 },
    { date: '12/9/2025', long: 178340, short: 145960, changeLong: 2890, changeShort: 4520, pctLong: 55.0, pctShort: 45.0, netPositions: 32380 },
    { date: '12/2/2025', long: 175450, short: 141440, changeLong: -4120, changeShort: -2890, pctLong: 55.4, pctShort: 44.6, netPositions: 34010 },
    { date: '11/25/2025', long: 179570, short: 144330, changeLong: 6780, changeShort: 3450, pctLong: 55.4, pctShort: 44.6, netPositions: 35240 },
    { date: '11/18/2025', long: 172790, short: 140880, changeLong: 1240, changeShort: -1580, pctLong: 55.1, pctShort: 44.9, netPositions: 31910 },
  ],
  GBP: [
    { date: '1/13/2026', long: 89450, short: 72180, changeLong: 2340, changeShort: -1890, pctLong: 55.3, pctShort: 44.7, netPositions: 17270 },
    { date: '1/6/2026', long: 87110, short: 74070, changeLong: 1560, changeShort: 2450, pctLong: 54.0, pctShort: 46.0, netPositions: 13040 },
    { date: '12/16/2025', long: 85550, short: 71620, changeLong: -890, changeShort: -2180, pctLong: 54.4, pctShort: 45.6, netPositions: 13930 },
    { date: '12/9/2025', long: 86440, short: 73800, changeLong: 3120, changeShort: 1780, pctLong: 53.9, pctShort: 46.1, netPositions: 12640 },
    { date: '12/2/2025', long: 83320, short: 72020, changeLong: -2450, changeShort: -1120, pctLong: 53.6, pctShort: 46.4, netPositions: 11300 },
  ],
  JPY: [
    { date: '1/13/2026', long: 45620, short: 128450, changeLong: -3280, changeShort: 5420, pctLong: 26.2, pctShort: 73.8, netPositions: -82830 },
    { date: '1/6/2026', long: 48900, short: 123030, changeLong: 1450, changeShort: -2890, pctLong: 28.4, pctShort: 71.6, netPositions: -74130 },
    { date: '12/16/2025', long: 47450, short: 125920, changeLong: -2180, changeShort: 3450, pctLong: 27.4, pctShort: 72.6, netPositions: -78470 },
    { date: '12/9/2025', long: 49630, short: 122470, changeLong: 890, changeShort: -1560, pctLong: 28.8, pctShort: 71.2, netPositions: -72840 },
    { date: '12/2/2025', long: 48740, short: 124030, changeLong: -1780, changeShort: 2340, pctLong: 28.2, pctShort: 71.8, netPositions: -75290 },
  ],
  CHF: [
    { date: '1/13/2026', long: 12450, short: 28920, changeLong: 560, changeShort: -1230, pctLong: 30.1, pctShort: 69.9, netPositions: -16470 },
    { date: '1/6/2026', long: 11890, short: 30150, changeLong: -890, changeShort: 1450, pctLong: 28.3, pctShort: 71.7, netPositions: -18260 },
    { date: '12/16/2025', long: 12780, short: 28700, changeLong: 1120, changeShort: -2340, pctLong: 30.8, pctShort: 69.2, netPositions: -15920 },
    { date: '12/9/2025', long: 11660, short: 31040, changeLong: -450, changeShort: 890, pctLong: 27.3, pctShort: 72.7, netPositions: -19380 },
  ],
  AUD: [
    { date: '1/13/2026', long: 52340, short: 89120, changeLong: 2890, changeShort: -1560, pctLong: 37.0, pctShort: 63.0, netPositions: -36780 },
    { date: '1/6/2026', long: 49450, short: 90680, changeLong: -1230, changeShort: 2340, pctLong: 35.3, pctShort: 64.7, netPositions: -41230 },
    { date: '12/16/2025', long: 50680, short: 88340, changeLong: 1780, changeShort: -890, pctLong: 36.5, pctShort: 63.5, netPositions: -37660 },
    { date: '12/9/2025', long: 48900, short: 89230, changeLong: -2450, changeShort: 1120, pctLong: 35.4, pctShort: 64.6, netPositions: -40330 },
  ],
  CAD: [
    { date: '1/13/2026', long: 68920, short: 95450, changeLong: 1560, changeShort: -2890, pctLong: 41.9, pctShort: 58.1, netPositions: -26530 },
    { date: '1/6/2026', long: 67360, short: 98340, changeLong: -890, changeShort: 1450, pctLong: 40.7, pctShort: 59.3, netPositions: -30980 },
    { date: '12/16/2025', long: 68250, short: 96890, changeLong: 2340, changeShort: -1780, pctLong: 41.3, pctShort: 58.7, netPositions: -28640 },
    { date: '12/9/2025', long: 65910, short: 98670, changeLong: -1120, changeShort: 2560, pctLong: 40.0, pctShort: 60.0, netPositions: -32760 },
  ],
  NZD: [
    { date: '1/13/2026', long: 18450, short: 32180, changeLong: 890, changeShort: -1230, pctLong: 36.4, pctShort: 63.6, netPositions: -13730 },
    { date: '1/6/2026', long: 17560, short: 33410, changeLong: -560, changeShort: 1890, pctLong: 34.4, pctShort: 65.6, netPositions: -15850 },
    { date: '12/16/2025', long: 18120, short: 31520, changeLong: 1450, changeShort: -890, pctLong: 36.5, pctShort: 63.5, netPositions: -13400 },
    { date: '12/9/2025', long: 16670, short: 32410, changeLong: -780, changeShort: 1560, pctLong: 34.0, pctShort: 66.0, netPositions: -15740 },
  ],
  MXN: [
    { date: '1/13/2026', long: 125680, short: 78450, changeLong: 4560, changeShort: -2340, pctLong: 61.6, pctShort: 38.4, netPositions: 47230 },
    { date: '1/6/2026', long: 121120, short: 80790, changeLong: 2890, changeShort: 1560, pctLong: 60.0, pctShort: 40.0, netPositions: 40330 },
    { date: '12/16/2025', long: 118230, short: 79230, changeLong: -1780, changeShort: -2890, pctLong: 59.9, pctShort: 40.1, netPositions: 39000 },
  ],
};

// Generate simulated price data for charts
const generatePriceData = (direction) => {
  const data = [];
  let price = 1.08 + Math.random() * 0.04;
  const trend = direction === 'Bullish' ? 0.0008 : direction === 'Bearish' ? -0.0008 : 0;
  for (let i = 0; i < 40; i++) {
    price += (Math.random() - 0.5) * 0.003 + trend;
    data.push({ t: i, p: parseFloat(price.toFixed(5)), ma: i > 10 ? parseFloat((price - 0.002 + Math.random() * 0.004).toFixed(5)) : null });
  }
  return data;
};

// Change Indicator Notification
const ChangeIndicator = ({ changes, onDismiss }) => {
  if (changes.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-slideUp">
      <div className="bg-gradient-to-r from-amber-900/95 to-orange-900/95 backdrop-blur-xl rounded-lg border border-amber-500/50 shadow-2xl overflow-hidden">
        <div className="px-4 py-3 bg-amber-500/20 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔔</span>
            <span className="font-bold text-amber-200">Changes Detected</span>
            <span className="px-2 py-0.5 bg-amber-500/30 rounded-full text-xs font-mono text-amber-300">{changes.length}</span>
          </div>
          <button onClick={onDismiss} className="text-amber-400 hover:text-amber-200 p-1">✕</button>
        </div>
        <div className="max-h-64 overflow-y-auto p-3 space-y-2">
          {changes.map((change, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
              <span className="text-lg">{change.type === 'increase' ? '📈' : change.type === 'decrease' ? '📉' : change.type === 'rank_up' ? '🏆' : '⬇️'}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-200 text-sm">{change.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{change.description}</div>
                {change.oldValue !== undefined && (
                  <div className="flex items-center gap-2 mt-1 text-xs font-mono">
                    <span className="text-rose-400">{change.oldValue}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-emerald-400">{change.newValue}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// API Configuration Panel
const ApiConfigPanel = ({ config, onConfigChange, onFetch, isLoading, lastFetch, error }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden mb-4">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/80 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔌</span>
          <span className="font-semibold text-slate-200">API Configuration</span>
          {config.apiUrl && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">Configured</span>}
        </div>
        <span className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-700/50 pt-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">API Endpoint URL</label>
            <input type="url" value={config.apiUrl} onChange={(e) => onConfigChange({ ...config, apiUrl: e.target.value })}
              placeholder="https://api.example.com/economic-data"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">API Key (Optional)</label>
            <input type="password" value={config.apiKey} onChange={(e) => onConfigChange({ ...config, apiKey: e.target.value })}
              placeholder="Enter your API key..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Custom Headers (JSON)</label>
            <textarea value={config.headers} onChange={(e) => onConfigChange({ ...config, headers: e.target.value })}
              placeholder='{"Content-Type": "application/json"}' rows={2}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono text-sm resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Response Data Path</label>
            <input type="text" value={config.dataPath} onChange={(e) => onConfigChange({ ...config, dataPath: e.target.value })}
              placeholder="data.indicators or leave empty"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono text-sm" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={config.autoRefresh} onChange={(e) => onConfigChange({ ...config, autoRefresh: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500" />
              <span className="text-sm text-slate-300">Auto-refresh</span>
            </label>
            {config.autoRefresh && (
              <div className="flex items-center gap-2">
                <input type="number" min="10" max="3600" value={config.refreshInterval}
                  onChange={(e) => onConfigChange({ ...config, refreshInterval: parseInt(e.target.value) || 60 })}
                  className="w-20 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100 text-sm font-mono" />
                <span className="text-sm text-slate-400">seconds</span>
              </div>
            )}
          </div>
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-rose-400 text-sm"><span>⚠️</span><span>{error}</span></div>
            </div>
          )}
          <div className="flex items-center justify-between pt-2">
            <button onClick={onFetch} disabled={isLoading || !config.apiUrl}
              className={`px-6 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 ${isLoading || !config.apiUrl ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-brand-500 to-brand-600 text-[var(--color-text-primary)] hover:from-brand-400 hover:to-brand-500 shadow-lg'}`}>
              {isLoading ? <><span className="animate-spin">⟳</span><span>Fetching...</span></> : <><span>🔄</span><span>Fetch Data</span></>}
            </button>
            {lastFetch && <div className="text-xs text-slate-500">Last: {lastFetch.toLocaleTimeString()}</div>}
          </div>
          <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
            <h4 className="text-sm font-medium text-slate-300 mb-2">📋 Expected Response Format</h4>
            <pre className="text-xs text-slate-400 overflow-x-auto">{`{
  "gdp": { "USD": 2.8, "JPY": 1.2, ... },
  "inflation": { "USD": 3.2, ... },
  ...
}`}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

// Change History Panel
const ChangeHistoryPanel = ({ history, onClear }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (history.length === 0) return null;
  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden mb-4">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/80">
        <div className="flex items-center gap-3">
          <span className="text-xl">📜</span>
          <span className="font-semibold text-slate-200">Change History</span>
          <span className="px-2 py-0.5 bg-brand-500/20 text-brand-400 text-xs rounded-full">{history.length}</span>
        </div>
        <span className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-700/50 pt-4">
          <div className="flex justify-end mb-3">
            <button onClick={onClear} className="px-3 py-1.5 text-xs text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-500/10">Clear History</button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {history.map((entry, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <span className="text-lg">{entry.type === 'increase' ? '📈' : entry.type === 'decrease' ? '📉' : entry.type === 'rank_up' ? '🏆' : '⬇️'}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-200 text-sm">{entry.title}</span>
                    <span className="text-xs text-slate-500">{entry.timestamp?.toLocaleTimeString()}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{entry.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// COT Data Panel Component
const CotDataPanel = ({ cotData, selectedCurrency, onCurrencyChange, cotApiConfig, onCotApiConfigChange, onFetchCot, isCotLoading, cotLastFetch, cotError }) => {
  const data = cotData[selectedCurrency] || [];
  const availableCurrencies = Object.keys(cotData);
  
  return (
    <div className="space-y-4">
      {/* COT API Configuration */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔌</span>
            <span className="font-semibold text-slate-200">COT Data API</span>
          </div>
          {cotLastFetch && <span className="text-xs text-slate-500">Last: {cotLastFetch.toLocaleTimeString()}</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">COT API Endpoint</label>
            <input type="url" value={cotApiConfig.apiUrl} onChange={(e) => onCotApiConfigChange({ ...cotApiConfig, apiUrl: e.target.value })}
              placeholder="https://api.example.com/cot-data"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">API Key (Optional)</label>
            <input type="password" value={cotApiConfig.apiKey} onChange={(e) => onCotApiConfigChange({ ...cotApiConfig, apiKey: e.target.value })}
              placeholder="Enter API key..."
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono text-sm" />
          </div>
        </div>
        {cotError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg mb-4">
            <span className="text-rose-400 text-sm">⚠️ {cotError}</span>
          </div>
        )}
        <button onClick={onFetchCot} disabled={isCotLoading || !cotApiConfig.apiUrl}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${isCotLoading || !cotApiConfig.apiUrl ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-brand-500 to-brand-600 text-[var(--color-text-primary)] hover:from-brand-400 hover:to-brand-500'}`}>
          {isCotLoading ? <><span className="animate-spin">⟳</span><span>Fetching...</span></> : <><span>🔄</span><span>Fetch COT Data</span></>}
        </button>
      </div>

      {/* Currency Selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-slate-400 font-medium">Select Currency:</label>
        <div className="flex flex-wrap gap-2">
          {availableCurrencies.map(curr => (
            <button key={curr} onClick={() => onCurrencyChange(curr)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selectedCurrency === curr 
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
              style={selectedCurrency === curr ? { borderColor: currencyColors[curr], color: currencyColors[curr] } : {}}>
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* COT Data Table */}
      <div className="bg-slate-800/30 rounded-lg border border-slate-700 overflow-hidden">
        <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" style={{ color: currencyColors[selectedCurrency] }}>{selectedCurrency}</span>
            <span className="text-slate-400">Commitment of Traders Report</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${data[0]?.netPositions > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              Net: {data[0]?.netPositions?.toLocaleString() || 'N/A'}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/50">
                <th className="text-left py-3 px-4 font-semibold text-slate-400">DATE</th>
                <th className="text-center py-3 px-4 font-semibold text-emerald-400">LONG</th>
                <th className="text-center py-3 px-4 font-semibold text-rose-400">SHORT</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-400">CHANGE LONG</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-400">CHANGE SHORT</th>
                <th className="text-center py-3 px-4 font-semibold text-emerald-400">% LONG</th>
                <th className="text-center py-3 px-4 font-semibold text-rose-400">% SHORT</th>
                <th className="text-center py-3 px-4 font-semibold text-cyan-400">NET POSITIONS</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className={`border-t border-slate-800 ${idx % 2 === 0 ? 'bg-slate-900/30' : ''} hover:bg-slate-800/50`}>
                  <td className="py-3 px-4 text-slate-300 font-mono">{row.date}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono">{row.long.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-3 py-1 rounded bg-rose-500/20 text-rose-300 font-mono">{row.short.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-mono ${row.changeLong >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {row.changeLong >= 0 ? '+' : ''}{row.changeLong.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-mono ${row.changeShort >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {row.changeShort >= 0 ? '+' : ''}{row.changeShort.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-300 font-mono">{row.pctLong} %</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-3 py-1 rounded bg-rose-500/10 text-rose-300 font-mono">{row.pctShort} %</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1.5 rounded font-mono font-semibold ${row.netPositions >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                      {row.netPositions.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <span className="text-4xl mb-4 block">📊</span>
            <p>No COT data available for {selectedCurrency}</p>
            <p className="text-sm mt-2">Configure the API or select another currency</p>
          </div>
        )}
      </div>

      {/* COT Summary */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Latest Net Position</div>
            <div className={`text-2xl font-bold font-mono ${data[0]?.netPositions >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data[0]?.netPositions?.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Long Positions</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">{data[0]?.long?.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Short Positions</div>
            <div className="text-2xl font-bold font-mono text-rose-400">{data[0]?.short?.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="text-slate-400 text-sm mb-1">Sentiment</div>
            <div className={`text-2xl font-bold ${data[0]?.pctLong > 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data[0]?.pctLong > 50 ? '🐂 Bullish' : '🐻 Bearish'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Price Chart Component
const PriceChart = ({ pair, direction, timeframe }) => {
  const data = useMemo(() => generatePriceData(direction), [direction]);
  const prices = data.map(d => d.p);
  const high = Math.max(...prices), low = Math.min(...prices), range = high - low;
  const fibs = { f236: low + range * 0.236, f382: low + range * 0.382, f500: low + range * 0.5, f618: low + range * 0.618 };
  
  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-[var(--color-text-primary)]">{pair} <span className="text-brand-400 text-sm ml-2">{timeframe}</span></span>
        <span className={`text-sm ${direction === 'Bullish' ? 'text-emerald-400' : direction === 'Bearish' ? 'text-rose-400' : 'text-slate-400'}`}>{direction}</span>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="t" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
            <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 10 }} width={55} tickFormatter={v => v.toFixed(4)} />
            <ReferenceLine y={fibs.f236} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.5} />
            <ReferenceLine y={fibs.f382} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.5} />
            <ReferenceLine y={fibs.f500} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.7} />
            <ReferenceLine y={fibs.f618} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.5} />
            <Area type="monotone" dataKey="p" stroke="none" fill={direction === 'Bullish' ? '#22c55e' : '#ef4444'} fillOpacity={0.1} />
            <Line type="monotone" dataKey="p" stroke={direction === 'Bullish' ? '#22c55e' : direction === 'Bearish' ? '#ef4444' : '#94a3b8'} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ma" stroke="#06b6d4" strokeWidth={1.5} dot={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} formatter={v => v?.toFixed(5)} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
        {[['23.6%', fibs.f236], ['38.2%', fibs.f382], ['50%', fibs.f500], ['61.8%', fibs.f618]].map(([l, v]) => (
          <div key={l} className="bg-slate-800 rounded px-2 py-1 flex justify-between">
            <span className="text-amber-400">{l}</span>
            <span className="text-slate-300 font-mono">{v.toFixed(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Trade Setup Component
const TradeSetup = ({ direction }) => {
  const entry = 1.0850, sl = direction === 'Bullish' ? 1.0800 : 1.0900;
  const tp1 = direction === 'Bullish' ? 1.0900 : 1.0800, tp2 = direction === 'Bullish' ? 1.0950 : 1.0750;
  const risk = Math.abs(entry - sl) * 10000, reward = Math.abs(tp2 - entry) * 10000;
  
  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
      <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">🎯 Trade Setup</h4>
      <div className="space-y-2">
        {[['SL', sl, '#ef4444'], ['Entry', entry, '#10b981'], ['TP1', tp1, '#22c55e'], ['TP2', tp2, '#22c55e']].map(([n, p, c]) => (
          <div key={n} className="flex items-center gap-2">
            <span className="w-12 text-xs" style={{ color: c }}>{n}</span>
            <div className="flex-1 h-2 bg-slate-800 rounded">
              <div className="h-full rounded" style={{ width: n === 'Entry' ? '50%' : n === 'SL' ? '20%' : '80%', backgroundColor: c, opacity: 0.6 }} />
            </div>
            <span className="text-xs font-mono text-slate-300 w-16 text-right">{p.toFixed(5)}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
        <div className="bg-slate-800 rounded p-2"><div className="text-slate-400">Risk</div><div className="text-rose-400 font-mono">{risk.toFixed(0)} pips</div></div>
        <div className="bg-slate-800 rounded p-2"><div className="text-slate-400">Reward</div><div className="text-emerald-400 font-mono">{reward.toFixed(0)} pips</div></div>
        <div className="bg-brand-500/20 rounded p-2 border border-brand-500/30"><div className="text-brand-400">R:R</div><div className="text-violet-300 font-mono">1:{(reward/risk).toFixed(1)}</div></div>
      </div>
    </div>
  );
};

// MTF Confluence Component
const MTFConfluence = ({ direction }) => {
  const tfs = [{ tf: '1H', dir: direction, w: 20 }, { tf: '4H', dir: direction, w: 35 }, { tf: 'Daily', dir: direction, w: 45 }];
  const score = tfs.reduce((a, t) => a + (t.dir === 'Bullish' ? t.w : t.dir === 'Bearish' ? -t.w : 0), 0);
  
  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
      <h4 className="font-semibold text-[var(--color-text-primary)] mb-3">⏱️ Multi-Timeframe</h4>
      <div className="space-y-2">
        {tfs.map(t => (
          <div key={t.tf} className="flex items-center gap-2">
            <span className="w-12 text-xs text-slate-400">{t.tf}</span>
            <div className="flex-1 h-7 bg-slate-800 rounded flex items-center px-2">
              <span className={`text-lg ${t.dir === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>{t.dir === 'Bullish' ? '↑' : '↓'}</span>
              <span className={`ml-2 text-sm ${t.dir === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>{t.dir}</span>
            </div>
          </div>
        ))}
      </div>
      <div className={`mt-4 p-3 rounded-lg text-center ${score > 0 ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-rose-500/20 border border-rose-500/30'}`}>
        <div className="text-xs text-slate-400">Confluence</div>
        <div className={`text-xl font-bold ${score > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{score > 0 ? '+' : ''}{score}% ✓</div>
      </div>
    </div>
  );
};

// AI Analysis Agent
const AIAgent = ({ isOpen, onClose, pairs, scores, sorted }) => {
  const [pair, setPair] = useState(null);
  const [tf, setTf] = useState('4H');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const runAnalysis = async (p, t) => {
    setPair(p); setLoading(true);
    const pairData = pairs.find(x => x.pair === p);
    setMessages(m => [...m, { role: 'user', text: `Analyze ${p} on ${t}`, time: new Date() }]);
    
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 3000,
          messages: [{ role: 'user', content: `You are an expert forex analyst. Analyze ${p} on ${t} timeframe. Fundamental bias: ${pairData?.direction}. Provide: 1) PRICE ACTION: trend, key patterns, S/R levels 2) GEOMETRY: Fibonacci levels, chart patterns, harmonics 3) TRADE SETUP: entry, SL, TP1/TP2/TP3, R:R ratio. Be specific with prices.` }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || 'Analysis unavailable';
      setMessages(m => [...m, { role: 'assistant', text, pair: p, tf: t, time: new Date() }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', text: 'Error: ' + e.message, error: true, time: new Date() }]);
    }
    setLoading(false);
  };

  const handleQuery = async () => {
    if (!input.trim()) return;
    const q = input; setInput(''); setLoading(true);
    setMessages(m => [...m, { role: 'user', text: q, time: new Date() }]);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 2000,
          messages: [{ role: 'user', content: `Forex analyst context - Top currencies: ${sorted.slice(0,3).join(', ')}. Query: ${q}` }]
        })
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', text: data.content?.[0]?.text || 'Error', time: new Date() }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', text: 'Error: ' + e.message, error: true, time: new Date() }]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;
  const currentPair = pairs.find(x => x.pair === pair);

  return (
    <div className="fixed bottom-4 right-4 w-[700px] max-w-[95vw] max-h-[85vh] bg-slate-900 rounded-lg border border-cyan-500/30 shadow-2xl z-50 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-brand-500/20 to-violet-600/20 px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-500 rounded-lg flex items-center justify-center">🤖</div>
          <div><h3 className="font-bold text-[var(--color-text-primary)]">AI Technical Analyst</h3><p className="text-xs text-slate-400">Price Action & Geometry Charts</p></div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">✕</button>
      </div>
      
      <div className="px-4 py-3 border-b border-slate-700 space-y-2">
        <div className="flex flex-wrap gap-1">
          {pairs.filter(p => p.signal !== 'Weak').slice(0, 8).map(p => (
            <button key={p.pair} onClick={() => runAnalysis(p.pair, tf)}
              className={`px-2 py-1 text-xs rounded border transition-all ${pair === p.pair ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : p.direction === 'Bullish' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              {p.pair} {p.direction === 'Bullish' ? '↑' : '↓'}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {['1H', '4H', 'Daily'].map(t => (
            <button key={t} onClick={() => { setTf(t); if (pair) runAnalysis(pair, t); }}
              className={`px-3 py-1 text-xs rounded ${tf === t ? 'bg-brand-500/30 text-violet-300 border border-brand-500' : 'bg-slate-800 text-slate-400'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!pair ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <h4 className="text-[var(--color-text-primary)] font-semibold mb-2">Select a Currency Pair</h4>
            <p className="text-slate-400 text-sm">Click any pair above to get AI analysis with interactive charts</p>
          </div>
        ) : (
          <>
            <PriceChart pair={pair} direction={currentPair?.direction || 'Neutral'} timeframe={tf} />
            <div className="grid grid-cols-2 gap-4">
              <TradeSetup direction={currentPair?.direction || 'Bullish'} />
              <MTFConfluence direction={currentPair?.direction || 'Bullish'} />
            </div>
            {messages.map((m, i) => (
              <div key={i} className={`rounded-lg p-4 ${m.role === 'user' ? 'bg-cyan-500/10 border border-cyan-500/30 ml-8' : m.error ? 'bg-rose-500/10 border border-rose-500/30' : 'bg-slate-800 border border-slate-700 mr-8'}`}>
                {m.pair && <div className="flex gap-2 mb-2"><span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">{m.pair}</span><span className="px-2 py-0.5 bg-brand-500/20 text-brand-400 text-xs rounded">{m.tf}</span></div>}
                <div className="text-sm text-slate-300 whitespace-pre-wrap">{m.text}</div>
                <div className="text-xs text-slate-500 mt-2">{m.time?.toLocaleTimeString()}</div>
              </div>
            ))}
            {loading && (
              <div className="bg-slate-800 rounded-lg p-4 flex items-center gap-3">
                <div className="flex gap-1">{[0, 150, 300].map(d => <span key={d} className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}</div>
                <span className="text-slate-400 text-sm">Analyzing...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </>
        )}
      </div>
      
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleQuery()}
            placeholder="Ask about price action, patterns, levels..." disabled={loading}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none text-sm" />
          <button onClick={handleQuery} disabled={loading || !input.trim()}
            className={`px-4 py-3 rounded-lg font-semibold ${loading || !input.trim() ? 'bg-slate-700 text-slate-500' : 'bg-gradient-to-r from-brand-500 to-violet-600 text-[var(--color-text-primary)]'}`}>
            {loading ? '⟳' : '→'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const [tab, setTab] = useState('input');
  const [data, setData] = useState(defaultData);
  const [indicators, setIndicators] = useState(defaultIndicators);
  const [editMode, setEditMode] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [apiConfig, setApiConfig] = useState({ apiUrl: '', apiKey: '', headers: '', dataPath: '', autoRefresh: false, refreshInterval: 60 });
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [changes, setChanges] = useState([]);
  const [changeHistory, setChangeHistory] = useState([]);
  const [showChanges, setShowChanges] = useState(true);
  const [previousData, setPreviousData] = useState(null);
  const [previousRankings, setPreviousRankings] = useState(null);
  const [cotData, setCotData] = useState(defaultCotData);
  const [selectedCotCurrency, setSelectedCotCurrency] = useState('USD');
  const [cotApiConfig, setCotApiConfig] = useState({ apiUrl: '', apiKey: '' });
  const [isCotLoading, setIsCotLoading] = useState(false);
  const [cotLastFetch, setCotLastFetch] = useState(null);
  const [cotError, setCotError] = useState(null);
  const refreshIntervalRef = useRef(null);
  const isInitialMount = useRef(true);

  const totalWeight = Math.round(indicators.reduce((sum, ind) => sum + ind.weight, 0) * 100) / 100;

  const rankings = useMemo(() => {
    const r = {};
    indicators.forEach(ind => {
      const vals = currencies.map(c => ({ c, v: data[ind.id][c] })).sort((a, b) => ind.inverse ? a.v - b.v : b.v - a.v);
      r[ind.id] = {}; vals.forEach((x, i) => r[ind.id][x.c] = i + 1);
    });
    return r;
  }, [data, indicators]);

  const scores = useMemo(() => {
    const s = {};
    currencies.forEach(c => {
      s[c] = indicators.reduce((sum, ind) => sum + ((9 - rankings[ind.id][c]) / 7) * (ind.weight / totalWeight) * 100, 0);
    });
    return s;
  }, [rankings, indicators, totalWeight]);

  const sorted = useMemo(() => [...currencies].sort((a, b) => scores[b] - scores[a]), [scores]);

  // Change detection
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setPreviousData(JSON.parse(JSON.stringify(data)));
      setPreviousRankings(JSON.parse(JSON.stringify(rankings)));
      return;
    }
    if (!previousData) {
      setPreviousData(JSON.parse(JSON.stringify(data)));
      setPreviousRankings(JSON.parse(JSON.stringify(rankings)));
      return;
    }
    const detected = [];
    Object.keys(data).forEach(indId => {
      const ind = indicators.find(i => i.id === indId);
      if (!ind) return;
      currencies.forEach(curr => {
        const oldVal = previousData[indId]?.[curr], newVal = data[indId][curr];
        if (oldVal !== undefined && oldVal !== newVal) {
          const diff = newVal - oldVal;
          detected.push({ type: diff > 0 ? 'increase' : 'decrease', title: `${curr} ${ind.name}`, description: `Value ${diff > 0 ? 'increased' : 'decreased'} by ${Math.abs(diff).toFixed(2)}`, oldValue: oldVal.toFixed(2), newValue: newVal.toFixed(2), timestamp: new Date() });
        }
      });
    });
    if (previousRankings) {
      currencies.forEach(curr => {
        indicators.forEach(ind => {
          const oldRank = previousRankings[ind.id]?.[curr], newRank = rankings[ind.id][curr];
          if (oldRank !== undefined && oldRank !== newRank) {
            const improved = newRank < oldRank;
            detected.push({ type: improved ? 'rank_up' : 'rank_down', title: `${curr} Ranking`, description: `${ind.name}: ${improved ? 'Up' : 'Down'} #${oldRank} → #${newRank}`, oldValue: `#${oldRank}`, newValue: `#${newRank}`, timestamp: new Date() });
          }
        });
      });
    }
    if (detected.length > 0) {
      setChanges(detected);
      setChangeHistory(prev => [...detected, ...prev].slice(0, 100));
      setShowChanges(true);
    }
    setPreviousData(JSON.parse(JSON.stringify(data)));
    setPreviousRankings(JSON.parse(JSON.stringify(rankings)));
  }, [data, rankings, indicators]);

  // API fetch
  const fetchApiData = useCallback(async () => {
    if (!apiConfig.apiUrl) return;
    setIsLoading(true); setApiError(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiConfig.apiKey) headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
      if (apiConfig.headers) { try { Object.assign(headers, JSON.parse(apiConfig.headers)); } catch {} }
      const response = await fetch(apiConfig.apiUrl, { method: 'GET', headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      let resData = await response.json();
      if (apiConfig.dataPath) {
        for (const part of apiConfig.dataPath.split('.')) {
          resData = resData?.[part];
          if (!resData) throw new Error('Path not found');
        }
      }
      const newData = { ...data }; let valid = false;
      indicators.forEach(ind => {
        if (resData[ind.id]) {
          currencies.forEach(curr => {
            if (typeof resData[ind.id][curr] === 'number') {
              newData[ind.id][curr] = resData[ind.id][curr];
              valid = true;
            }
          });
        }
      });
      if (!valid) throw new Error('No valid data');
      setData(newData); setLastFetch(new Date());
    } catch (e) { setApiError(e.message); }
    setIsLoading(false);
  }, [apiConfig, data, indicators]);

  // Auto refresh
  useEffect(() => {
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    if (apiConfig.autoRefresh && apiConfig.apiUrl) {
      refreshIntervalRef.current = setInterval(fetchApiData, apiConfig.refreshInterval * 1000);
    }
    return () => { if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current); };
  }, [apiConfig.autoRefresh, apiConfig.refreshInterval, apiConfig.apiUrl, fetchApiData]);

  // COT Data Fetch
  const fetchCotData = useCallback(async () => {
    if (!cotApiConfig.apiUrl) return;
    setIsCotLoading(true); setCotError(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (cotApiConfig.apiKey) headers['Authorization'] = `Bearer ${cotApiConfig.apiKey}`;
      const response = await fetch(cotApiConfig.apiUrl, { method: 'GET', headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const resData = await response.json();
      // Expecting format: { USD: [...], EUR: [...], ... }
      if (typeof resData === 'object' && Object.keys(resData).length > 0) {
        setCotData(prev => ({ ...prev, ...resData }));
        setCotLastFetch(new Date());
      } else {
        throw new Error('Invalid COT data format');
      }
    } catch (e) { setCotError(e.message); }
    setIsCotLoading(false);
  }, [cotApiConfig]);

  const pairs = useMemo(() => {
    const p = [];
    for (let i = 0; i < currencies.length; i++) {
      for (let j = i + 1; j < currencies.length; j++) {
        const base = currencies[i], quote = currencies[j];
        const diff = scores[base] - scores[quote], abs = Math.abs(diff);
        p.push({
          pair: `${base}/${quote}`, base, quote, diff: diff.toFixed(1),
          baseScore: scores[base].toFixed(1), quoteScore: scores[quote].toFixed(1),
          direction: abs < 5 ? 'Neutral' : diff > 0 ? 'Bullish' : 'Bearish',
          signal: abs >= 15 ? 'Strong' : abs >= 5 ? 'Moderate' : 'Weak'
        });
      }
    }
    return p;
  }, [scores]);

  const radarData = useMemo(() => indicators.map(ind => {
    const p = { name: ind.name.split(' ')[0] };
    currencies.forEach(c => p[c] = 9 - rankings[ind.id][c]);
    return p;
  }), [rankings, indicators]);

  const handleDataChange = (indId, curr, val) => setData(d => ({ ...d, [indId]: { ...d[indId], [curr]: parseFloat(val) || 0 } }));
  const handleWeightChange = (indId, val) => setIndicators(inds => inds.map(ind => ind.id === indId ? { ...ind, weight: parseFloat(val) || 0 } : ind));

  const exportData = () => {
    let csv = 'MMITPS Trade Station Export\n\nIndicators\nIndicator,Weight,' + currencies.join(',') + '\n';
    indicators.forEach(ind => { csv += `${ind.name},${ind.weight},${currencies.map(c => data[ind.id][c]).join(',')}\n`; });
    csv += '\nRankings\nIndicator,' + currencies.join(',') + '\n';
    indicators.forEach(ind => { csv += `${ind.name},${currencies.map(c => rankings[ind.id][c]).join(',')}\n`; });
    csv += '\nScores\nCurrency,Score,Rank\n';
    sorted.forEach((curr, i) => { csv += `${curr},${scores[curr].toFixed(2)},${i + 1}\n`; });
    if (changeHistory.length > 0) {
      csv += '\nChange History\nTime,Type,Title,Description\n';
      changeHistory.forEach(ch => { csv += `${ch.timestamp?.toLocaleString()},${ch.type},${ch.title},${ch.description}\n`; });
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mmitps_analysis.csv'; a.click();
  };

  const rankColor = r => r <= 2 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : r <= 4 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  const strengthClass = (score) => { const max = Math.max(...Object.values(scores)), min = Math.min(...Object.values(scores)), norm = (score - min) / (max - min); return norm > 0.7 ? 'Strong' : norm > 0.4 ? 'Moderate' : 'Weak'; };

  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-6" style={{ fontFamily: "'JetBrains Mono', system-ui, sans-serif" }}>
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-slideUp { animation: slideUp 0.3s ease-out; } @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 1000px; } } .animate-slideDown { animation: slideDown 0.3s ease-out; }`}</style>
      
      <button onClick={() => setShowAI(true)} className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-500 rounded-lg shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">🤖</button>
      <AIAgent isOpen={showAI} onClose={() => setShowAI(false)} pairs={pairs} scores={scores} sorted={sorted} />
      {showChanges && <ChangeIndicator changes={changes} onDismiss={() => { setShowChanges(false); setChanges([]); }} />}

      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-brand-400 to-fuchsia-400 bg-clip-text text-transparent">MMITPS TRADE STATION</h1>
            <p className="text-slate-500 text-sm mt-1 uppercase tracking-wider">Real-time Currency Analysis + AI Technical Charts</p>
          </div>
          <div className="flex items-center gap-3">
            {apiConfig.autoRefresh && apiConfig.apiUrl && (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400">Live</span>
              </div>
            )}
            <button onClick={() => setShowAI(true)} className="px-4 py-2 bg-brand-500/20 border border-brand-500/30 rounded-lg text-violet-300 text-sm flex items-center gap-2 hover:bg-brand-500/30">🤖 AI + Charts</button>
            <button onClick={exportData} className="px-6 py-3 bg-gradient-to-r from-brand-500 to-violet-600 rounded-lg font-semibold text-sm hover:from-brand-400 hover:to-brand-500 shadow-lg">⬇️ EXPORT</button>
          </div>
        </header>

        <ApiConfigPanel config={apiConfig} onConfigChange={setApiConfig} onFetch={fetchApiData} isLoading={isLoading} lastFetch={lastFetch} error={apiError} />
        <ChangeHistoryPanel history={changeHistory} onClear={() => setChangeHistory([])} />

        <nav className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[['input', '📊 Data Input'], ['rankings', '🏆 Rankings'], ['scores', '💪 Strength'], ['radar', '🎯 Radar'], ['pairs', '💱 Pairs'], ['cot', '📈 COT Data']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-4 py-3 rounded-lg text-sm whitespace-nowrap border ${tab === id ? 'bg-slate-800 text-cyan-400 border-cyan-500/50' : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800/50'}`}>{label}</button>
          ))}
        </nav>

        <main className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 shadow-2xl overflow-hidden">
          {tab === 'input' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold">Economic Indicators Data</h2>
                  <p className="text-slate-500 text-sm mt-1">{editMode ? '✏️ Edit mode - modify values and weights' : '🔒 View mode - click Edit to modify'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-lg text-sm font-medium ${totalWeight === 100 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    Weights: {totalWeight}% {totalWeight !== 100 && '(should be 100%)'}
                  </div>
                  <button onClick={() => setEditMode(!editMode)} className={`px-4 py-2 rounded-lg font-medium text-sm ${editMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                    {editMode ? '💾 Done Editing' : '✏️ Edit Data'}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-400 sticky left-0 bg-slate-900/95">Indicator</th>
                      <th className="text-center py-3 px-3 font-semibold text-slate-400 w-20">Weight</th>
                      {currencies.map(c => <th key={c} className="text-center py-3 px-3 font-semibold min-w-[80px]" style={{ color: currencyColors[c] }}>{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {indicators.map((ind, idx) => (
                      <tr key={ind.id} className={`border-b border-slate-800/50 ${idx % 2 === 0 ? 'bg-slate-800/20' : ''} hover:bg-slate-800/40`}>
                        <td className="py-3 px-4 font-medium text-slate-300 sticky left-0 bg-inherit">
                          <div className="flex items-center gap-2">
                            <span>{ind.name}</span>
                            {ind.inverse && <span className="text-xs px-2 py-0.5 bg-brand-500/20 text-brand-400 rounded border border-brand-500/30">INV</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {editMode ? (
                            <input type="number" value={ind.weight} onChange={e => handleWeightChange(ind.id, e.target.value)}
                              className="w-16 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-cyan-400 font-mono focus:border-cyan-500 focus:outline-none" />
                          ) : (
                            <span className="text-cyan-400 font-mono">{ind.weight}%</span>
                          )}
                        </td>
                        {currencies.map(c => (
                          <td key={c} className="py-3 px-3 text-center">
                            {editMode ? (
                              <input type="number" step="0.1" value={data[ind.id][c]} onChange={e => handleDataChange(ind.id, c, e.target.value)}
                                className="w-20 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-slate-100 font-mono focus:border-cyan-500 focus:outline-none" />
                            ) : (
                              <span className="font-mono text-slate-300">{data[ind.id][c]}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'rankings' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold">Currency Rankings</h2>
                <p className="text-slate-500 text-sm mt-1">
                  <span className="inline-block w-3 h-3 rounded bg-emerald-500/50 mr-1" /> Top (1-2)
                  <span className="inline-block w-3 h-3 rounded bg-amber-500/50 mx-1 ml-4" /> Mid (3-4)
                  <span className="inline-block w-3 h-3 rounded bg-rose-500/50 mx-1 ml-4" /> Lower (5-8)
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-400 sticky left-0 bg-slate-900/95">Indicator</th>
                      {currencies.map(c => <th key={c} className="text-center py-3 px-3 font-semibold min-w-[70px]" style={{ color: currencyColors[c] }}>{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {indicators.map((ind, idx) => (
                      <tr key={ind.id} className={`border-b border-slate-800/50 ${idx % 2 === 0 ? 'bg-slate-800/20' : ''}`}>
                        <td className="py-3 px-4 font-medium text-slate-300 sticky left-0 bg-inherit">{ind.name}</td>
                        {currencies.map(c => (
                          <td key={c} className="py-3 px-3 text-center">
                            <span className={`inline-block w-10 h-8 leading-8 rounded-lg font-bold border ${rankColor(rankings[ind.id][c])}`}>{rankings[ind.id][c]}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'scores' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold">Weighted Strength Scores</h2>
                <p className="text-slate-500 text-sm mt-1">Composite scores calculated from all indicators</p>
              </div>
              <div className="h-64 mb-8 bg-slate-800/30 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sorted.map(c => ({ name: c, score: scores[c], fill: currencyColors[c] }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {sorted.map((c) => <Cell key={c} fill={currencyColors[c]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-400">Rank</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-400">Currency</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-400">Score</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-400">Class</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-400">Charts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((c, i) => (
                      <tr key={c} className={`border-b border-slate-800/50 ${i % 2 === 0 ? 'bg-slate-800/20' : ''} hover:bg-slate-800/40`}>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${i === 0 ? 'bg-amber-500 text-slate-900' : i === 1 ? 'bg-slate-400 text-slate-900' : i === 2 ? 'bg-amber-700 text-slate-100' : 'bg-slate-700 text-slate-300'}`}>{i + 1}</span>
                        </td>
                        <td className="py-3 px-4"><span className="font-bold text-lg" style={{ color: currencyColors[c] }}>{c}</span></td>
                        <td className="py-3 px-4 text-center"><span className="font-mono font-bold text-lg text-cyan-400">{scores[c].toFixed(2)}</span></td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${strengthClass(scores[c]) === 'Strong' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : strengthClass(scores[c]) === 'Moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                            {strengthClass(scores[c])}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => setShowAI(true)} className="px-3 py-1 bg-brand-500/20 text-brand-400 text-xs rounded-lg border border-brand-500/30 hover:bg-brand-500/30">📊</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'radar' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold">Radar Analysis</h2>
                <p className="text-slate-500 text-sm mt-1">Multi-dimensional comparison across all indicators (higher = better)</p>
              </div>
              <div className="h-[500px] bg-slate-800/30 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#475569" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 8]} tick={{ fill: '#64748b', fontSize: 10 }} />
                    {currencies.map(c => (
                      <Radar key={c} name={c} dataKey={c} stroke={currencyColors[c]} fill={currencyColors[c]} fillOpacity={0.1} strokeWidth={2} />
                    ))}
                    <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={v => <span style={{ color: currencyColors[v] }}>{v}</span>} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {tab === 'pairs' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold">Currency Pair Forecasts</h2>
                  <p className="text-slate-500 text-sm mt-1">28 pairs - Click any pair for AI analysis with charts</p>
                </div>
                <button onClick={() => setShowAI(true)} className="px-4 py-2 bg-brand-500/20 border border-brand-500/30 rounded-lg text-violet-300 text-sm hover:bg-brand-500/30">🤖 Open AI Analyst</button>
              </div>
              <div className="bg-slate-800/40 rounded-lg p-4 mb-6 border border-slate-700">
                <h3 className="font-semibold text-slate-200 mb-2">📐 Methodology</h3>
                <p className="text-slate-400 text-sm">
                  Forecasts compare weighted strength scores. <span className="text-emerald-400">Bullish</span> = base currency stronger.
                  Signal strength: <span className="text-cyan-400">&lt;5 Weak</span>, <span className="text-amber-400">5-15 Moderate</span>, <span className="text-emerald-400">&gt;15 Strong</span>.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {pairs.map(p => (
                  <div key={p.pair} onClick={() => setShowAI(true)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${p.direction === 'Bullish' ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50' : p.direction === 'Bearish' ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-lg text-slate-100">{p.pair}</span>
                      <span className="text-xl">{p.direction === 'Bullish' ? '📈' : p.direction === 'Bearish' ? '📉' : '➡️'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono mb-2">
                      <span style={{ color: currencyColors[p.base] }}>{p.base}: {p.baseScore}</span>
                      <span className="text-slate-500">vs</span>
                      <span style={{ color: currencyColors[p.quote] }}>{p.quote}: {p.quoteScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${p.direction === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400' : p.direction === 'Bearish' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-400'}`}>{p.direction}</span>
                      <span className={`text-xs font-medium ${p.signal === 'Strong' ? 'text-cyan-400' : p.signal === 'Moderate' ? 'text-amber-400' : 'text-slate-500'}`}>{p.signal}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                      <span className="text-xs text-brand-400">📊 Click for AI analysis</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'cot' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold">Commitment of Traders (COT) Report</h2>
                <p className="text-slate-500 text-sm mt-1">CFTC weekly positioning data for major currencies</p>
              </div>
              <CotDataPanel 
                cotData={cotData}
                selectedCurrency={selectedCotCurrency}
                onCurrencyChange={setSelectedCotCurrency}
                cotApiConfig={cotApiConfig}
                onCotApiConfigChange={setCotApiConfig}
                onFetchCot={fetchCotData}
                isCotLoading={isCotLoading}
                cotLastFetch={cotLastFetch}
                cotError={cotError}
              />
            </div>
          )}
        </main>

        <footer className="mt-6 text-center text-slate-600 text-xs">
          <p>MMITPS TRADE STATION • Real-time Analysis • AI Technical Charts • Fibonacci • S/R Levels • Trade Setups</p>
        </footer>
      </div>
    </div>
  );
}

// Standalone COT Page (for sidebar navigation)
const CotDataPage = () => {
  const [cotData, setCotData] = useState(defaultCotData);
  const [selectedCotCurrency, setSelectedCotCurrency] = useState('USD');
  const [cotApiConfig, setCotApiConfig] = useState({ apiUrl: '', apiKey: '' });
  const [isCotLoading, setIsCotLoading] = useState(false);
  const [cotLastFetch, setCotLastFetch] = useState(null);
  const [cotError, setCotError] = useState(null);

  const fetchCotData = useCallback(async () => {
    if (!cotApiConfig.apiUrl) return;
    setIsCotLoading(true); setCotError(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (cotApiConfig.apiKey) headers['Authorization'] = `Bearer ${cotApiConfig.apiKey}`;
      const response = await fetch(cotApiConfig.apiUrl, { method: 'GET', headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const resData = await response.json();
      if (typeof resData === 'object' && Object.keys(resData).length > 0) {
        setCotData(prev => ({ ...prev, ...resData }));
        setCotLastFetch(new Date());
      } else {
        throw new Error('Invalid COT data format');
      }
    } catch (e) { setCotError(e.message); }
    setIsCotLoading(false);
  }, [cotApiConfig]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-brand-400 bg-clip-text text-transparent">COT Data</h1>
        <p className="text-slate-500 mt-2">Commitment of Traders positioning reports</p>
      </div>
      <CotDataPanel 
        cotData={cotData}
        selectedCurrency={selectedCotCurrency}
        onCurrencyChange={setSelectedCotCurrency}
        cotApiConfig={cotApiConfig}
        onCotApiConfigChange={setCotApiConfig}
        onFetchCot={fetchCotData}
        isCotLoading={isCotLoading}
        cotLastFetch={cotLastFetch}
        cotError={cotError}
      />
    </div>
  );
};

// Main App with Sidebar
const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('home');
  
  // Calculate scores for dashboard display
  const [data] = useState(defaultData);
  const [indicators] = useState(defaultIndicators);
  
  const totalWeight = Math.round(indicators.reduce((sum, ind) => sum + ind.weight, 0) * 100) / 100;
  
  const rankings = useMemo(() => {
    const r = {};
    indicators.forEach(ind => {
      const vals = currencies.map(c => ({ c, v: data[ind.id][c] })).sort((a, b) => ind.inverse ? a.v - b.v : b.v - a.v);
      r[ind.id] = {}; vals.forEach((x, i) => r[ind.id][x.c] = i + 1);
    });
    return r;
  }, [data, indicators]);

  const scores = useMemo(() => {
    const s = {};
    currencies.forEach(c => {
      s[c] = indicators.reduce((sum, ind) => sum + ((currencies.length - rankings[ind.id][c]) / (currencies.length - 1)) * (ind.weight / totalWeight) * 100, 0);
    });
    return s;
  }, [rankings, indicators, totalWeight]);

  const sorted = useMemo(() => [...currencies].sort((a, b) => scores[b] - scores[a]), [scores]);

  const pairs = useMemo(() => {
    const p = [];
    for (let i = 0; i < currencies.length; i++) {
      for (let j = i + 1; j < currencies.length; j++) {
        const base = currencies[i], quote = currencies[j];
        const diff = scores[base] - scores[quote], abs = Math.abs(diff);
        p.push({
          pair: `${base}/${quote}`, base, quote, diff: diff.toFixed(1),
          baseScore: scores[base].toFixed(1), quoteScore: scores[quote].toFixed(1),
          direction: abs < 5 ? 'Neutral' : diff > 0 ? 'Bullish' : 'Bearish',
          signal: abs >= 15 ? 'Strong' : abs >= 5 ? 'Moderate' : 'Weak'
        });
      }
    }
    return p;
  }, [scores]);

  const handleNavigate = (menuId) => {
    setActiveMenu(menuId);
  };

  const renderPage = () => {
    switch (activeMenu) {
      case 'home':
        return <MainDashboard onNavigate={handleNavigate} scores={scores} sorted={sorted} pairs={pairs} cotData={defaultCotData} />;
      case 'trade-station':
        return <Dashboard />;
      case 'news-calendar':
        return <NewsCalendarPage />;
      case 'cot-data':
        return <CotDataPage />;
      case 'trade-journal':
        return <TradeJournalPage />;
      case 'seasonality':
        return <SeasonalityPage />;
      case 'contract-specs':
        return <ContractSpecsPage />;
      case 'geometry-scanner':
        return <GeometryScannerPage />;
      default:
        return <MainDashboard onNavigate={handleNavigate} scores={scores} sorted={sorted} pairs={pairs} cotData={defaultCotData} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'JetBrains Mono', system-ui, sans-serif" }}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-1/2 -left-1/2 w-full h-full animate-pulse" 
          style={{ 
            background: 'radial-gradient(circle, rgba(8, 145, 178, 0.2) 0%, transparent 70%)',
            animationDuration: '4s' 
          }} 
        />
        <div 
          className="absolute -bottom-1/2 -right-1/2 w-full h-full animate-pulse" 
          style={{ 
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
            animationDuration: '6s' 
          }} 
        />
      </div>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
        activeMenu={activeMenu} 
        onMenuChange={setActiveMenu} 
      />

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        <div className="relative z-10">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;
