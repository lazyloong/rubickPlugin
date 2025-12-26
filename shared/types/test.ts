import Get from './get';
import Paths from './paths';

type Equal<X, _Y extends X> = X;

interface ComplexNested {
  a: { b: { c: { d: { e: { f: number } } } } };
  arr: [string, number][];
  tuple: readonly [number, { x?: string }, boolean];
  intersection: { x: string } & { y: number };
  union: { k1: 1 } | { k2: 2 };
  numIdx: { [n: number]: { v: bigint } };
  strIdx: { [s: string]: { flag: symbol } };
  opt: { readonly deep: { readonly list: { item: { name: string } }[] } };
}

/* Paths */
type _Paths = Paths<ComplexNested>;

/* Get */
type Test1 = Equal<Get<ComplexNested, 'arr.0.1'>, number>;
type Test2 = Equal<Get<ComplexNested, 'numIdx.0'>, { v: bigint }>;
type Test3 = Equal<Get<ComplexNested, 'a.b.c.d.e.f'>, number>;
type Test4 = Equal<Get<ComplexNested, 'tuple.1.x'>, string | undefined>;
type Test5 = Equal<Get<ComplexNested, 'tuple.0'>, number>;
type Test121 = Equal<Get<ComplexNested, 'intersection.x'>, string>;
type Test6 = Equal<Get<ComplexNested, 'union.k1'>, never>;
type Test7 = Equal<Get<ComplexNested, 'strIdx.anyKey.flag'>, symbol>;
type Test8 = Equal<Get<ComplexNested, 'opt.deep.list.0.item.name'>, string>;
type Test9 = Equal<Get<ComplexNested, 'arr.1.0'>, string>;
type Test10 = Equal<Get<ComplexNested, 'tuple.2'>, boolean>;
type Test122 = Equal<Get<ComplexNested, 'tuple.1.x'>, string | undefined>;
type Test11 = Equal<Get<ComplexNested, 'numIdx.123.v'>, bigint>;
type Test12 = Equal<Get<ComplexNested, 'strIdx.someKey'>, { flag: symbol }>;

/* 边界情况 */
type Test13 = Equal<Get<ComplexNested, 'tuple.3'>, undefined>; // 越界
type Test14 = Equal<Get<ComplexNested, 'notExist'>, never>; // 根级不存在
type Test15 = Equal<Get<ComplexNested, 'a.b.c.notExist'>, never>; // 中间不存在
