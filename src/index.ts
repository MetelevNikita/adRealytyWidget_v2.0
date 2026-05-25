import { Server } from './Server/server'

// 

import path from 'node:path'
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


    const currentDate = new Date()
    const rangeDates = getDateRange(currentDate)

    if (!wetaherCache.get(`DATA:${city}`)) {

        console.log('Данные получены с API')

        let dataWeatherWeek = await getWeatherWeek(city as string, rangeDates as string[])
        let dataWeatherDay = await getWeatherDayHour(city as string)
        let exchangeRate = await getExchangeRate()

        wetaherCache.set(`DATA:${city}`, {
            dataWeatherWeek,
            dataWeatherDay,
            exchangeRate
        })
    }


    console.log('Данные из КЭША')
    const data = wetaherCache.get(`DATA:${city}`)



    res.status(200).send({
        result: data
    })
})

