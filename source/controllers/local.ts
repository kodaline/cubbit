const log = {
 debug: console.log,
 error: console.log
}
import helper from '../helpers/helper'
import DBManager from "../db"
const database = new DBManager()
import fs from 'fs'
import XmlDataInterface, { Content } from "../dto/xml-data.dto"
const etag = require('etag')

const createBucket = async (request: any, response: any, next: any) => {
  /**
   * Creates an aws bucket. 
   * @param {string}  request - The request.
   * @param {string} [response] - The response.
   * @returns
   */
  console.log('---CREATE BUCKET---')
  console.log('---INCOMING PARAMS REQUEST---', request.params)
  try {
    const select = `
      SELECT id FROM bucket
      WHERE location = '${request.params.bucket}';`

    const exists = await database.get(select)
    if(exists) {
      console.log('Bucket already exists')
      return response.status(200).send()
    }
    const insert = `
      INSERT INTO bucket (location, description)
      VALUES ('${request.params.bucket}', 'test');`
    const path = `/tmp/${request.params.bucket}`
    await fs.promises.mkdir(path, { recursive: true })
    await database.execute(insert)
  } catch(err) {
    console.log('Error during bucket creation', err)
  }
  return response.status(200).send()
}

const putObject = async (request: any, response: any, next: any) => {
  /**
   * Put object on bucket.
   * @param {string}  request - The request.
   * @param {string} [response] - The response.
   * @returns
   */
  // TODO: manage subfolder hierarchy?
  console.log('---INCOMING REQUEST---', request)
  console.log(`---PUT OBJECT ON ${request.params.bucket}---`)
  console.log('---INCOMING PARAMS REQUEST---', request.params)
  let ETag: any
  let size: any
  try {
    const path = `/tmp/${request.params.bucket}/${request.params.folder}`
    await fs.promises.mkdir(path, { recursive: true })
    console.log('---path---', path)
    ETag = etag(request.body)
    size = (request.body).length
    const select = `
      SELECT id FROM bucket
      WHERE location = '${request.params.bucket}';`
    const bucketId: any = await database.get(select)
    console.log('BUCKET DATA', bucketId)

    const insert = `
      INSERT INTO object (bucket_id, path, folder, key, etag, size)
      VALUES ('${bucketId['id']}',
              '${request.params.folder}/${request.params.key}',
              '${request.params.folder}',
              '${request.params.key}',
              '${ETag}',
              '${size}')
      ON CONFLICT(bucket_id, path) DO UPDATE SET sys_update = current_timestamp;`

    await database.execute(insert)
    const filePath = `/tmp/${request.params.bucket}/${request.params.folder}/${request.params.key}`
    try {
      console.log('...BODY...', request.body)
      console.log('...response...', response)
      fs.writeFileSync(filePath, request.body)
      // file written successfully
    } catch (err) {
      console.error(err)
      response.status(200).send()
    }
  } catch(err) {
    console.log('Error during object put', err)
    response.status(200).send()
  }
  return await response.set('etag', ETag).status(200).send()
}

const getObject = async (request: any, response: any, next: any) => {
  /**
   * Get object from bucket.
   * @param {string}  request - The request.
   * @param {string} [response] - The response.
   * @returns
   */
  console.log(`---GET OBJECT FROM BUCKET ${request.params.bucket}---`)
  console.log('---INCOMING PARAMS REQUEST---', request.params)
  console.log('---INCOMING RANGE REQUEST---', request.get('range'))

  let objectData: any
  let file: any
  let ETag: any
  const filePath = `/tmp/${request.params.bucket}/${request.params.folder}/${request.params.key}`
  let start: any
  let end: any
  let chunks: any
  const range = request.get('range')
  try {
    const select = `
    SELECT id FROM bucket
    WHERE location = '${request.params.bucket}';`

  const bucketId: any = await database.get(select)
  if(!bucketId) {
    const message = `Bucket ${request.params.bucket} does not exist, please first create the bucket.`
    return await response.send(message)
  }
    if(range) {
      console.log('---RANGE---', range)
      const rangeValues = ((range).split('=')[1]).split('-')
      start = rangeValues[0]
      end = rangeValues[1]
      chunks = fs.createReadStream(filePath, { start: parseInt(start), end: parseInt(end) })
      file = await helper.readableToString(chunks)
    } else (
      file = fs.readFileSync(filePath)
    )
    const selectObject = `SELECT * FROM object WHERE
      path = '${request.params.folder}/${request.params.key}'
      AND bucket_id = '${bucketId['id']}';`
    objectData = await database.get(selectObject)
    console.log('---OBJECT DATA---', objectData)
    ETag = etag(file)
  } catch(err) {
    console.log('Error during object get', err)
  }
  return await response.set(
    {
      'Last-Modified': objectData['sys_update'],
      'Etag': ETag,
      'Content-Range': range ? `${start}-${end}` : `0-${file.length}`,
    }
  ).status(200).send(file)
}

const listObjects = async (request: any, response: any, next: any) => {
  /**
   * Get object from bucket.
   * @param {string}  request - The request.
   * @param {string} [response] - The response.
   * @returns
   */
  console.log(`---LIST OBJECTS FROM BUCKET ${request.params.bucket}---`)
  console.log('---INCOMING PARAMS REQUEST---', request.params)
  console.log('---INCOMING MARKER REQUEST---', request.get('marker'))
  console.log('---INCOMING MAX-KEYS REQUEST---', request.get('max-keys'))
  console.log('---INCOMING PREFIX REQUEST---', request.get('prefix'))
  const prefix = request.query.prefix
  const marker = request.query.marker
  const defaultMaxKeys = 1000
  let totalObjects: any
  const maxKeys = request.query['max-keys'] ? parseInt(request.query['max-keys']) : defaultMaxKeys
  let objectData: any
  let selectObjects: string
  const filePath = `/tmp/${request.params.bucket}/${request.params.folder}/${request.params.key}`
  try {
    const select = `
      SELECT id FROM bucket
      WHERE location = '${request.params.bucket}';`
    const bucketId: any = await database.get(select)
    if(!bucketId) {
      const message = `Bucket ${request.params.bucket} does not exist, please first create the bucket.`
      return response.send(message)
    }
    selectObjects = `SELECT path, etag, size, sys_update
      FROM object
      WHERE bucket_id = '${bucketId['id']}'`

    if(prefix) {
      selectObjects += ` AND folder = '${prefix.replace('/', '')}'`
    }
    if(marker) {
      selectObjects += ` AND key >= '${marker}'`
    }
    totalObjects = await database.all(selectObjects)

    if(maxKeys) {
      selectObjects += ` LIMIT ${maxKeys}`
    }

    objectData = await database.all(selectObjects)
    console.log('---OBJECT DATA---', objectData)
  } catch(err) {
    console.log('Error during object get', err)
    return
  }
  const isTruncated = totalObjects.length > maxKeys
  let dataStruct: XmlDataInterface = {
    name: request.params.bucket,
    prefix: prefix ? prefix : '',
    marker: marker ? marker : '',
    maxKeys: maxKeys,
    truncated: isTruncated,
    contents: []
  }
  let contents: Array<Content> = []
  objectData.forEach((elem: any) => {
    const data = {
      key: elem['path'].split('/')[1],
      sysUpdate: elem[`sys_update`],
      etag: elem['etag'],
      size: elem['size']
    }
    contents.push(data)
  })
  dataStruct.contents = contents
  console.log('---DATA STRUCT---', dataStruct)
  const xmlStruct = await helper.buildXmlStructure(dataStruct)
  console.log('---XML---\n', xmlStruct)
  return await response.set('Content-Type', 'application/xml')
    .set('Content-Length', xmlStruct.length)
    .status(200).send(xmlStruct)
}

export default {
  createBucket,
  putObject,
  getObject,
  listObjects
}