const express = require('express');
const app = express();
const appRoute = require('./routes/route.js');

const cors = require('cors'); // Import cors module

// Enable CORS for all routes
app.use(cors());


// Define OPTIONS route for preflight requests
app.options('/api/product/getbill', (req, res) => {
    console.log('Received preflight request for /api/product/getbill');
    res.set('Access-Control-Allow-Origin', '*'); // Set Access-Control-Allow-Origin header
    res.status(200).end();
  });

const PORT = process.env.PORT || 5000;


app.use(express.json());

/* routes */
app.use('/api',appRoute)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})