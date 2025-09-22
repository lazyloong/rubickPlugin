import JsonParser from './json';
import YamlParser from './yaml';
import TomlParser from './toml';
import IniParser from './ini';
import XmlParser from './xml';

const extMap = {
  json: JsonParser,
  yaml: YamlParser,
  yml: YamlParser,
  toml: TomlParser,
  ini: IniParser,
  xml: XmlParser,
} as const;

type ParserMap = typeof extMap;
type Ext = keyof ParserMap;
type Parser = InstanceType<ParserMap[Ext]>;

function isExt(e: string): e is Ext {
  return e in extMap;
}

export default function createConfig(filePath: string): Parser {
  const ext = filePath.split('.').pop()?.toLowerCase() || 'json';
  if (!isExt(ext)) throw new Error(`Unsupported extension: ${ext}`);
  const Parser = extMap[ext];
  return new Parser(filePath);
}
