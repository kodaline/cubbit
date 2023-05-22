import http from 'http'
import express, { Express } from 'express'
import routes from './routes/enpoints'
import DBManager from "./db"

const router: Express = express()
const db = new DBManager()

db.init()
router.use(express.urlencoded({extended: true}))
router.use(express.json())
router.use(express.raw(
  {
    inflate: true,
    limit: '50mb',
    type: () => true
  }
))
router.use('/', routes)

/** Server */
const httpServer = http.createServer(router)
const PORT: any = process.env.API_PORT ?? 8080
const HOST: any = process.env.API_HOST ?? 'localhost'
httpServer.listen(PORT, HOST, () => console.log(`The server is running on port ${PORT}`))