import AWS from 'aws-sdk'
import RequestInterface from '../dto/request.dto'
//const log = require('ee-log')
const log = {
 debug: console.log,
 error: console.log
}

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION
})

const S3 = new AWS.S3({ apiVersion: '2006-03-01' })


const createBucket = async (request: any, response: any, next: any) => {
  /**
   * Creates an aws bucket on a specific region. 
   * @param {string}  name - The name of the bucket.
   * @param {string} [region] - The aws region where to create the bucket.
   * @returns {object} An object with the result of the operation.
   */
  console.log('---CREATE BUCKET---')
  console.log('---INCOMING PARAMS REQUEST---', request)
  const params = {
    Bucket: request.params.bucket,
    CreateBucketConfiguration: {
      LocationConstraint: request.params.region ? request.params.region : process.env.S3_BUCKET_REGION
    }
  }
  let result: any
  try {
    result = await S3.createBucket(params).promise()
    console.log('Bucket created\n', result.Location)
    return {
      data: {
        success: true,
        message: 'bucket-created',
        result: result
      }
    }
  } catch (error) {
    console.log('Error: bucket not created\n', error)
    return {
      data: {
        success: false,
        message: 'bucket-not-created',
        error: error
      }
    }
  }
}

const listObjects = async ({request, response, next} : RequestInterface) => {
  /**
   * Lists items of an aws bucket on a specific region. 
   * @param {string}  bucketName - The name of the bucket.
   * @param {string} [region] - An optional param where the bucket is located.
   * @param {string} [prefix] - An optional prefix of the items to list. Ex: /folder
   * @returns {object} An object with the items in the bucket.
   */
  console.log('---LIST OBJECTS---')

  const params = {
    Bucket: request.params.bucket,
    CreateBucketConfiguration: {
      LocationConstraint: request.params.region,
      Prefix: request.params.prefix ? request.params.prefix : '',
      MaxKeys: request.params.maxKeys ? request.params.maxKeys : 1000
    }
  }
  const result = await S3.listObjectsV2(params).promise()
  try {
    let isTruncated = true
    console.log('------------------------------------------\n')
    console.log('Your bucket contains the following objects:\n')
    console.log('------------------------------------------\n')

    let contents = ''

    while (isTruncated) {
      const { Contents, IsTruncated, NextContinuationToken } = result
      const contentsList = Contents?.map((c: any) => ` - ${c.Key}`).join("\n")
      contents += contentsList + "\n"
      isTruncated ? isTruncated : false
      result.ContinuationToken = NextContinuationToken
    }
    console.log(contents)
    return contents
  } catch (err) {
    console.error(err)
    return {
      data: {
        success: false,
        message: 'list-object-fail',
        error: err
      }
    }
  }
}

const putObject = async ({request, response, next} : RequestInterface) => {
  console.log('---PUT OBJECT---')
  const params = {
    Bucket: request.params.bucket,
    Body: request.params.body,
    Key: request.params.key,
    LocationConstraint: request.params.region ? request.params.region : '',
  }
  let result: any
  try {
    result = await S3.putObject(params).promise()
    console.log(`Object put on bucket ${request.params.bucket}\n`)
    return {
      data: {
        success: true,
        message: 'object-put',
        result: result
      }
    }
  } catch (error) {
    console.log('Error: object not put\n', error)
    return {
      data: {
        success: false,
        message: 'object-not-put',
        error: error
      }
    }
  }
}

const getObject = async ({request, response, next} : RequestInterface) => {
  console.log('---GET OBJECT---')

  const params = {
    Bucket: request.params.bucket,
    Key: request.params.key,
    Range: request.params.range ? request.params.range : ''
  }
  let result: any
  try {
    console.log(`Object retrieved from bucket ${request.params.bucket}\n`)
    return {
      data: {
        success: true,
        message: 'object-retrieved',
        result: result
      }
    }
  } catch (error) {
    console.log('Error: object not retrieved\n', error)
    return {
      data: {
        success: false,
        message: 'object-not-retrieved',
        error: error
      }
    }
  }
}
export default {
  createBucket,
  listObjects,
  getObject,
  putObject
}