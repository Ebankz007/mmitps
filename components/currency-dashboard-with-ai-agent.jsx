import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, LineChart, Line, ComposedChart, Area } from 'recharts';

const defaultIndicators = [
  { id: 'gdp', name: 'GDP Growth (%)', weight: 15 },
  { id: 'inflation', name: 'Inflation Rate (%)', weight: 12, inverse: true },
  { id: 'interest', name: 'Interest Rate (%)', weight: 18 },
  { id: 'unemployment', name: 'Unemployment (%)', weight: 10, inverse: true },
  { id: 'trade', name: 'Trade Balance (B)', weight: 12 },
  { id: 'pmi', name: 'Manufacturing PMI', weight: 15 },
  { id: 'consumer', name: 'Consumer Confidence', weight: 10 },
  { id: 'debt', name: 'Debt to GDP (%)', weight: 8, inverse: true },
];

const currencies = ['USD', 'JPY', 'CAD', 'CHF', 'GBP', 'EUR', 'AUD', 'NZD'];

const defaultData = {
  gdp: { USD: 2.8, JPY: 1.2, CAD: 1.5, CHF: 1.8, GBP: 0.6, EUR: 0.8, AUD: 2.1, NZD: 1.4 },
  inflation: { USD: 3.2, JPY: 2.8, CAD: 2.9, CHF: 1.4, GBP: 4.2, EUR: 2.4, AUD: 3.5, NZD: 4.1 },
  interest: { USD: 5.25, JPY: 0.25, CAD: 5.0, CHF: 1.75, GBP: 5.25, EUR: 4.5, AUD: 4.35, NZD: 5.5 },
  unemployment: { USD: 3.9, JPY: 2.6, CAD: 6.1, CHF: 2.3, GBP: 4.3, EUR: 6.5, AUD: 4.1, NZD: 4.5 },
  trade: { USD: -78.2, JPY: -1.8, CAD: 2.1, CHF: 8.5, GBP: -18.4, EUR: 28.6, AUD: 5.2, NZD: -1.2 },
  pmi: { USD: 51.2, JPY: 49.8, CAD: 50.1, CHF: 48.5, GBP: 47.3, EUR: 46.8, AUD: 50.8, NZD: 49.2 },
  consumer: { USD: 102.5, JPY: 36.8, CAD: 52.1, CHF: -28.4, GBP: -19.2, EUR: -14.5, AUD: 82.4, NZD: 88.2 },
  debt: { USD: 123.0, JPY: 264.0, CAD: 107.0, CHF: 41.0, GBP: 101.0, EUR: 89.0, AUD: 57.0, NZD: 52.0 },
};

const currencyColors = {
  USD: '#22c55e', JPY: '#ef4444', CAD: '#f97316', CHF: '#a855f7',
  GBP: '#10b981', EUR: '#06b6d4', AUD: '#eab308', NZD: '#ec4899',
};

// AI Technical Analysis Agent Component
const AIAnalysisAgent = ({ isOpen, onClose, pairForecasts, strengthScores, sortedCurrencies, currencyColors }) => {
  const [selectedPair, setSelectedPair] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState('4H');
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const chatEndRef = useRef(null);

  const timeframes = ['1H', '4H', 'Daily'];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const generateAnalysisPrompt = (pair, timeframe, forecasts, scores) => {
    const pairData = forecasts.find(p => p.pair === pair);
    const base = pair.split('/')[0];
    const quote = pair.split('/')[1];
    
    return `You are an expert forex technical analyst. Analyze ${pair} on the ${timeframe} timeframe.

FUNDAMENTAL DATA:
- ${base} Strength Score: ${scores[base]?.toFixed(2) || 'N/A'}
- ${quote} Strength Score: ${scores[quote]?.toFixed(2) || 'N/A'}
- Fundamental Bias: ${pairData?.direction || 'Neutral'}
- Signal Strength: ${pairData?.signal || 'Moderate'}
- Score Differential: ${pairData?.diff || '0'}

Provide a comprehensive technical analysis including:

1. **PRICE ACTION ANALYSIS** (${timeframe}):
   - Current trend direction and strength
   - Key candlestick patterns (engulfing, pin bars, inside bars, etc.)
   - Support/Resistance levels with specific price zones
   - Recent swing highs and lows

2. **GEOMETRY ANALYSIS**:
   - Chart patterns (triangles, channels, wedges, head & shoulders, etc.)
   - Fibonacci retracement levels (23.6%, 38.2%, 50%, 61.8%, 78.6%)
   - Fibonacci extension targets
   - Harmonic patterns if applicable (Gartley, Butterfly, Bat, Crab)
   - Elliott Wave count if discernible

3. **MULTI-TIMEFRAME CONFLUENCE**:
   - How ${timeframe} aligns with higher/lower timeframes
   - Key levels that align across timeframes

4. **TRADE SETUP** (if applicable):
   - Entry zone
   - Stop loss level
   - Take profit targets (TP1, TP2, TP3)
   - Risk/Reward ratio
   - Position bias (Long/Short/Neutral)

5. **RISK FACTORS**:
   - Key invalidation levels
   - Upcoming events that could impact the pair
   - Volatility considerations

Format your response with clear headers and be specific with price levels where possible. Use the fundamental bias as a filter for trade direction.`;
  };

  const runAIAnalysis = async (pair, timeframe) => {
    if (!pair) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    const prompt = generateAnalysisPrompt(pair, timeframe, pairForecasts, strengthScores.scores);
    
    setChatMessages(prev => [...prev, {
      role: 'user',
      content: `Analyze ${pair} on ${timeframe} timeframe`,
      timestamp: new Date()
    }]);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();
      const analysisText = data.content?.[0]?.text || 'Analysis could not be generated.';
      
      setAnalysisResult(analysisText);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: analysisText,
        timestamp: new Date(),
        pair,
        timeframe
      }]);
    } catch (error) {
      const errorMsg = `Error: ${error.message}. Please try again.`;
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCustomQuery = async () => {
    if (!userInput.trim()) return;
    
    const query = userInput;
    setUserInput('');
    setIsAnalyzing(true);
    
    setChatMessages(prev => [...prev, {
      role: 'user',
      content: query,
      timestamp: new Date()
    }]);

    const contextPrompt = `You are an expert forex technical analyst assistant. The user is analyzing currency pairs with the following strength rankings:

TOP CURRENCIES BY STRENGTH:
${sortedCurrencies.map((c, i) => `${i + 1}. ${c}: ${strengthScores.scores[c].toFixed(2)}`).join('\n')}

PAIR FORECASTS:
${pairForecasts.slice(0, 10).map(p => `${p.pair}: ${p.direction} (${p.signal})`).join('\n')}

User Query: ${query}

Provide a helpful, specific response focused on technical analysis, price action, and geometry patterns. Be concise but thorough.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content: contextPrompt }]
        })
      });

      const data = await response.json();
      const responseText = data.content?.[0]?.text || 'Could not generate response.';
      
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      }]);
    } catch (error) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatAnalysis = (text) => {
    if (!text) return null;
    
    const sections = text.split(/\n(?=\d+\.\s*\*\*|\*\*[A-Z])/);
    
    return sections.map((section, idx) => {
      const isHeader = section.match(/^\*\*(.+?)\*\*/);
      const headerMatch = section.match(/^\d+\.\s*\*\*(.+?)\*\*:?/);
      
      if (headerMatch) {
        const title = headerMatch[1];
        const content = section.replace(headerMatch[0], '').trim();
        return (
          <div key={idx} className="mb-4">
            <h4 className="text-cyan-400 font-semibold text-sm mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center text-xs">{idx + 1}</span>
              {title}
            </h4>
            <div className="text-slate-300 text-sm pl-8 space-y-1 whitespace-pre-wrap">{content}</div>
          </div>
        );
      }
      return <p key={idx} className="text-slate-300 text-sm mb-2 whitespace-pre-wrap">{section}</p>;
    });
  };

  if (!isOpen) return null;

  const topPairs = pairForecasts.filter(p => p.signal === 'Strong' || p.signal === 'Moderate').slice(0, 8);

  return (
    <div className={`fixed z-[100] transition-all duration-300 ${isMinimized ? 'bottom-4 right-4 w-80' : 'bottom-4 right-4 w-[600px] max-w-[95vw]'}`} style={{ maxHeight: isMinimized ? 'auto' : '85vh' }}>
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 overflow-hidden flex flex-col" style={{ maxHeight: isMinimized ? 'auto' : '85vh' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-500/20 via-violet-600/20 to-fuchsia-600/20 border-b border-cyan-500/30 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">AI Technical Analyst</h3>
              <p className="text-xs text-slate-400">Price Action & Geometry Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-slate-200">
              {isMinimized ? '⬆️' : '⬇️'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-rose-500/20 rounded-lg transition-colors text-slate-400 hover:text-rose-400">✕</button>
          </div>
        </div>
        {/* Content */}
        {!isMinimized && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Quick Pair Selection */}
            <div className="px-4 py-3 border-b border-slate-700/50 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-slate-400 font-medium">TOP PAIRS:</span>
                <div className="flex flex-wrap gap-1">
                  {topPairs.map(p => (
                    <button
                      key={p.pair}
                      onClick={() => { setSelectedPair(p.pair); runAIAnalysis(p.pair, activeTimeframe); }}
                      className={`px-2 py-1 text-xs rounded-lg border transition-all ${
                        selectedPair === p.pair
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                          : p.direction === 'Bullish'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                      }`}
                    >
                      {p.pair} {p.direction === 'Bullish' ? '↑' : '↓'}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Timeframe Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">TIMEFRAME:</span>
                <div className="flex gap-1">
                  {timeframes.map(tf => (
                    <button
                      key={tf}
                      onClick={() => { setActiveTimeframe(tf); if (selectedPair) runAIAnalysis(selectedPair, tf); }}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                        activeTimeframe === tf
                          ? 'bg-brand-500/30 text-violet-300 border border-brand-500/50'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: '300px' }}>
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-400/20 to-brand-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h4 className="text-slate-200 font-semibold mb-2">AI Technical Analysis Ready</h4>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto">
                    Select a currency pair above or ask me anything about price action, chart patterns, and geometry analysis.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2 max-w-sm mx-auto">
                    <button onClick={() => setUserInput('What are the strongest trade setups right now?')} className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-slate-400 hover:bg-slate-700/50 hover:text-slate-300 transition-all">
                      🎯 Best setups now?
                    </button>
                    <button onClick={() => setUserInput('Analyze EUR/USD with Fibonacci levels')} className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-slate-400 hover:bg-slate-700/50 hover:text-slate-300 transition-all">
                      📐 EUR/USD Fibs
                    </button>
                    <button onClick={() => setUserInput('Find harmonic patterns on GBP/USD')} className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-slate-400 hover:bg-slate-700/50 hover:text-slate-300 transition-all">
                      🦋 Harmonic scan
                    </button>
                    <button onClick={() => setUserInput('Multi-timeframe analysis for USD/JPY')} className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-slate-400 hover:bg-slate-700/50 hover:text-slate-300 transition-all">
                      ⏱️ MTF Analysis
                    </button>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-brand-500/30 to-violet-600/30 border border-cyan-500/30'
                        : msg.isError
                        ? 'bg-rose-500/10 border border-rose-500/30'
                        : 'bg-slate-800/80 border border-slate-700/50'
                    }`}>
                      {msg.role === 'assistant' && msg.pair && (
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700/50">
                          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-lg font-mono">{msg.pair}</span>
                          <span className="px-2 py-1 bg-brand-500/20 text-brand-400 text-xs rounded-lg">{msg.timeframe}</span>
                        </div>
                      )}
                      <div className={msg.role === 'user' ? 'text-slate-200 text-sm' : ''}>
                        {msg.role === 'assistant' ? formatAnalysis(msg.content) : msg.content}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">{msg.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))
              )}
              {isAnalyzing && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/80 border border-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-fuchsia-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span className="text-slate-400 text-sm">Analyzing charts...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-700/50 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCustomQuery()}
                  placeholder="Ask about price action, patterns, levels..."
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none text-sm"
                  disabled={isAnalyzing}
                />
                <button
                  onClick={handleCustomQuery}
                  disabled={isAnalyzing || !userInput.trim()}
                  className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                    isAnalyzing || !userInput.trim()
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-brand-500 to-violet-600 text-[var(--color-text-primary)] hover:from-brand-400 hover:to-brand-500 shadow-lg'
                  }`}
                >
                  {isAnalyzing ? '⟳' : '→'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Minimized State */}
        {isMinimized && (
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{selectedPair || 'No pair selected'}</span>
              {selectedPair && (
                <button
                  onClick={() => setIsMinimized(false)}
                  className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-lg hover:bg-cyan-500/30 transition-colors"
                >
                  View Analysis
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Floating AI Button
const AIAgentButton = ({ onClick, hasAnalysis }) => (
  <button
    onClick={onClick}
    className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-br from-brand-400 via-brand-500 to-fuchsia-500 rounded-lg shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all hover:scale-110 flex items-center justify-center group"
  >
    <span className="text-2xl group-hover:scale-110 transition-transform">🤖</span>
    {hasAnalysis && (
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
    )}
    <div className="absolute left-full ml-3 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
      <span className="text-sm text-slate-200">AI Technical Analyst</span>
    </div>
  </button>
);
// Change Indicator Component
const ChangeIndicator = ({ changes, onDismiss }) => {
  if (changes.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md" style={{ animation: 'slideUp 0.3s ease-out' }}>
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
                    <span className="text-rose-400">{change.oldValue}</span><span className="text-slate-500">→</span><span className="text-emerald-400">{change.newValue}</span>
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

// API Config Panel
const ApiConfigPanel = ({ config, onConfigChange, onFetch, isLoading, lastFetch, error }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
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
            <input type="url" value={config.apiUrl} onChange={(e) => onConfigChange({ ...config, apiUrl: e.target.value })} placeholder="https://api.example.com/economic-data" className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">API Key (Optional)</label>
            <input type="password" value={config.apiKey} onChange={(e) => onConfigChange({ ...config, apiKey: e.target.value })} placeholder="Enter your API key..." className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Custom Headers (JSON)</label>
            <textarea value={config.headers} onChange={(e) => onConfigChange({ ...config, headers: e.target.value })} placeholder='{"Content-Type": "application/json"}' rows={2} className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono text-sm resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Response Data Path</label>
            <input type="text" value={config.dataPath} onChange={(e) => onConfigChange({ ...config, dataPath: e.target.value })} placeholder="data.indicators or leave empty" className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono text-sm" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={config.autoRefresh} onChange={(e) => onConfigChange({ ...config, autoRefresh: e.target.checked })} className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500" />
              <span className="text-sm text-slate-300">Auto-refresh</span>
            </label>
            {config.autoRefresh && (
              <div className="flex items-center gap-2">
                <input type="number" min="10" max="3600" value={config.refreshInterval} onChange={(e) => onConfigChange({ ...config, refreshInterval: parseInt(e.target.value) || 60 })} className="w-20 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100 text-sm font-mono" />
                <span className="text-sm text-slate-400">seconds</span>
              </div>
            )}
          </div>
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg"><div className="flex items-center gap-2 text-rose-400 text-sm"><span>⚠️</span><span>{error}</span></div></div>}
          <div className="flex items-center justify-between pt-2">
            <button onClick={onFetch} disabled={isLoading || !config.apiUrl} className={`px-6 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 ${isLoading || !config.apiUrl ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-brand-500 to-brand-600 text-[var(--color-text-primary)] hover:from-brand-400 hover:to-brand-500 shadow-lg'}`}>
              {isLoading ? <><span className="animate-spin">⟳</span><span>Fetching...</span></> : <><span>🔄</span><span>Fetch Data</span></>}
            </button>
            {lastFetch && <div className="text-xs text-slate-500">Last: {lastFetch.toLocaleTimeString()}</div>}
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
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden mt-4">
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
          <div className="flex justify-end mb-3"><button onClick={onClear} className="px-3 py-1.5 text-xs text-rose-400 border border-rose-500/30 rounded-lg">Clear</button></div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {history.map((entry, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <span className="text-lg">{entry.type === 'increase' ? '📈' : entry.type === 'decrease' ? '📉' : entry.type === 'rank_up' ? '🏆' : '⬇️'}</span>
                <div className="flex-1"><div className="flex items-center justify-between"><span className="font-medium text-slate-200 text-sm">{entry.title}</span><span className="text-xs text-slate-500">{entry.timestamp?.toLocaleTimeString()}</span></div><div className="text-xs text-slate-400 mt-0.5">{entry.description}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
// Main Dashboard Component
export default function CurrencyDashboard() {
  const [activeTab, setActiveTab] = useState('input');
  const [editMode, setEditMode] = useState(false);
  const [indicators, setIndicators] = useState(defaultIndicators);
  const [data, setData] = useState(defaultData);
  const [previousData, setPreviousData] = useState(null);
  const [previousRankings, setPreviousRankings] = useState(null);
  const [changes, setChanges] = useState([]);
  const [changeHistory, setChangeHistory] = useState([]);
  const [showChanges, setShowChanges] = useState(true);
  const [apiConfig, setApiConfig] = useState({ apiUrl: '', apiKey: '', headers: '', dataPath: '', autoRefresh: false, refreshInterval: 60 });
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [showAIAgent, setShowAIAgent] = useState(false);
  const [hasAIAnalysis, setHasAIAnalysis] = useState(false);
  const refreshIntervalRef = useRef(null);
  const isInitialMount = useRef(true);

  const totalWeight = indicators.reduce((sum, ind) => sum + ind.weight, 0);

  const rankings = useMemo(() => {
    const result = {};
    indicators.forEach(indicator => {
      const values = currencies.map(curr => ({ currency: curr, value: data[indicator.id][curr] }));
      values.sort((a, b) => indicator.inverse ? a.value - b.value : b.value - a.value);
      result[indicator.id] = {};
      values.forEach((item, index) => { result[indicator.id][item.currency] = index + 1; });
    });
    return result;
  }, [data, indicators]);

  const strengthScores = useMemo(() => {
    const scores = {}, breakdown = {};
    currencies.forEach(curr => {
      scores[curr] = 0; breakdown[curr] = {};
      indicators.forEach(indicator => {
        const rank = rankings[indicator.id][curr];
        const normalizedWeight = (indicator.weight / totalWeight) * 100;
        const score = ((9 - rank) / 7) * normalizedWeight;
        scores[curr] += score; breakdown[curr][indicator.id] = score;
      });
    });
    return { scores, breakdown };
  }, [rankings, indicators, totalWeight]);

  const sortedCurrencies = useMemo(() => [...currencies].sort((a, b) => strengthScores.scores[b] - strengthScores.scores[a]), [strengthScores]);

  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; setPreviousData(JSON.parse(JSON.stringify(data))); setPreviousRankings(JSON.parse(JSON.stringify(rankings))); return; }
    if (!previousData) { setPreviousData(JSON.parse(JSON.stringify(data))); setPreviousRankings(JSON.parse(JSON.stringify(rankings))); return; }
    const detected = [];
    Object.keys(data).forEach(indId => {
      const ind = indicators.find(i => i.id === indId); if (!ind) return;
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
    if (detected.length > 0) { setChanges(detected); setChangeHistory(prev => [...detected, ...prev].slice(0, 100)); setShowChanges(true); }
    setPreviousData(JSON.parse(JSON.stringify(data))); setPreviousRankings(JSON.parse(JSON.stringify(rankings)));
  }, [data, rankings, indicators]);

  const fetchApiData = useCallback(async () => {
    if (!apiConfig.apiUrl) return;
    setIsLoading(true); setApiError(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiConfig.apiKey) headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
      if (apiConfig.headers) { try { Object.assign(headers, JSON.parse(apiConfig.headers)); } catch {} }
      const response = await fetch(apiConfig.apiUrl, { method: 'GET', headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      let resData = await response.json();
      if (apiConfig.dataPath) { for (const part of apiConfig.dataPath.split('.')) { resData = resData?.[part]; if (!resData) throw new Error(`Path not found`); } }
      const newData = { ...data }; let valid = false;
      indicators.forEach(ind => { if (resData[ind.id]) currencies.forEach(curr => { if (typeof resData[ind.id][curr] === 'number') { newData[ind.id][curr] = resData[ind.id][curr]; valid = true; } }); });
      if (!valid) throw new Error('No valid data');
      setData(newData); setLastFetch(new Date());
    } catch (e) { setApiError(e.message); } finally { setIsLoading(false); }
  }, [apiConfig, data, indicators]);

  useEffect(() => {
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    if (apiConfig.autoRefresh && apiConfig.apiUrl) refreshIntervalRef.current = setInterval(fetchApiData, apiConfig.refreshInterval * 1000);
    return () => { if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current); };
  }, [apiConfig.autoRefresh, apiConfig.refreshInterval, apiConfig.apiUrl, fetchApiData]);

  const pairForecasts = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < currencies.length; i++) {
      for (let j = i + 1; j < currencies.length; j++) {
        const base = currencies[i], quote = currencies[j];
        const diff = strengthScores.scores[base] - strengthScores.scores[quote], absDiff = Math.abs(diff);
        let direction = 'Neutral', signal = 'Weak';
        if (absDiff >= 15) { direction = diff > 0 ? 'Bullish' : 'Bearish'; signal = 'Strong'; }
        else if (absDiff >= 5) { direction = diff > 0 ? 'Bullish' : 'Bearish'; signal = 'Moderate'; }
        pairs.push({ pair: `${base}/${quote}`, base, quote, baseScore: strengthScores.scores[base].toFixed(1), quoteScore: strengthScores.scores[quote].toFixed(1), diff: diff.toFixed(1), direction, signal });
      }
    }
    return pairs;
  }, [strengthScores]);

  const radarData = useMemo(() => indicators.map(ind => {
    const point = { indicator: ind.name.split(' ')[0] };
    currencies.forEach(curr => { point[curr] = 9 - rankings[ind.id][curr]; });
    return point;
  }), [rankings, indicators]);

  const handleDataChange = (indId, curr, val) => setData(prev => ({ ...prev, [indId]: { ...prev[indId], [curr]: parseFloat(val) || 0 } }));
  const handleWeightChange = (indId, val) => setIndicators(prev => prev.map(ind => ind.id === indId ? { ...ind, weight: parseFloat(val) || 0 } : ind));

  const exportData = () => {
    let csv = 'Currency Strength Export\n\nIndicators\nIndicator,Weight,' + currencies.join(',') + '\n';
    indicators.forEach(ind => { csv += `${ind.name},${ind.weight},${currencies.map(c => data[ind.id][c]).join(',')}\n`; });
    csv += '\nRankings\nIndicator,' + currencies.join(',') + '\n';
    indicators.forEach(ind => { csv += `${ind.name},${currencies.map(c => rankings[ind.id][c]).join(',')}\n`; });
    csv += '\nScores\nCurrency,Score,Rank\n';
    sortedCurrencies.forEach((curr, i) => { csv += `${curr},${strengthScores.scores[curr].toFixed(2)},${i + 1}\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'currency_analysis.csv'; a.click();
  };

  const getRankColor = (rank) => rank <= 2 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : rank <= 4 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  const getStrengthClass = (score) => { const max = Math.max(...Object.values(strengthScores.scores)), min = Math.min(...Object.values(strengthScores.scores)), norm = (score - min) / (max - min); return norm > 0.7 ? 'Strong' : norm > 0.4 ? 'Moderate' : 'Weak'; };

  const tabs = [{ id: 'input', label: '📊 Data Input' }, { id: 'rankings', label: '🏆 Rankings' }, { id: 'scores', label: '💪 Strength' }, { id: 'radar', label: '🎯 Radar' }, { id: 'pairs', label: '💱 Pairs' }];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      
      {/* AI Agent */}
      <AIAgentButton onClick={() => setShowAIAgent(true)} hasAnalysis={hasAIAnalysis} />
      <AIAnalysisAgent 
        isOpen={showAIAgent} 
        onClose={() => setShowAIAgent(false)} 
        pairForecasts={pairForecasts} 
        strengthScores={strengthScores} 
        sortedCurrencies={sortedCurrencies}
        currencyColors={currencyColors}
      />
      
      {showChanges && <ChangeIndicator changes={changes} onDismiss={() => { setShowChanges(false); setChanges([]); }} />}
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-cyan-900/20 via-transparent to-transparent animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-violet-900/20 via-transparent to-transparent animate-pulse" style={{ animationDuration: '6s' }} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6">
        <header className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-brand-400 to-fuchsia-400 bg-clip-text text-transparent">FX STRENGTH MATRIX</h1>
              <p className="text-slate-500 mt-1 text-sm uppercase tracking-wider">Real-time Currency Analysis + AI Technical Analyst</p>
            </div>
            <div className="flex items-center gap-3">
              {apiConfig.autoRefresh && apiConfig.apiUrl && <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /><span className="text-xs text-emerald-400">Live</span></div>}
              <button onClick={() => setShowAIAgent(true)} className="px-4 py-2 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-brand-500/30 rounded-lg text-violet-300 text-sm font-medium hover:from-violet-600/30 hover:to-fuchsia-600/30 transition-all flex items-center gap-2">
                🤖 AI Analyst
              </button>
              <button onClick={exportData} className="px-6 py-3 bg-gradient-to-r from-brand-500 to-violet-600 rounded-lg font-semibold text-sm hover:from-brand-400 hover:to-brand-500 shadow-lg flex items-center gap-2">⬇️ EXPORT</button>
            </div>
          </div>
        </header>
        
        <ApiConfigPanel config={apiConfig} onConfigChange={setApiConfig} onFetch={fetchApiData} isLoading={isLoading} lastFetch={lastFetch} error={apiError} />
        <ChangeHistoryPanel history={changeHistory} onClear={() => setChangeHistory([])} />
        
        <nav className="flex gap-2 my-6 overflow-x-auto pb-2">
          {tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 rounded-lg font-medium text-sm whitespace-nowrap border ${activeTab === tab.id ? 'bg-slate-800 border-cyan-500/50 text-cyan-400' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/50'}`}>{tab.label}</button>))}
        </nav>
        <main className="bg-slate-900/80 backdrop-blur-xl rounded-lg border border-slate-800 shadow-2xl overflow-hidden">
          {activeTab === 'input' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div><h2 className="text-xl font-bold">Economic Indicators Data</h2><p className="text-slate-500 text-sm mt-1">{editMode ? '✏️ Edit mode' : '🔒 View mode'}</p></div>
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-lg text-sm font-medium ${totalWeight === 100 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>Weights: {totalWeight}%</div>
                  <button onClick={() => setEditMode(!editMode)} className={`px-4 py-2 rounded-lg font-medium text-sm ${editMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>{editMode ? '💾 Done' : '✏️ Edit'}</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-700"><th className="text-left py-3 px-4 font-semibold text-slate-400 sticky left-0 bg-slate-900/95">Indicator</th><th className="text-center py-3 px-3 font-semibold text-slate-400 w-20">Weight</th>{currencies.map(curr => <th key={curr} className="text-center py-3 px-3 font-semibold min-w-[80px]" style={{ color: currencyColors[curr] }}>{curr}</th>)}</tr></thead>
                  <tbody>{indicators.map((ind, idx) => (
                    <tr key={ind.id} className={`border-b border-slate-800/50 ${idx % 2 === 0 ? 'bg-slate-800/20' : ''} hover:bg-slate-800/40`}>
                      <td className="py-3 px-4 font-medium text-slate-300 sticky left-0 bg-inherit"><div className="flex items-center gap-2"><span>{ind.name}</span>{ind.inverse && <span className="text-xs px-2 py-0.5 bg-brand-500/20 text-brand-400 rounded border border-brand-500/30">INV</span>}</div></td>
                      <td className="py-3 px-3 text-center">{editMode ? <input type="number" value={ind.weight} onChange={e => handleWeightChange(ind.id, e.target.value)} className="w-16 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-cyan-400 font-mono focus:border-cyan-500 focus:outline-none" /> : <span className="text-cyan-400 font-mono">{ind.weight}%</span>}</td>
                      {currencies.map(curr => <td key={curr} className="py-3 px-3 text-center">{editMode ? <input type="number" step="0.1" value={data[ind.id][curr]} onChange={e => handleDataChange(ind.id, curr, e.target.value)} className="w-20 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-center text-slate-100 font-mono focus:border-cyan-500 focus:outline-none" /> : <span className="font-mono text-slate-300">{data[ind.id][curr]}</span>}</td>)}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'rankings' && (
            <div className="p-6">
              <div className="mb-6"><h2 className="text-xl font-bold">Currency Rankings</h2><p className="text-slate-500 text-sm mt-1"><span className="inline-block w-3 h-3 rounded bg-emerald-500/50 mr-1" /> Top <span className="inline-block w-3 h-3 rounded bg-amber-500/50 mx-1 ml-4" /> Mid <span className="inline-block w-3 h-3 rounded bg-rose-500/50 mx-1 ml-4" /> Lower</p></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-700"><th className="text-left py-3 px-4 font-semibold text-slate-400 sticky left-0 bg-slate-900/95">Indicator</th>{currencies.map(curr => <th key={curr} className="text-center py-3 px-3 font-semibold min-w-[70px]" style={{ color: currencyColors[curr] }}>{curr}</th>)}</tr></thead>
                  <tbody>{indicators.map((ind, idx) => (
                    <tr key={ind.id} className={`border-b border-slate-800/50 ${idx % 2 === 0 ? 'bg-slate-800/20' : ''}`}>
                      <td className="py-3 px-4 font-medium text-slate-300 sticky left-0 bg-inherit">{ind.name}</td>
                      {currencies.map(curr => <td key={curr} className="py-3 px-3 text-center"><span className={`inline-block w-10 h-8 leading-8 rounded-lg font-bold border ${getRankColor(rankings[ind.id][curr])}`}>{rankings[ind.id][curr]}</span></td>)}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'scores' && (
            <div className="p-6">
              <div className="mb-6"><h2 className="text-xl font-bold">Weighted Strength Scores</h2><p className="text-slate-500 text-sm mt-1">Composite scores from all indicators</p></div>
              <div className="h-64 mb-8 bg-slate-800/30 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedCurrencies.map(curr => ({ name: curr, score: strengthScores.scores[curr], fill: currencyColors[curr] }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="name" stroke="#94a3b8" fontSize={12} /><YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>{sortedCurrencies.map((curr, i) => <rect key={i} fill={currencyColors[curr]} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-700"><th className="text-left py-3 px-4 font-semibold text-slate-400">Rank</th><th className="text-left py-3 px-4 font-semibold text-slate-400">Currency</th><th className="text-center py-3 px-4 font-semibold text-slate-400">Score</th><th className="text-center py-3 px-4 font-semibold text-slate-400">Class</th><th className="text-center py-3 px-4 font-semibold text-slate-400">AI Analysis</th></tr></thead>
                  <tbody>{sortedCurrencies.map((curr, idx) => (
                    <tr key={curr} className={`border-b border-slate-800/50 ${idx % 2 === 0 ? 'bg-slate-800/20' : ''} hover:bg-slate-800/40`}>
                      <td className="py-3 px-4"><span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${idx === 0 ? 'bg-amber-500 text-slate-900' : idx === 1 ? 'bg-slate-400 text-slate-900' : idx === 2 ? 'bg-amber-700 text-slate-100' : 'bg-slate-700 text-slate-300'}`}>{idx + 1}</span></td>
                      <td className="py-3 px-4"><span className="font-bold text-lg" style={{ color: currencyColors[curr] }}>{curr}</span></td>
                      <td className="py-3 px-4 text-center"><span className="font-mono font-bold text-lg text-cyan-400">{strengthScores.scores[curr].toFixed(2)}</span></td>
                      <td className="py-3 px-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStrengthClass(strengthScores.scores[curr]) === 'Strong' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : getStrengthClass(strengthScores.scores[curr]) === 'Moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>{getStrengthClass(strengthScores.scores[curr])}</span></td>
                      <td className="py-3 px-4 text-center"><button onClick={() => setShowAIAgent(true)} className="px-3 py-1 bg-brand-500/20 text-brand-400 text-xs rounded-lg border border-brand-500/30 hover:bg-brand-500/30 transition-colors">🤖 Analyze</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'radar' && (
            <div className="p-6">
              <div className="mb-6"><h2 className="text-xl font-bold">Radar Analysis</h2><p className="text-slate-500 text-sm mt-1">Multi-dimensional comparison (higher = better)</p></div>
              <div className="h-[500px] bg-slate-800/30 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#475569" /><PolarAngleAxis dataKey="indicator" tick={{ fill: '#94a3b8', fontSize: 11 }} /><PolarRadiusAxis angle={30} domain={[0, 8]} tick={{ fill: '#64748b', fontSize: 10 }} />
                    {currencies.map(curr => <Radar key={curr} name={curr} dataKey={curr} stroke={currencyColors[curr]} fill={currencyColors[curr]} fillOpacity={0.1} strokeWidth={2} />)}
                    <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={val => <span style={{ color: currencyColors[val] }}>{val}</span>} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {activeTab === 'pairs' && (
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div><h2 className="text-xl font-bold">Currency Pair Forecasts</h2><p className="text-slate-500 text-sm mt-1">28 pairs with directional bias - Click any pair for AI analysis</p></div>
                  <button onClick={() => setShowAIAgent(true)} className="px-4 py-2 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-brand-500/30 rounded-lg text-violet-300 text-sm font-medium hover:from-violet-600/30 hover:to-fuchsia-600/30 transition-all flex items-center gap-2">
                    🤖 Open AI Analyst
                  </button>
                </div>
              </div>
              <div className="bg-slate-800/40 rounded-lg p-4 mb-6 border border-slate-700">
                <h3 className="font-semibold text-slate-200 mb-2">📐 Methodology</h3>
                <p className="text-slate-400 text-sm">Forecasts compare weighted strength scores. <span className="text-emerald-400">Bullish</span> = base stronger. Signal: <span className="text-cyan-400">&lt;5 Weak</span>, <span className="text-amber-400">5-15 Moderate</span>, <span className="text-emerald-400">&gt;15 Strong</span>. Click any pair to get detailed AI technical analysis with price action and geometry patterns.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {pairForecasts.map(pair => (
                  <div 
                    key={pair.pair} 
                    onClick={() => setShowAIAgent(true)}
                    className={`p-4 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer ${pair.direction === 'Bullish' ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50' : pair.direction === 'Bearish' ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}`}
                  >
                    <div className="flex items-center justify-between mb-2"><span className="font-bold text-lg text-slate-100">{pair.pair}</span><span className={`text-xl ${pair.direction === 'Bullish' ? 'text-emerald-400' : pair.direction === 'Bearish' ? 'text-rose-400' : 'text-slate-400'}`}>{pair.direction === 'Bullish' ? '📈' : pair.direction === 'Bearish' ? '📉' : '➡️'}</span></div>
                    <div className="flex items-center gap-2 text-xs font-mono mb-2"><span style={{ color: currencyColors[pair.base] }}>{pair.base}: {pair.baseScore}</span><span className="text-slate-500">vs</span><span style={{ color: currencyColors[pair.quote] }}>{pair.quote}: {pair.quoteScore}</span></div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${pair.direction === 'Bullish' ? 'bg-emerald-500/20 text-emerald-400' : pair.direction === 'Bearish' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-400'}`}>{pair.direction}</span>
                      <span className={`text-xs font-medium ${pair.signal === 'Strong' ? 'text-cyan-400' : pair.signal === 'Moderate' ? 'text-amber-400' : 'text-slate-500'}`}>{pair.signal}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-700/50">
                      <span className="text-xs text-brand-400 flex items-center gap-1">🤖 Click for AI analysis</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
        <footer className="mt-6 text-center text-slate-600 text-xs"><p>FX Strength Matrix + AI Technical Analyst • Price Action & Geometry Analysis • Multi-Timeframe</p></footer>
      </div>
    </div>
  );
}
