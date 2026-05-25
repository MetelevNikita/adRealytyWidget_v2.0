export function getDateRange (currentDate: any) {
    
    

    let dates: string[] = []


    for(let i=0; i<=7; i++) {
        const date = new Date(currentDate)
         const range = date.setDate(currentDate.getDate() + i)
         const formateDate = new Date(range).toISOString().split('T')[0]
         dates.push(formateDate)

    }

    return dates
}