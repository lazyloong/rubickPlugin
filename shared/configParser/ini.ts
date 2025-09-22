import { parse, stringify } from 'ini';
import AbstractParser from './abstractParser';

export default class IniParser extends AbstractParser {
  parse(content: string) {
    return parse(content);
  }

  stringify(data: any) {
    return stringify(data);
  }
}
