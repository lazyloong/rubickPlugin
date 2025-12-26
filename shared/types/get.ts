import { ArrayElement, IsArray, IsTuple } from './type';

// 辅助类型
type IsStringNumber<S extends string> = S extends `${number}` ? true : false;
type StringToNumber<S extends string> = S extends `${infer N extends number}` ? N : never;

// 处理点分隔路径
type HandleDotPath<T, Key extends string, Rest extends string> = Key extends keyof T
  ? Rest extends ''
    ? T[Key] // 路径到达底层，返回值
    : Get<T[Key], Rest> // 递归处理下一层路径
  : HandleIndexSignature<T, Key, Rest>;

// 处理索引签名
type HandleIndexSignature<T, Key extends string, Rest extends string> = T extends {
  [n: number]: infer V;
}
  ? IsStringNumber<Key> extends true
    ? Get<V, Rest> // 处理数字索引签名
    : T extends { [s: string]: infer V2 }
      ? Get<V2, Rest> // 处理字符串索引签名
      : never
  : T extends { [s: string]: infer V }
    ? Get<V, Rest> // 处理字符串索引签名
    : never;

// 处理数组索引路径 - 无后续路径
type HandleArrayIndexNoAfter<T, Index extends string> =
  IsTuple<T> extends true
    ? IsStringNumber<Index> extends true
      ? StringToNumber<Index> extends keyof T
        ? T[StringToNumber<Index>] // 返回元组特定位置的类型
        : undefined // 处理超出元组边界的情况
      : never
    : IsArray<T> extends true
      ? ArrayElement<T> // 返回数组元素的类型
      : never;

// 处理直接访问
type HandleDirectAccess<T, Path extends string> = Path extends keyof T
  ? T[Path] // 直接键名访问
  : HandleDirectIndexSignature<T, Path>;

// 处理直接索引签名访问
type HandleDirectIndexSignature<T, Path extends string> =
  IsTuple<T> extends true
    ? HandleArrayIndexNoAfter<T, Path>
    : T extends { [n: number]: infer V }
      ? IsStringNumber<Path> extends true
        ? V
        : never
      : never;

// 主 Get 类型
type Get<T, Path extends string> = Path extends ''
  ? T // 空路径返回根对象
  : Path extends `${infer Key}.${infer Rest}` // 解析点分隔的路径
    ? HandleDotPath<T, Key, Rest>
    : HandleDirectAccess<T, Path>;

export default Get;
