const env = require('./env/env');

const express = require('express');
let bodyParser = require('body-parser')
const app = express();

app.use(bodyParser.json());

app.use('/api/v1', (req, res, next) => {
    if(req.body.token === env.TOKEN){
        next();
    }else{
        res.status(401).json({message: "Incorrect token provided."});
    }
});
app.use('/api/v1', require('./routes/'));

const port = env.PORT;
app.listen(port, () => console.log(`Listening on port ${port}`));