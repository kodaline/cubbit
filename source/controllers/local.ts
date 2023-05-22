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
  console.log(`---PUT OBJECT ON ${request.params.bucket}---`)
  console.log('---INCOMING PARAMS REQUEST---', request.params)
  console.log('---INCOMING REQUEST---', request)
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
      VALUES ('${bucketId['id']}', '${request.params.folder}/${request.params.key}');`

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
  try {
    const path = `/tmp/${request.params.bucket}/${request.params.folder}`

    const select = `
      SELECT id FROM bucket
      WHERE location = ${request.params.bucket};`
    const bucketId: any = await database.get(select)
    const insert = `
      INSERT INTO object (bucket_id, path)
      VALUES ('${bucketId['id']}', '${request.params.key}');`
    await database.execute(insert)
  } catch(err) {
    console.log('Error during object get', err)
  }
}

export default {
  createBucket,
  putObject,
  getObject
}