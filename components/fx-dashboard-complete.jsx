import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ComposedChart, Area, Line, ReferenceLine } from 'recharts';

const indicators = [
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

const colors = { USD: '#22c55e', JPY: '#ef4444', CAD: '#f97316', CHF: '#a855f7', GBP: '#10b981', EUR: '#06b6d4', AUD: '#eab308', NZD: '#ec4899' };

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
          <div key={l} className="bg-slate-800 rounded px-2 py-1 flex justify-between"><span className="text-amber-400">{l}</span><span className="text-slate-300 font-mono">{v.toFixed(5)}</span></div>
        ))}
      </div>
    </div>
  );
};

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
            <div className="flex-1 h-2 bg-slate-800 rounded"><div className="h-full rounded" style={{ width: n === 'Entry' ? '50%' : n === 'SL' ? '20%' : '80%', backgroundColor: c, opacity: 0.6 }} /></div>
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

const AIAgent = ({ isOpen, onClose, pairs, scores, sorted }) => {
  const [pair, setPair] = useState(null);
  const [tf, setTf] = useState('4H');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const runAnalysis = async (p, t) => {
    setPair(p); setLoading(true);
    const pairData = pairs.find(x => x.pair === p);
    setMessages(m => [...m, { role: 'user', text: `Analyze ${p} on ${t}` }]);
    
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
      setAnalysis(text);
      setMessages(m => [...m, { role: 'assistant', text, pair: p, tf: t }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', text: 'Error: ' + e.message, error: true }]);
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
          <div><h3 className="font-bold text-[var(--color-text-primary)]">AI Technical Analyst</h3><p className="text-xs text-slate-400">Charts & Analysis</p></div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">✕</button>
      </div>
      
      <div className="px-4 py-3 border-b border-slate-700 space-y-2">
        <div className="flex flex-wrap gap-1">
          {pairs.filter(p => p.signal !== 'Weak').slice(0, 8).map(p => (
            <button key={p.pair} onClick={() => runAnalysis(p.pair, tf)}
              className={`px-2 py-1 text-xs rounded border ${pair === p.pair ? 'bg-cyan-500/20 border-cyan-500' : p.direction === 'Bullish' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
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
              <div key={i} className={`rounded-lg p-4 ${m.role === 'user' ? 'bg-cyan-500/10 border border-cyan-500/30 ml-8' : 'bg-slate-800 border border-slate-700 mr-8'}`}>
                {m.pair && <div className="flex gap-2 mb-2"><span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">{m.pair}</span><span className="px-2 py-0.5 bg-brand-500/20 text-brand-400 text-xs rounded">{m.tf}</span></div>}
                <div className="text-sm text-slate-300 whitespace-pre-wrap">{m.text}</div>
              </div>
            ))}
            
            {loading && (
              <div className="bg-slate-800 rounded-lg p-4 flex items-center gap-3">
                <div className="flex gap-1">{[0, 150, 300].map(d => <span key={d} className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}</div>
                <span className="text-slate-400 text-sm">Analyzing...</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [tab, setTab] = useState('input');
  const [data, setData] = useState(defaultData);
  const [editMode, setEditMode] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const rankings = useMemo(() => {
    const r = {};
    indicators.forEach(ind => {
      const vals = currencies.map(c => ({ c, v: data[ind.id][c] })).sort((a, b) => ind.inverse ? a.v - b.v : b.v - a.v);
      r[ind.id] = {}; vals.forEach((x, i) => r[ind.id][x.c] = i + 1);
    });
    return r;
  }, [data]);

  const scores = useMemo(() => {
    const s = {};
    currencies.forEach(c => {
      s[c] = indicators.reduce((sum, ind) => sum + ((9 - rankings[ind.id][c]) / 7) * ind.weight, 0);
    });
    return s;
  }, [rankings]);

  const sorted = useMemo(() => [...currencies].sort((a, b) => scores[b] - scores[a]), [scores]);

  const pairs = useMemo(() => {
    const p = [];
    for (let i = 0; i < currencies.length; i++) {
      for (let j = i + 1; j < currencies.length; j++) {
        const base = currencies[i], quote = currencies[j];
        const diff = scores[base] - scores[quote], abs = Math.abs(diff);
        p.push({
          pair: `${base}/${quote}`, base, quote, diff: diff.toFixed(1),
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
  }), [rankings]);

  const rankColor = r => r <= 2 ? 'bg-emerald-500/20 text-emerald-300' : r <= 4 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <button onClick={() => setShowAI(true)} className="fixed bottom-6 left-6 z-40 w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-500 rounded-lg shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">🤖</button>
      <AIAgent isOpen={showAI} onClose={() => setShowAI(false)} pairs={pairs} scores={scores} sorted={sorted} />

      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-brand-400 bg-clip-text text-transparent">MMITPS TRADE STATION</h1>
            <p className="text-slate-500 text-sm">Currency Analysis + AI Technical Charts</p>
          </div>
          <button onClick={() => setShowAI(true)} className="px-4 py-2 bg-brand-500/20 border border-brand-500/30 rounded-lg text-violet-300 text-sm flex items-center gap-2 hover:bg-brand-500/30">🤖 AI + Charts</button>
        </header>

        <nav className="flex gap-2 mb-6 overflow-x-auto">
          {[['input', '📊 Data'], ['rankings', '🏆 Rankings'], ['scores', '💪 Strength'], ['radar', '🎯 Radar'], ['pairs', '💱 Pairs']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${tab === id ? 'bg-slate-800 text-cyan-400 border border-cyan-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>{label}</button>
          ))}
        </nav>

        <main className="bg-slate-900/80 rounded-lg border border-slate-800 p-6">
          {tab === 'input' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Economic Indicators</h2>
                <button onClick={() => setEditMode(!editMode)} className={`px-4 py-2 rounded-lg text-sm ${editMode ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'}`}>{editMode ? '💾 Done' : '✏️ Edit'}</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-700"><th className="text-left py-2 px-3">Indicator</th><th className="text-center py-2 px-2">Wt</th>{currencies.map(c => <th key={c} className="text-center py-2 px-2" style={{ color: colors[c] }}>{c}</th>)}</tr></thead>
                  <tbody>{indicators.map(ind => (
                    <tr key={ind.id} className="border-b border-slate-800">
                      <td className="py-2 px-3">{ind.name}</td>
                      <td className="py-2 px-2 text-center text-cyan-400">{ind.weight}%</td>
                      {currencies.map(c => <td key={c} className="py-2 px-2 text-center">
                        {editMode ? <input type="number" value={data[ind.id][c]} onChange={e => setData(d => ({ ...d, [ind.id]: { ...d[ind.id], [c]: parseFloat(e.target.value) || 0 } }))} className="w-16 px-1 py-0.5 bg-slate-800 border border-slate-600 rounded text-center" /> : data[ind.id][c]}
                      </td>)}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'rankings' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Currency Rankings</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-700"><th className="text-left py-2 px-3">Indicator</th>{currencies.map(c => <th key={c} className="text-center py-2 px-2" style={{ color: colors[c] }}>{c}</th>)}</tr></thead>
                  <tbody>{indicators.map(ind => (
                    <tr key={ind.id} className="border-b border-slate-800">
                      <td className="py-2 px-3">{ind.name}</td>
                      {currencies.map(c => <td key={c} className="py-2 px-2 text-center"><span className={`inline-block w-8 h-6 leading-6 rounded ${rankColor(rankings[ind.id][c])}`}>{rankings[ind.id][c]}</span></td>)}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'scores' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Strength Scores</h2>
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sorted.map(c => ({ name: c, score: scores[c] }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                    <YAxis tick={{ fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>{sorted.map(c => <rect key={c} fill={colors[c]} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {sorted.map((c, i) => (
                  <div key={c} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-amber-500 text-black' : i === 1 ? 'bg-slate-400 text-black' : i === 2 ? 'bg-amber-700' : 'bg-slate-700'}`}>{i + 1}</span>
                    <span className="font-bold text-lg" style={{ color: colors[c] }}>{c}</span>
                    <span className="ml-auto font-mono text-cyan-400">{scores[c].toFixed(2)}</span>
                    <button onClick={() => setShowAI(true)} className="px-2 py-1 bg-brand-500/20 text-brand-400 text-xs rounded">📊</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'radar' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Radar Analysis</h2>
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#475569" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 8]} tick={{ fill: '#64748b', fontSize: 10 }} />
                    {currencies.map(c => <Radar key={c} name={c} dataKey={c} stroke={colors[c]} fill={colors[c]} fillOpacity={0.1} strokeWidth={2} />)}
                    <Legend formatter={v => <span style={{ color: colors[v] }}>{v}</span>} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {tab === 'pairs' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Pair Forecasts</h2>
                <button onClick={() => setShowAI(true)} className="px-3 py-1.5 bg-brand-500/20 text-brand-400 text-sm rounded-lg border border-brand-500/30">🤖 AI Analysis</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {pairs.map(p => (
                  <div key={p.pair} onClick={() => setShowAI(true)} className={`p-4 rounded-lg border cursor-pointer hover:scale-[1.02] transition-transform ${p.direction === 'Bullish' ? 'bg-emerald-500/10 border-emerald-500/30' : p.direction === 'Bearish' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-800 border-slate-700'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">{p.pair}</span>
                      <span className="text-xl">{p.direction === 'Bullish' ? '📈' : p.direction === 'Bearish' ? '📉' : '➡️'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={p.direction === 'Bullish' ? 'text-emerald-400' : p.direction === 'Bearish' ? 'text-rose-400' : 'text-slate-400'}>{p.direction}</span>
                      <span className={p.signal === 'Strong' ? 'text-cyan-400' : p.signal === 'Moderate' ? 'text-amber-400' : 'text-slate-500'}>{p.signal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
