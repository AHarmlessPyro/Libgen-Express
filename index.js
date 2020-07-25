const express = require('express');
const libgen = require('libgen');
const request = require('request');
const bodyParser = require('body-parser')
const cors = require('cors');
const env = require('dotenv').config();

const port = process.env.PORT || 8008;
const app = express();

//app.use(cors);

var whitelist = ['*']

var currentURL = process.env.BASE;
const jsonParser = bodyParser.json();
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

libgen.mirror().then((result) => {
    console.log(result)
    currentURL = result;
})

app.options('*', cors());

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });

var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
}

app.get('/', cors(), (req, res) => {
    res.send(currentURL);
})

app.get('/arrivals/:count?', cors(corsOptionsDelegate), (req, res) => {
    let arrivalsCount = process.env.MAX_ARRIVALS;

    if (req.params.count !== undefined) {
        arrivalsCount = req.params.count;
    }

    let idsToPrint = ""

    libgen.latest.id(currentURL)
        .then((id) => {
            for (let i = 0; i < arrivalsCount; i++) {
                idsToPrint += id - i + ",";
            }
        }).then(() => {
            request(`${currentURL}/json.php?ids=${idsToPrint}&fields=Author,Title,md5,id`, (error, response, body) => {
                if (error) {
                    console.error(error);
                    res.error(404);
                    return;
                }
                res.send(body);
            })
        })
})

app.get('/explore/:key=:value/:page?', cors(corsOptionsDelegate), (req, res) => {
    // libgen.search({
    //     mirror:currentURL,
    //     query:req.params.value,
    //     count
    // })
    console.log(req.body);
    res.send(req.params);
})

app.post('/explore', cors(), jsonParser, (req, res) => {
    req.body.mirror = currentURL
    libgen.search(req.body).then((result) => {
        res.send(result);
    })
})

app.listen(port, () => { console.log(`Example app listening at http://localhost:${port}`) })