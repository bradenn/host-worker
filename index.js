const express = require('express');
let bodyParser = require('body-parser')
const app = express();

app.use(bodyParser.json());

app.use('/api/v1', require('./routes/'));

app.listen(8000, () => console.log("Listening on port 8000"));