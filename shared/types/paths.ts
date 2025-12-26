import {
  IsValidObject,
  TupleArrayElement,
  ArrayElement,
  IsTuple,
  IsTupleArray,
  IsArray,
} from './type';

// 数字加一：通过数组长度模拟数字运算
type PlusOne<N extends number, A extends any[] = []> = A['length'] extends N
  ? [...A, any]['length']
  : PlusOne<N, [...A, any]>;

// 增加索引值：将字符串数字索引加一
type IncreaseIndex<S extends string> = S extends `${infer N extends number}`
  ? `${PlusOne<N>}`
  : never;

// 替换元组索引：在路径字符串中递增元组索引
type ReplaceIndex<S extends string, Key extends string> = S extends `${Key}.${infer N}.${infer R}`
  ? `${Key}.${IncreaseIndex<N>}.${R}`
  : S extends `${Key}.${infer N}`
    ? `${Key}.${IncreaseIndex<N>}`
    : never;

// 生成元组类型的路径：递归处理元组每个位置的路径
type TuplePaths<T, Key extends string> = T extends readonly [infer First, ...infer Rest]
  ?
      | `${Key}.0` // 当前元组第一个元素的路径
      | (IsValidObject<First> extends true ? `${Key}.0.${Paths<First>}` : never) // 第一个元素的嵌套路径
      | (Rest extends readonly any[]
          ? TuplePaths<Rest, Key> extends infer R // 递归处理剩余元素
            ? R extends string
              ? ReplaceIndex<R, Key> // 递增剩余元素的索引
              : never
            : never
          : never)
  : never;

// 生成元组数组的路径：处理元组数组的索引路径
type TupleArrayPaths<T, Key extends string> =
  | `${Key}.${number}` // 任意数字索引
  | (TupleArrayElement<T> extends infer U
      ? U extends readonly [any, ...any[]]
        ? `${Key}.${number}${TuplePaths<U, ''>}` // 元组元素的嵌套路径
        : never
      : never);

type ArrayPaths<T, Key extends string> =
  | Key
  | `${Key}.${number}` // 数组数字索引
  | (IsValidObject<ArrayElement<T>> extends true
      ? `${Key}.${number}.${Paths<ArrayElement<T>>}` // 数组元素的嵌套路径
      : never);

// 核心路径实现：递归生成对象所有可能的路径
type PathImpl<T, K extends keyof T> = K extends string
  ? IsTuple<T[K]> extends true
    ? TuplePaths<T[K], K> // 处理元组类型
    : IsTupleArray<T[K]> extends true
      ? TupleArrayPaths<T[K], K> // 处理元组数组类型
      : IsArray<T[K]> extends true
        ? ArrayPaths<T[K], K> // 处理普通数组类型
        : IsValidObject<T[K]> extends true
          ? Paths<T[K]> extends never // 检查是否有子路径
            ? K // 无子路径时只返回当前键名
            : K | `${K}.${Paths<T[K]>}` // 有子路径时拼接嵌套路径
          : K // 基础类型直接返回键名
  : never;

// 生成对象所有可能的路径字符串联合类型
type Paths<T> = {
  [K in keyof Required<T>]: PathImpl<Required<T>, K>;
}[keyof T];

export default Paths;
