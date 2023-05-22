import express from 'express'
import S3ServiceController from '../controllers/api'
const router = express.Router()
const api = new S3ServiceController

router.post('/create-bucket', api.createBucket)
router.get('/list-objects', api.listObjects)
router.post('/put-object', api.putObject)
router.post('/get-object', api.getObject)

export = router