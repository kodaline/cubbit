import xmlbuilder from 'xmlbuilder'
import XmlDataInterface from '../dto/xml-data.dto'

const readableToString = async (readable: any) => {
  let result = ''
  for await (const chunk of readable) {
    result += chunk
  }
  return result
}

const buildXmlStructure = async (data: XmlDataInterface) => {
  const doc = xmlbuilder.create('ListBucketResult').att('xmlns', 'http://s3.amazonaws.com/doc/2006-03-01/')
    doc.ele('Name').txt(data.name)
    .up()
    .ele('Prefix').txt(data.prefix)
    .up()
    .ele('Marker').txt(data.marker)
    .up()
    .ele('MaxKeys').txt(data.maxKeys.toString())
    .up()
    .ele('IsTruncated').txt(data.truncated.toString())
    data.contents.forEach((elem: any) => {
      doc.ele('Contents')
      .ele('Key').text(elem.key)
      .up()
      .ele('LastModified').txt(elem.sysUpdate)
      .up()
      .ele('ETag').txt(elem.etag)
      .up()
      .ele('Size').txt(elem.size)
    })
    return doc.toString({pretty: true})
}

export default{
  readableToString,
  buildXmlStructure
}