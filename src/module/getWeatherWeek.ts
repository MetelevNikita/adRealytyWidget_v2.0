// json

import regions from '../../regions.json'
import {weatherCodeIcons} from '../lib/weathetIcons'



export async function getWeatherWeek (city: string, dates: string[], baseUrl: string): Promise<any[]> {
    try {

        console.log('На неделю')


        const shortDay = [
            {
                day: 'Понедельник',
                short: 'ПН'
            },
            {
                day: 'Вторник',
                short: 'ВТ'
            },
            {
                day: 'Среда',
                short: 'СР'
            },
            {
                day: 'Четверг',
                short: 'ЧТ'
            },
            {
                day: 'Пятница',
                short: 'ПТ'
            },
            {
                day: 'Суббота',
                short: 'СБ'
            },
            {
                day: 'Воскресенье',
                short: 'ВС'
            },
            
        ]


        const insertUrlWeather = Object.fromEntries(
            Object.entries(weatherCodeIcons).map(([code, data]) => [
                code,
                {
                    ...data,
                    icon: `${baseUrl}${data.icon}`
                }

            ])
        )



        const findCurrentCity = regions.data.find((item: {city: string}) => item.city == city) ?? null
        console.log(findCurrentCity)


        if (!findCurrentCity) {
            console.error('Параметр города на найден в списке город на получение данных о погоде на неделю')
            return []
        }


        const url = new URL("https://api.open-meteo.com/v1/forecast");

        url.searchParams.set("latitude", findCurrentCity.lat);
        url.searchParams.set("longitude", findCurrentCity.lon);
        url.searchParams.set("daily",  "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min");
        url.searchParams.set("timezone", findCurrentCity.timezone);
        url.searchParams.set("forecast_days", "7");
        url.searchParams.set("current", "weather_code,is_day");


        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()
        const keys = Object.keys(data.daily)

        const newData = data.daily.time.map((day: string, index: number) => {

            console.log(day)

            let obj: any = {}
            keys.map((key) => {

                switch (key) {
                    case 'time':
                        return (
                            obj['date'] = new Date(data.daily[key][index]).toLocaleDateString('ru-Ru', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                            }),
                            obj['week'] = new Date(data.daily[key][index]).toLocaleDateString('ru-Ru', {
                                weekday: "short"
                            }).toUpperCase()
                        )
                    case 'weather_code':
                        const code = Number(data.daily[key][index])
                        return obj[key] = insertUrlWeather[code as keyof typeof weatherCodeIcons]
                    default:
                        return obj[key] = data.daily[key][index]
                }

            })

            return  { 
                        time: new Date().toLocaleDateString('ru-Ru', {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: findCurrentCity.timezone
                        }).split(', ')[1],
                        day: new Date().getDate(),
                        week: '',
                        ...obj
                    }
            
        })

        console.log(newData)

        return newData

        
    } catch (error: Error | unknown) {

        if (error instanceof Error) {
            console.error(`Ошибка API open-meteo ${error.message}`)
            return []
        }
        console.error(`Неизветсная ошибка ${error}`)
        return []
    }
}