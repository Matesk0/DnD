const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'VTT Scroll Keeper Backend is active.',
    rulesets: ['5e', 'pf2e'],
  });
});

app.listen(PORT, () => {
  console.log(`VTT Backend listening on port ${PORT}`);
});
