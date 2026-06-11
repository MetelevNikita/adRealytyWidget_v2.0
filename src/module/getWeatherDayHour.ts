
import regions from '../../regions.json'
import {weatherCodeIcons} from '../lib/weathetIcons'




export async function getWeatherDayHour (city: string, baseUrl: string): Promise<any[]> {

    const insertUrlWeather = Object.fromEntries(
    Object.entries(weatherCodeIcons).map(([code, data]) => [
        code,
        {
            ...data,
            icon: `${baseUrl}${data.icon}`
        }

    ])
)


    const controller = new AbortController()
    const timeout = setTimeout(() => {
        controller.abort()
    }, 10000)

    try {

        //

        const findCurrentCity = regions.data.find((item: {city: string}) => item.city == city) ?? null

        if (!findCurrentCity) {
            console.error('Параметр города на найден в списке город на получение данных о погоде на день')
            return []
        }

        // 

        const url = new URL('https://api.open-meteo.com/v1/forecast')

        // 

        url.searchParams.set("latitude", findCurrentCity.lat);
        url.searchParams.set("longitude", findCurrentCity.lon);
        url.searchParams.set("hourly",  "temperature_2m,weather_code,precipitation_probability");
        url.searchParams.set('forecast_hours', '24');
        url.searchParams.set("timezone", findCurrentCity.timezone);

        const response = await fetch(url, {
            signal: controller.signal,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()
        const dayHour = data.hourly.time
  
        const newData = dayHour.map((item: string, index: number): any[] => {

            let obj = {} as any
            obj['time'] = item

            for (let item of Object.keys(data.hourly)) {
                if (!item) return []
                obj[item] = data.hourly[item][index]
            }
            return obj
        }).map((item: any) => {
            const code = Number(item.weather_code)
            return {
                ...item,
                temperature_2m: Math.floor(item.temperature_2m),
                time: new Date(item.time).toLocaleTimeString('RU-ru', {
                    hourCycle: 'h24',
                    hour: '2-digit',
                    minute: '2-digit', 
                }),
                date: new Date(item.time).toLocaleDateString('RU-ru'),
                weather_code: insertUrlWeather[code as keyof typeof weatherCodeIcons]
            }

        })

        return newData

    } catch (error: Error | unknown) {
        if (error instanceof Error) {
            console.error('Ошибка API open-meteo !!!!', {
                name: error.name,
                message: error.message,
                cause: error.cause
            })
            return []
        }

        console.error(`Неизвестная ошибка ${error}`)
        return []
    } finally {
        clearInterval(timeout)
    }
}