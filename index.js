const express = require('express');
const libgen = require('libgen');
const request = require('request');
const bodyParser = require('body-parser')
const env = require('dotenv').config();

const port = process.env.PORT || 8008;
const app = express();

const jsonParser = bodyParser.json();

const urlEncodedParser = bodyParser.urlencoded({ extended: false });

var currentURL = process.env.BASE;

libgen.mirror().then((result) => {
    console.log(result)
    currentURL = result;
})

app.get('/', (req, res) => {
    res.send(currentURL);
})

app.get('/arrivals/:count?', (req, res) => {
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

app.get('/explore/:key=:value/:page?', (req, res) => {
    // libgen.search({
    //     mirror:currentURL,
    //     query:req.params.value,
    //     count
    // })
    console.log(req.body);
    res.send(req.params);
})

app.post('/explore', jsonParser, (req, res) => {
    req.body.mirror = currentURL
    libgen.search(req.body).then((result) => {
        res.send(result);
    })
})

app.listen(port, () => { console.log(`Example app listening at http://localhost:${port}`) })