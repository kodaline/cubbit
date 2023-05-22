import express from 'express'
import local from '../controllers/local'
const router = express()

router.put('/:bucket', local.createBucket)

export = router