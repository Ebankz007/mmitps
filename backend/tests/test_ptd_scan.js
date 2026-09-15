const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5066,
  path: '/api/v1/ptd/scan',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Success:', parsed.success);
      if (!parsed.success) console.log('Error Message:', parsed.message);
      
      console.log('OHLCV Data Length:', parsed.ohlcv ? parsed.ohlcv.length : 0);
      console.log('Signals Length:', parsed.data ? parsed.data.length : 0);
      
      if (parsed.ohlcv && parsed.ohlcv.length > 0) {
          console.log('\nSample OHLCV [0]:', parsed.ohlcv[0]);
          console.log('Sample OHLCV [-1]:', parsed.ohlcv[parsed.ohlcv.length - 1]);
      }
      if (parsed.data && parsed.data.length > 0) {
          console.log('\nSample Signals [0]:', parsed.data[0]);
          console.log('Sample Signals [-1]:', parsed.data[parsed.data.length - 1]);
      }
    } catch(e) {
        console.error('Failed to parse response:', e);
        console.log('Raw response:', data.substring(0, 500) + '...');
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
});

req.write(JSON.stringify({
  symbol: 'XAUUSD',
  timeframe: '15m',
  logics: ['fibonacci', 'gann', 'cycles']
}));
req.end();
