export const RULE_CONFIGS: Record<string, RuleConfig> = {
  insert: {
    label: '插入文本',
    fields: [
      {
        name: 'insert',
        label: '插入内容',
        type: 'input',
        placeholder: '输入要插入的内容',
        required: true,
      },
      {
        name: 'position',
        label: '位置',
        type: 'number',
        min: 0,
      },
      {
        name: 'reverse',
        label: '倒数模式',
        type: 'switch',
      },
      {
        name: 'keepExtension',
        label: '保留后缀',
        type: 'switch',
      },
    ],
    defaultValue: {
      insert: '',
      position: 0,
      reverse: false,
      keepExtension: true,
    },
  },
  replace: {
    label: '替换文本',
    fields: [
      {
        name: 'search',
        label: '查找内容',
        type: 'input',
        required: true,
      },
      {
        name: 'replace',
        label: '替换为',
        type: 'input',
        required: true,
      },
      {
        name: 'caseSensitive',
        label: '区分大小写',
        type: 'switch',
      },
      {
        name: 'wholeWord',
        label: '全词匹配',
        type: 'switch',
      },
    ],
    defaultValue: {
      search: '',
      replace: '',
      caseSensitive: false,
      wholeWord: false,
    },
  },
  regex: {
    label: '正则替换',
    fields: [
      {
        name: 'pattern',
        label: '正则表达式',
        type: 'input',
        required: true,
      },
      {
        name: 'replacement',
        label: '替换内容',
        type: 'input',
        required: true,
      },
      {
        name: 'global',
        label: '全局匹配',
        type: 'switch',
        defaultValue: true,
      },
      {
        name: 'ignoreCase',
        label: '忽略大小写',
        type: 'switch',
      },
      {
        name: 'multiline',
        label: '多行模式',
        type: 'switch',
      },
    ],
    defaultValue: {
      pattern: '',
      replacement: '',
      global: true,
      ignoreCase: false,
      multiline: false,
    },
  },
  sequence: {
    label: '序号重命名',
    fields: [
      {
        name: 'start',
        label: '起始序号',
        type: 'number',
        defaultValue: 1,
        min: 0,
      },
      {
        name: 'step',
        label: '步长',
        type: 'number',
        defaultValue: 1,
        min: 1,
      },
      {
        name: 'digits',
        label: '位数',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 10,
      },
      {
        name: 'position',
        label: '位置',
        type: 'number',
        min: 0,
      },
    ],
    defaultValue: {
      start: 1,
      step: 1,
      digits: 2,
      position: 0,
    },
  },
  case: {
    label: '大小写转换',
    fields: [
      {
        name: 'case',
        label: '转换模式',
        type: 'select',
        options: [
          { label: '全小写', value: 'lower' },
          { label: '全大写', value: 'upper' },
          { label: '首字母大写', value: 'capitalize' },
          { label: '标题化', value: 'title' },
        ],
        required: true,
      },
      {
        name: 'keepextension',
        label: '保留后缀',
        type: 'switch',
      },
    ],
    defaultValue: {
      case: 'lower',
      keepextension: true,
    },
  },
  js: {
    label: 'JavaScript模式',
    fields: [
      {
        name: 'code',
        label: '代码',
        type: 'textarea',
        placeholder: '可用的变量: basename, ext',
        required: true,
      },
    ],
    defaultValue: {
      code: 'return basename + ext;',
    },
  },
};

export type FieldConfig = {
  name: string;
  label: string;
  type: 'input' | 'switch' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  min?: number;
  max?: number;
  options?: Array<{ label: string; value: any }>;
};

export interface InsertType {
  insert: string;
  position: number;
  reverse: boolean;
  keepExtension: boolean;
}

export interface ReplaceType {
  search: string;
  replace: string;
  caseSensitive: boolean;
  wholeWord: boolean;
}

export interface RegexType {
  pattern: string;
  replacement: string;
  global: boolean;
  ignoreCase: boolean;
  multiline: boolean;
}

export interface SequenceType {
  start: number;
  step: number;
  digits: number;
  position: number;
}

export interface CaseType {
  case: 'lower' | 'upper' | 'capitalize' | 'title';
  keepextension: boolean;
}

export interface JsType {
  code: string;
}

export interface RuleConfig {
  label: string;
  fields: FieldConfig[];
  defaultValue: InsertType | ReplaceType | RegexType | SequenceType | CaseType | JsType;
}
