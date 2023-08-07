type Obj<T> = {
  [key: string]: T;
};
type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never;

