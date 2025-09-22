import { parse, stringify } from 'yaml';
import AbstractParser from './abstractParser';

export default class YamlParser extends AbstractParser {
  parse(content: string) {
    return parse(content);
  }
  stringify(data: any) {
    return stringify(data);
  }
}
