import AWS from 'aws-sdk'
//const log = require('ee-log')
const log = {
 debug: console.log,
 error: console.log
}
class S3ServiceController {
  S3: any
  constructor() {
    AWS.config.update({
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      region: process.env.S3_BUCKET_REGION
    })

    this.S3 = new AWS.S3({ apiVersion: '2006-03-01' })
  }

  async createBucket(name: string, region?: string) {
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
          data: result.$response.data
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
          data: result.Location
        }
      }
    } catch (error) {
      console.log('Error: bucket not created\n', error)
      return {
        data: {
          success: false,
          message: 'bucket-not-created',
          data: error
        }
      }
    }
  }

  async listObjects(bucketName: string, region?: string, prefix?: string, maxKeys?: number) {
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
    const command = await this.S3.ListObjectsV2Command({ params })
  
    try {
      let isTruncated = true
      console.log('------------------------------------------\n')
      console.log('Your bucket contains the following objects:\n')
      console.log('------------------------------------------\n')

      let contents = ''
  
      while (isTruncated) {
        const { Contents, IsTruncated, NextContinuationToken } = await this.S3.send(command)
        const contentsList = Contents.map((c: any) => ` - ${c.Key}`).join("\n")
        contents += contentsList + "\n"
        isTruncated = IsTruncated
        command.input.ContinuationToken = NextContinuationToken
      }
      console.log(contents)
  
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = S3ServiceController
