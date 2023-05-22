import AWS from 'aws-sdk'
import createBucketInterface from '../dto/create-bucket.dto'
import listObjectInterface from '../dto/list-object.dto'
import putObjectInterface from '../dto/put-object.dto'
import getObjectInterface from '../dto/get-object.dto'
//const log = require('ee-log')
const log = {
 debug: console.log,
 error: console.log
}
export default class S3ServiceController {
  S3: any
  constructor() {
    AWS.config.update({
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      region: process.env.S3_BUCKET_REGION
    })

    this.S3 = new AWS.S3({ apiVersion: '2006-03-01' })
  }

  async createBucket({name, region} : createBucketInterface) {
    /**
     * Creates an aws bucket on a specific region. 
     * @param {string}  name - The name of the bucket.
     * @param {string} [region] - The aws region where to create the bucket.
     * @returns {object} An object with the result of the operation.
     */

    const params = {
      Bucket: name,
      CreateBucketConfiguration: {
        LocationConstraint: region ? region : process.env.S3_BUCKET_REGION
      }
    }
    let result: any
    try {
      result = await this.S3.headBucket(params).promise()
    } catch (error) {
      console.log('Error: bucket already exists\n', result.$response.data)
      return {
        data: {
          success: false,
          message: 'bucket-already-exists',
          result: result
        }
      }
    }
    try {
      result = await this.S3.createBucket(params).promise()
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

  async listObjects({bucketName, region, prefix, maxKeys} : listObjectInterface) {
    /**
     * Lists items of an aws bucket on a specific region. 
     * @param {string}  bucketName - The name of the bucket.
     * @param {string} [region] - An optional param where the bucket is located.
     * @param {string} [prefix] - An optional prefix of the items to list. Ex: /folder
     * @returns {object} An object with the items in the bucket.
     */

    const params = {
      Bucket: bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: region,
        Prefix: prefix ? prefix : '',
        MaxKeys: maxKeys ? maxKeys : 1000
      }
    }
    const result = await this.S3.listObjectsV2(params).promise()
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

  async putObject({bucketName, key, body, region} : putObjectInterface) {
    const params = {
      Bucket: bucketName,
      Body: body, 
      Key: key,
      LocationConstraint: region ? region : '',
    }
    let result: any
    try {
      result = await this.S3.putObject(params).promise()
      console.log(`Object put on bucket ${bucketName}\n`)
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

  async getObject({bucketName, key, range, region} : getObjectInterface) {
    const params = {
      Bucket: bucketName,
      Key: key,
      Range: range ? range : ''
    }
    let result: any
    try {
      result = await this.S3.getObject(params).promise()
      console.log(`Object retrieved from bucket ${bucketName}\n`)
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
}