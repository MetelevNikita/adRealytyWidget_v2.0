
import regions from '../../regions.json'
import {weatherCodeIcons} from '../lib/weathetIcons'

export async function getWeatherDayHour (city: string): Promise<any[]> {
    try {

        // 

        const findCurrentCity = regions.data.find((item: {city: string}) => item.city == city) ?? null

        if (!findCurrentCity) {
            console.error('Параметр города на найден в списке город на получение данных о погоде на день')
            return []
        }

         console.log('город найден: ', findCurrentCity)

        // 

        const url = new URL('https://api.open-meteo.com/v1/forecast')

        // 

        url.searchParams.set("latitude", findCurrentCity.lat);
        url.searchParams.set("longitude", findCurrentCity.lon);
        url.searchParams.set("hourly",  "temperature_2m,weather_code,precipitation_probability");
        url.searchParams.set('forecast_hours', '24');
        url.searchParams.set("timezone", findCurrentCity.timezone);

        const response = await fetch(url, {
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
                time: new Date(item.time).toLocaleTimeString('RU-ru', {
                    hourCycle: 'h24',
                    hour: '2-digit',
                    minute: '2-digit', 
                }),
                date: new Date(item.time).toLocaleDateString('RU-ru'),
                weather_code: weatherCodeIcons[code as keyof typeof weatherCodeIcons]
            }

        })

        
        return newData

    } catch (error: Error | unknown) {
        if (error instanceof Error) {
            console.error(`Ошибка API open-meteo ${error.message}`)
            return []
        }
        
        console.error(`Неизвестная ошибка ${error}`)
        return []
    }
}