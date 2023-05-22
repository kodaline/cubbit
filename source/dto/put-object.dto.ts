export default interface putObjectInterface {
  bucket: string,
  key: string,
  body: Blob,
  region?: string,
}