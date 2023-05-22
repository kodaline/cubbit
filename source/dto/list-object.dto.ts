export default interface listObjectInterface {
  bucket: string,
  region?: string,
  prefix?: string,
  maxKeys?: number
}