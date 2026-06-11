import { Server } from './Server/server'

// 

import NodeCache from 'node-cache'

// service


import { getDateRange } from './lib/getDateRange'

// 

import { getWeatherWeek } from './module/getWeatherWeek'
import { getWeatherDayHour } from './module/getWeatherDayHour'
import { getExchangeRate } from './module/getExchangeRate'


const wetaherCache = new NodeCache({
    stdTTL: 60 * 60,
    useClones: true
})





const weatherServer = new Server(7500)
weatherServer.startServer()

// 


weatherServer.routerGet('/:city', async (req, res) => {



    console.log('Получаем данные о погоде')

    const { city } = req.params

    if (city === 'favicon.ico') {
        return res.status(204).send()
    }

    const url = `${req.protocol}://${req.get("host")}`

    const currentDate = new Date()
    const rangeDates = getDateRange(currentDate)

    if (!wetaherCache.get(`DATA:${city}`)) {

        console.log('Данные получены с API')


        const [ dataWeatherWeek,  dataWeatherDay, exchangeRate] = await Promise.all([getWeatherWeek(city as string, rangeDates as string[], url as string), getWeatherDayHour(city as string, url as string), getExchangeRate()])

        if (!dataWeatherWeek.length || !dataWeatherDay.length) {
            return res.status(502).send({
                error: 'Weather API unavailable',
                result: {
                    dataWeatherWeek,
                    dataWeatherDay,
                    exchangeRate
                }
            })
        }

        wetaherCache.set(`DATA:${city}`, {
            dataWeatherWeek,
            dataWeatherDay,
            exchangeRate
        })
    } else {
        console.log('Данные из КЭША')
    }


    const data = wetaherCache.get(`DATA:${city}`)



    res.status(200).send({
        result: data
    })
})


weatherServer.routerGet('/', (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Weather API",
    });
})

