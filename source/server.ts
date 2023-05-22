import http from 'http'
import express, { Express } from 'express'
const router: Express = express()
import routes from './routes/enpoints'
import DBManager from "./db"
const db = new DBManager()
db.init()
/** Parse the request */
router.use(express.urlencoded({ extended: false }))
/** Takes care of JSON data */
router.use(express.json())
/** Routes */
router.use('/', routes)

/** Server */
const httpServer = http.createServer(router)
const PORT: any = process.env.API_PORT ?? 8080
const HOST: any = process.env.API_HOST ?? 'localhost'
httpServer.listen(PORT, HOST, () => console.log(`The server is running on port ${PORT}`))