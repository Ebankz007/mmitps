const FibonacciTimeService = require('./backend/services/ptd/FibonacciTimeService');
const GannSquareService = require('./backend/services/ptd/GannSquareService');
const AstroCycleService = require('./backend/services/ptd/AstroCycleService');
const FourierCycleService = require('./backend/services/ptd/FourierCycleService');

const getSimulatedOHLCV = (count = 500) => {
    const data = [];
    let price = 2650; 
    const now = Date.now();
    for (let i = 0; i < count; i++) {
        const change = (Math.random() - 0.5) * 10;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        data.push({
            time: Math.floor((now - (count - i) * 15 * 60 * 1000) / 1000),
            open, high, low, close, volume: Math.random() * 1000
        });
        price = close;
    }
    return data;
};

const ohlcv = getSimulatedOHLCV(300);

try {
    console.log("Running Fibonacci...");
    FibonacciTimeService.generateProjections(ohlcv);
} catch (e) {
    console.error("Fibonacci Error:", e);
}

try {
    console.log("Running Gann...");
    GannSquareService.generateProjections(ohlcv);
} catch (e) {
    console.error("Gann Error:", e);
}

try {
    console.log("Running Fourier...");
    FourierCycleService.generateProjections(ohlcv);
} catch (e) {
    console.error("Fourier Error:", e);
}

try {
    console.log("Running Astro...");
    AstroCycleService.generateProjections(ohlcv);
} catch (e) {
    console.error("Astro Error:", e);
}

console.log("Test script finished");
