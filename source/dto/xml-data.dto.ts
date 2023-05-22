export default interface XmlDataInterface {
  name: string,
  prefix: string,
  marker: string,
  maxKeys: number,
  truncated: boolean,
  contents: Array<Content>
}

export interface Content {
  key: string,
  sysUpdate: string,
  etag: string,
  size: number
}