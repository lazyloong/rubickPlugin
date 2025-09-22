import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import AbstractParser from './abstractParser';

export default class XmlParser extends AbstractParser {
  private parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  private builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    format: true,
  });

  parse(content: string) {
    return this.parser.parse(content);
  }
  stringify(data: any): string {
    return this.builder.build(data);
  }
}
