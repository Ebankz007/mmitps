"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Trash2, Bell, AlertTriangle, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { ALL_ASSETS } from "@/lib/constants/instruments";
import { useNotifications } from "@/hooks/use-notifications";

interface WatchlistItem {
  id: string;
  instrument: string;
  timeframe: string;
  addedAt: number;
}

interface WatchlistPanelProps {
  moduleName: string;
}

export function WatchlistPanel({ moduleName }: WatchlistPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState(ALL_ASSETS[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const { addNotification } = useNotifications();

  // Load watchlist items on mount
  useEffect(() => {
    const saved = localStorage.getItem(`watchlist_${moduleName.toLowerCase()}`);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load watchlist", e);
      }
    }
  }, [moduleName]);

  // Save watchlist when items change
  useEffect(() => {
    localStorage.setItem(`watchlist_${moduleName.toLowerCase()}`, JSON.stringify(items));
  }, [items, moduleName]);

  const handleAddItem = () => {
    // Check for duplicates
    if (items.some(item => item.instrument === selectedInstrument && item.timeframe === selectedTimeframe)) {
      addNotification({
        title: "Duplicate Entry",
        message: `${selectedInstrument} on ${selectedTimeframe} is already in your watchlist.`,
        type: "system"
      });
      return;
    }

    const newItem: WatchlistItem = {
      id: Math.random().toString(36).substring(2, 9),
      instrument: selectedInstrument,
      timeframe: selectedTimeframe,
      addedAt: Date.now()
    };

    setItems([...items, newItem]);
    setIsOpen(false);
    
    addNotification({
      title: "Added to Watchlist",
      message: `Monitoring ${selectedInstrument} on ${selectedTimeframe}`,
      type: "system"
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Mock checking for signals
  useEffect(() => {
    if (items.length === 0) return;

    const interval = setInterval(() => {
      // Simulate a 5% chance of a signal for one of the watched items every 15 seconds
      if (Math.random() < 0.05) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const isBullish = Math.random() > 0.5;
        
        addNotification({
          title: `Signal: ${randomItem.instrument}`,
          message: `${moduleName} detected a high-probability ${isBullish ? 'bullish' : 'bearish'} setup on the ${randomItem.timeframe} timeframe.`,
          type: "geometry", // Using geometry type for general signals to utilize existing styles
          bias: isBullish ? "Bullish" : "Bearish"
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [items, moduleName, addNotification]);


  return (
    <div className="bg-surface border border-[var(--color-border)] rounded-lg p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2rem] text-gray-500 flex items-center gap-2">
            <Bell size={14} className="text-amber-500" />
            Watchlist
          </h3>
          <p className="text-xs text-gray-400 mt-1">Receive notifications for specific assets.</p>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20 transition-all border border-amber-500/20"
        >
          {isOpen ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className="p-5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
           <div className="space-y-4">
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Select Asset</label>
                  <select
                      value={selectedInstrument}
                      onChange={(e) => setSelectedInstrument(e.target.value)}
                      className="w-full bg-surface border border-[var(--color-border)] rounded-lg px-4 py-3 text-xs font-bold focus:outline-none focus:border-amber-500/50 appearance-none text-[var(--color-text-primary)]"
                  >
                      {ALL_ASSETS.map(asset => (
                          <option key={asset} value={asset} className="bg-zinc-900">{asset}</option>
                      ))}
                  </select>
              </div>

              <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Timeframe</label>
                  <div className="flex bg-surface rounded-lg border border-[var(--color-border)] p-1">
                      {["15m", "1h", "4h", "D"].map((tf) => (
                          <button
                              key={tf}
                              onClick={() => setSelectedTimeframe(tf)}
                              className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black transition-all ${
                                  selectedTimeframe === tf 
                                  ? "bg-amber-500 text-black shadow-lg shadow-brand-500/20" 
                                  : "text-gray-500 hover:text-[var(--color-text-primary)]"
                              }`}
                          >
                              {tf}
                          </button>
                      ))}
                  </div>
              </div>

              <button 
                onClick={handleAddItem}
                className="w-full py-3 bg-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-lg hover:bg-amber-400 transition-all shadow-lg shadow-brand-500/10"
              >
                Add to Watchlist
              </button>
           </div>
        </div>
      )}

      {items.length === 0 && !isOpen ? (
        <div className="text-center p-8 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] border-dashed">
            <Bell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-xs font-bold text-gray-500">Your watchlist is empty.</p>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">Add assets to receive alerts.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg group hover:border-[var(--color-border)] transition-all">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                  <div>
                    <p className="text-sm font-black text-[var(--color-text-primary)]">{item.instrument}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <Clock size={10} className="text-gray-500" />
                       <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{item.timeframe} • Scanning</span>
                    </div>
                  </div>
               </div>
               
               <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Remove from watchlist"
               >
                 <Trash2 size={14} />
               </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
