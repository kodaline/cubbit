import http from 'http'
import express, { Express } from 'express'
const router: Express = express()
import routes from './routes/posts'

/** Routes */
router.use('/', routes)
/** Parse the request */
router.use(express.urlencoded({ extended: false }))
/** Takes care of JSON data */
router.use(express.json())

/** Error handling */
router.use((req, res, next) => {
  const error = new Error('not found')
  return res.status(404).json({
      message: error.message
  })
})

/** Server */
const httpServer = http.createServer(router)
const PORT: any = process.env.PORT ?? 8080
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`))