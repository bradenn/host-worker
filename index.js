const env = require('../env/env');

const express = require('express');
let bodyParser = require('body-parser')
const app = express();

app.use(bodyParser.json());

app.use('/api/v1', require('./routes/'));

const port = env.PORT;
app.listen(port, () => console.log(`Listening on port ${port}`));