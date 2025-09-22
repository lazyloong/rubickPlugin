type Primitive = string | number | boolean | bigint | symbol | undefined | null;
type Builtin = Primitive | Function | Date | Error | RegExp;

// 判断是否为元组
type IsTuple<T> = T extends readonly [infer _, ...infer __]
  ? true
  : T extends readonly []
    ? true
    : false;

// 判断是否为元组数组
type IsTupleArray<T> = T extends Array<infer U> ? (IsTuple<U> extends true ? true : false) : false;

// 判断是否为普通数组
type IsArray<T> = T extends Array<any> ? (IsTuple<T> extends false ? true : false) : false;

// 判断是否为有效对象
type IsValidObject<T> = T extends Builtin ? false : T extends object ? true : false;

// 提取数组元素类型
type ArrayElement<T> = T extends Array<infer U> ? U : never;

// 提取元组数组元素类型
type TupleArrayElement<T> = T extends Array<infer U> ? U : never;

// 数字加一
type PlusOne<N extends number, A extends any[] = []> = A['length'] extends N
  ? [...A, any]['length']
  : PlusOne<N, [...A, any]>;

// 增加索引值
type IncreaseIndex<S extends string> = S extends `${infer N extends number}`
  ? `${PlusOne<N>}`
  : never;

// 替换元组索引
type ReplaceIndex<S extends string, Key extends string> = S extends `${Key}[${infer N}].${infer R}`
  ? `${Key}[${IncreaseIndex<N>}].${R}`
  : S extends `${Key}[${infer N}]`
    ? `${Key}[${IncreaseIndex<N>}]`
    : never;

// 元组路径生成
type TuplePaths<T, Key extends string> = T extends readonly [infer First, ...infer Rest]
  ?
      | `${Key}[0]`
      | (IsValidObject<First> extends true ? `${Key}[0].${Paths<First>}` : never)
      | (Rest extends readonly any[]
          ? TuplePaths<Rest, Key> extends infer R
            ? R extends string
              ? ReplaceIndex<R, Key>
              : never
            : never
          : never)
  : never;

// 元组数组路径生成
type TupleArrayPaths<T, Key extends string> =
  | `${Key}[${number}]`
  | (TupleArrayElement<T> extends infer U
      ? U extends readonly [any, ...any[]]
        ? `${Key}[${number}].${TuplePaths<U, ''>}`
        : never
      : never);

// 核心路径实现
type PathImpl<T, Key extends keyof T> = Key extends string
  ? IsTuple<T[Key]> extends true
    ? // 处理元组情况
      TuplePaths<T[Key], Key>
    : IsTupleArray<T[Key]> extends true
      ? // 处理元组数组情况
        TupleArrayPaths<T[Key], Key>
      : IsArray<T[Key]> extends true
        ? // 处理普通数组情况
          | `${Key}[${number}]`
            | (IsValidObject<ArrayElement<T[Key]>> extends true
                ? `${Key}[${number}].${Paths<ArrayElement<T[Key]>>}`
                : never)
        : // 处理对象情况
          IsValidObject<T[Key]> extends true
          ? `${Key}` | `${Key}.${Paths<T[Key]>}`
          : // 基本类型
            `${Key}`
  : never;

// 生成所有路径
type Paths<T> = {
  [Key in keyof T]: PathImpl<T, Key>;
}[keyof T];

// 增强的 Get 类型
type Get<T, P extends string> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Get<T[Key], Rest>
    : never
  : P extends `${infer Key}[${infer Index}]${infer After}`
    ? Key extends keyof T
      ? T[Key] extends readonly any[]
        ? After extends ''
          ? // 没有后续索引
            IsTuple<T[Key]> extends true
            ? Index extends `${infer N extends number}`
              ? N extends keyof T[Key]
                ? T[Key][N]
                : never
              : never
            : T[Key][number]
          : // 有后续索引，递归处理
            Get<T[Key], `[${Index}]${After}`>
        : never
      : never
    : P extends keyof T
      ? T[P]
      : never;

// 提供建议的路径类型
type Suggest<T, P = Paths<T>> = P | (string & {});

export type { Paths, Get, Suggest };
