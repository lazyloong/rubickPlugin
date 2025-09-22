import AbstractParser from './abstractParser';

export default class JsonParser extends AbstractParser {
  override parse(content: string): any {
    return JSON.parse(content);
  }

  override stringify(data: any): string {
    return JSON.stringify(data, null, 2);
  }
}
