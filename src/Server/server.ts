import http from 'http'
import express, {Application, Request, Response} from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import path from 'path'


 
export class Server {

    app: Application
    port: number

    constructor(port: number) {
        this.app = express()
        this.port = port
    }


    startServer () {
        try {

            const server = http.createServer(this.app)

            server.on("error", (error: any) => {
    switch (error.code) {
      case "EADDRINUSE":
        console.error(`Порт ${error.port} уже занят`);
        break;

      case "EACCES":
        console.error(`Нет прав для запуска на порту ${error.port}`);
        break;

      case "EADDRNOTAVAIL":
        console.error(`Адрес ${error.address} недоступен на этой машине`);
        break;

      case "EINVAL":
        console.error("Некорректный порт или адрес");
        break;

      default:
        console.error("Ошибка сервера:", error);
    }
            });


            this.app.use(express.json())
            this.app.use(express.urlencoded())
            this.app.use(express.static(path.join(process.cwd(), 'public')))
            this.app.use(morgan('dev'))
            this.app.use(helmet())

            server.listen(this.port, () => {
                console.info(`Сервер запущен на порту ${this.port}`)
            })
            
        } catch (error: Error | unknown) {

            if (error instanceof Error) {
                console.error(`Ошибка создания сервере `, error.message)
                return error.message
            }

            console.error('Неизвестная ошибка ', error)
            return error
        }
    }

    routerGet (endpoint: string, callback: (req: Request, res: Response) => any) {
        this.app.get(endpoint, callback)
    }

    routerPost (endpoint: string, callback: (req: Request, res: Response) => any) {

        this.app.post(endpoint, callback)

    }
}