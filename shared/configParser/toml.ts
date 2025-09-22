import { parse, stringify } from '@iarna/toml';
import AbstractParser from './abstractParser';

export default class TomlParser extends AbstractParser {
  parse(content: string) {
    return parse(content);
  }

  stringify(data: any) {
    return stringify(data);
  }
}
