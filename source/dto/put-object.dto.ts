export default interface putObjectInterface {
  bucketName: string,
  key: string,
  body: Blob,
  region?: string
}