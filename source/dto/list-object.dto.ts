export default interface listObjectInterface {
  bucketName: string,
  region?: string,
  prefix?: string,
  maxKeys?: number
}