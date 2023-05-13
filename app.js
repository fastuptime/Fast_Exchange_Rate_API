const axios = require('axios');
var cron = require('node-cron');
const express = require('express');
const app = express();
const {
    JsonDatabase
} = require("wio.db");
const moment = require('moment')

const db = new JsonDatabase({
    databasePath: "./db.json"
});
const params = ['usd', 'eur', 'try', 'rub', 'inr']

const getExchangeRate = async (fromCurrency) => {
    try {
        const response = await axios.get(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${fromCurrency}.json`)
        let rate = JSON.stringify(response.data[fromCurrency])
        rate = JSON.parse(rate)
        if (rate) {
            switch (fromCurrency) {
                case 'usd':
                    return {
                        euro: rate.eur,
                        try: rate.try,
                        rub: rate.rub,
                        inr: rate.inr,
                    }
                case 'eur':
                    return {
                        usd: rate.usd,
                        try: rate.try,
                        rub: rate.rub,
                        inr: rate.inr,
                    }
                case 'try':
                    return {
                        usd: rate.usd,
                        euro: rate.eur,
                        rub: rate.rub,
                        inr: rate.inr,
                    }
                case 'rub':
                    return {
                        usd: rate.usd,
                        euro: rate.eur,
                        try: rate.try,
                        inr: rate.inr,
                    }
                case 'inr':
                    return {
                        usd: rate.usd,
                        euro: rate.eur,
                        try: rate.try,
                        rub: rate.rub,
                    }
                default:
                    throw new Error()
            }
        } else {
            throw new Error()
        }
    } catch (error) {
        throw new Error(`Unable to get currency ${fromCurrency}`)
    }
}

async function checkAllExchange() {
    params.forEach(async (param) => {
        getExchangeRate(param).then((rate) => {
            db.set(param, rate)
        }).catch((error) => {
            console.log(error)
        })
    })
}

cron.schedule('*/2 * * * *', async () => {
    let lastExchangeRate = db.get('lastExchangeRate')
    if (lastExchangeRate) {
        let lastExchangeRateDate = moment(lastExchangeRate, 'DD/MM/YYYY HH:mm:ss')
        let now = moment()
        let diff = now.diff(lastExchangeRateDate, 'minutes')
        if (diff > 20) {
            await checkAllExchange();
        }
    } else {
        db.set('lastExchangeRate', moment().format('DD/MM/YYYY HH:mm:ss'))
        await checkAllExchange();
    }
}, {
    scheduled: true,
    timezone: "Europe/Istanbul"
});

/*

// APİ KEY

app.use(function (req, res, next) {
    if(req.query.key !== process.env.API_KEY || !req.query.key) {
        if(req.url == '/') return next();
        return res.json({
            status: false,
            message: 'Invalid API Key',
        })
    } else {
        next();
    }
});

*/

app.get('/', async (req, res) => {
    res.json({
        status: true,
        message: 'Welcome to Exchange Rate API v1.0.0',
        author: 'Can & FastUptime',
        github: 'github.com/fastuptime',
        endpoints: {
            usd: 'api/usd',
            eur: 'api/eur',
            try: 'api/try',
            rub: 'api/rub',
            inr: 'api/inr',
        }
    })
});

app.get('/api/:currency', async (req, res) => {
    let currency = req.params.currency
    if (params.includes(currency)) {
        let exchangeRate = db.get(currency)
        if (exchangeRate) {
            res.json({
                status: true,
                message: 'Exchange rate successfully fetched',
                data: exchangeRate,
                author: 'Can & FastUptime',
                github: 'github.com/fastuptime',
                endpoints: {
                    usd: 'api/usd',
                    eur: 'api/eur',
                    try: 'api/try',
                    rub: 'api/rub',
                    inr: 'api/inr',
                }
            })
        } else {
            res.json({
                status: false,
                message: 'Exchange rate not found',
                author: 'Can & FastUptime',
                github: 'github.com/fastuptime',
                endpoints: {
                    usd: 'api/usd',
                    eur: 'api/eur',
                    try: 'api/try',
                    rub: 'api/rub',
                    inr: 'api/inr',
                }
            })
        }
    }
});

app.use(function (req, res, next) {
    res.status(404).json({
        status: false,
        message: '404 Not Found',
        author: 'Can & FastUptime',
        github: 'github.com/fastuptime',
        endpoints: {
            usd: 'api/usd',
            eur: 'api/eur',
            try: 'api/try',
            rub: 'api/rub',
            inr: 'api/inr',
        }
    })
});
        

app.listen(80, () => {
    console.log('Exchange Rate API v1.0.0 started on port 80')
});
