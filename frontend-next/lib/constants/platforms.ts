export interface Platform {
    id: string;
    label: string;
}

export const PLATFORMS: Platform[] = [
    { id: "mt4", label: "MT4" },
    { id: "mt5", label: "MT5" },
    { id: "leverate_sirix", label: "Leverate Sirix" },
    { id: "ninjatrader", label: "NinjaTrader" },
    { id: "dxtrade", label: "DXTrade" },
    { id: "tradovate", label: "Tradovate" },
    { id: "ctrader", label: "cTrader" },
    { id: "matchtrader", label: "Match-Trader" },
    { id: "tradelocker", label: "TradeLocker" },
    { id: "tradezero", label: "TradeZero" },
    { id: "tradier", label: "Tradier" },
    { id: "ameritrade", label: "Ameritrade" },
    { id: "interactivebrokers", label: "Interactive Broker" },
    { id: "tradestation", label: "TradeStation" },
    { id: "tickblaze", label: "Tickblaze" },
    { id: "motivewave", label: "Motivewave" },
    { id: "oanda", label: "Oanda" },
    { id: "power_e_trade", label: "Power E-Trade" },
    { id: "project_x", label: "Project X" },
    { id: "quantower", label: "Quantower" },
    { id: "questrade", label: "Questrade" },
    { id: "refinitiv_redi", label: "Refinitiv REDI" },
    { id: "rithmic_r_trader", label: "Rithmic R-Trader" },
    { id: "robinhood", label: "Robinhood" },
    { id: "sierra_chart", label: "Sierra Chart" },
    { id: "silexx", label: "Silexx" },
    { id: "sterling_trader_pro", label: "Sterling Trader Pro" },
    { id: "tc2000", label: "TC2000" },
    { id: "td_direct_investment", label: "TD Direct Investment" },
    { id: "tefs_evolution", label: "TEFS Evolution" },
    { id: "tastytrade", label: "Tastytrade" },
    { id: "think_or_swim", label: "Think or Swim" },
    { id: "webull", label: "Webull" },
    { id: "zerodha", label: "Zerodha" },
    { id: "cqg_desktop", label: "CQG Desktop" }
];
