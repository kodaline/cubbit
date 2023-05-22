import express from 'express'
import local from '../controllers/local'
const router = express.Router()

router.put('/:bucket', local.createBucket)
router.put('/:bucket/:folder/:key', local.putObject)
router.get('/:bucket/:folder/:key', local.getObject)

export = router