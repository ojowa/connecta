require('dotenv').config();
const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect()
  .then(() => c.query('SELECT id, name, "displayName", "priceMonthly", "priceYearly", features, "dailyLikes", "dailySuperLikes", "isPopular", "sortOrder" FROM plans ORDER BY "sortOrder"'))
  .then(r => { console.log(JSON.stringify(r.rows, null, 2)); c.end(); })
  .catch(e => { console.error(e.message); c.end(); });
