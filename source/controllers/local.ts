const log = {
 debug: console.log,
 error: console.log
}
import DBManager from "../db"
const db = new DBManager()
import fs from 'fs'
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
    const insert = `
    INSERT INTO bucket (location, description)
    VALUES ('\`${request.params.bucket}\`', 'test');
  `
  const path = `/tmp/${request.params.bucket}`
  await fs.promises.mkdir(path, { recursive: true })
  await db.insert(insert)
  } catch(err) {
    console.log('Error during bucket creation', err)
  }
}

const putObject = async (request: any, response: any, next: any) => {
  /**
   * Creates an aws bucket. 
   * @param {string}  request - The request.
   * @param {string} [response] - The response.
   * @returns
   */
  console.log(`---PUT OBJECT ON ${request.params.bucket}---`)
  console.log('---INCOMING PARAMS REQUEST---', request.params)
  try {
    const insert = `
    INSERT INTO bucket (location, description)
    VALUES ('\`${request.params.bucket}\`', 'test');
  `
  const path = `/tmp/${request.params.bucket}`
  await fs.promises.mkdir(path, { recursive: true })
  await db.insert(insert)
  } catch(err) {
    console.log('Error during bucket creation', err)
  }
}

export default {
  createBucket,
}