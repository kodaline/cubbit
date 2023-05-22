const log = {
 debug: console.log,
 error: console.log
}
import DBManager from "../db"
const database = new DBManager()
import fs from 'fs'
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
    console.log('EXISTS', exists)
    if(exists) {
      console.log('Bucket already exists')
      return response.status(200).send()
    }
    const insert = `
      INSERT INTO bucket (location, description)
      VALUES ('${request.params.bucket}', 'test');`
    console.log('INSERT', insert)
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
  try {
    const path = `/tmp/${request.params.bucket}/${request.params.folder}`
    await fs.promises.mkdir(path, { recursive: true })
    console.log('---path---', path)

    const select = `
      SELECT id FROM bucket
      WHERE location = '${request.params.bucket}';`
    const bucketId: any = await database.get(select)
    console.log('BUCKET DATA', bucketId)

    const insert = `
      INSERT INTO object (bucket_id, path)
      VALUES ('${bucketId['id']}', '${request.params.folder}/${request.params.key}')
      ON CONFLICT(bucket_id, path) DO UPDATE SET sys_update = current_timestamp;`

    await database.execute(insert)
    const filePath = `/tmp/${request.params.bucket}/${request.params.folder}/${request.params.key}`
    try {
      console.log('...BODY...', request.body)
      console.log('...response...', response)
      fs.writeFileSync(filePath, request.body)
      // file written successfully
      ETag = etag(request.body)
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
    if(range) {
      console.log('---RANGE---', range)
      const rangeValues = ((range).split('=')[1]).split('-')
      start = rangeValues[0]
      end = rangeValues[1]
      chunks = fs.createReadStream(filePath, { start: parseInt(start), end: parseInt(end) })
      file = await readableToString(chunks)
    } else (
      file = fs.readFileSync(filePath)
    )
    console.log('---READ FILE---', file)
    const select = `
      SELECT id FROM bucket
      WHERE location = '${request.params.bucket}';`
    const bucketId: any = await database.get(select)
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

const readableToString = async (readable: any) => {
  let result = ''
  for await (const chunk of readable) {
    result += chunk
  }
  return result
}

export default {
  createBucket,
  putObject,
  getObject
}