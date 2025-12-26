// 定义基础类型：包括所有原始类型和内置对象类型
type Primitive = string | number | boolean | bigint | symbol | undefined | null;
type Builtin = Primitive | Function | Date | Error | RegExp;

type IsStringNumber<T extends string> = T extends `${number}` ? true : false;
type StringToNumber<S extends string> = S extends `${infer N extends number}` ? N : never;

// 判断是否为元组类型（固定长度的数组）
type IsTuple<T> = T extends readonly [infer _, ...infer __]
  ? true
  : T extends readonly []
    ? true
    : false;

// 判断是否为元组数组（数组元素都是元组）
type IsTupleArray<T> = T extends Array<infer U> ? (IsTuple<U> extends true ? true : false) : false;

// 判断是否为普通数组（非元组）
type IsArray<T> = T extends Array<any> ? (IsTuple<T> extends false ? true : false) : false;

// 判断是否为有效的对象类型（非基础类型和内置对象）
type IsValidObject<T> = T extends Builtin ? false : T extends object ? true : false;

// 提取数组元素的类型
type ArrayElement<T> = T extends Array<infer U> ? U : never;

// 提取元组数组元素的类型
type TupleArrayElement<T> = T extends Array<infer U> ? U : never;

export type {
  Primitive,
  Builtin,
  IsStringNumber,
  StringToNumber,
  IsTuple,
  IsTupleArray,
  IsArray,
  IsValidObject,
  ArrayElement,
  TupleArrayElement,
};
