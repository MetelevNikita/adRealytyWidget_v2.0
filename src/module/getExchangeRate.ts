export async function getExchangeRate () {
    try {

        const url = 'https://www.cbr-xml-daily.ru/daily_json.js'

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type':'application/json'
            }
        })

        const data = await response.json()
        return {
            eur: {
                name: data.Valute.EUR.Name,
                value: Math.floor(data.Valute.EUR.Value)
            },
            usd: {
                name: data.Valute.USD.Name,
                value: Math.floor(data.Valute.USD.Value)
            }
        }
        
    } catch (error: Error | unknown) {
        if (error instanceof Error) {
            console.error(`Ошибка API cbr-xml-daily  ${error.message}`)
            return []
        }
        
        console.error(`Неизвестная ошибка ${error}`)
        return []
    }
}