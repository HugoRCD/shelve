/**
 * This function is used to convert a string to a truthy or falsy value.
 *
 * The truthy values are: `true`, `false` or the string itself.
 * The falsy values are: `null` and `undefined`.
 *
 * It takes care of trimming the string and converting it to lowercase.
 * It returns null, true, false, undefined or the original value.
 *
 *
 * @example
 *
 * Boolish("true") // true
 *
 * Boolish("FALSE") // false
 *
 * Boolish("null") // null
 *
 * Boolish("undefined") // undefined
 *
 * Boolish("hello") // "hello"
 *
 * Boolish("") // null
 *
 * Boolish(" ") // null
 *
 * Boolish("TRUE") // true
 *
 */
type MaybeValue<T> = T extends undefined
  ? null | boolean | string | undefined | any
  : T;
export function Boolish<T = undefined>(val: any): MaybeValue<T> {
  if (typeof val !== "string") return val;
  val = val.trim().toLowerCase();
  switch (true) {
    case val === "":
    case val === "null":
      return null as MaybeValue<T>;
    case val === "true":
      return true as MaybeValue<T>;
    case val === "false":
      return false as MaybeValue<T>;
    case val === "undefined":
      return undefined as MaybeValue<T>;
    default:
      return val;
  }
}

/**
 * This function is used to check if an object has a list of properties.
 *
 * It returns true if the object has all the properties, false otherwise.
 *
 * If `allowNullish` is set to true, it will also check if the property is truthy.
 *
 * @example
 *
 * const obj = {name: "John", age: 20, address: null}
 *
 * hasOwnProperties(obj, ["name", "age"]) // true
 *
 * hasOwnProperties(obj, ["name", "age", "sex"]) // false
 *
 * hasOwnProperties(obj, ["name", "age", "address"], false) // false
 */
export function hasOwnProperties<T extends Object>(
  obj: T | any,
  properties: (keyof T)[],
  allowNullish = true
): obj is T {
  if (!obj) return false;
  if (typeof obj !== "object") return false;
  return properties.every((property) => {
    if (allowNullish) return Object.prototype.hasOwnProperty.call(obj, property);
    return Object.prototype.hasOwnProperty.call(obj, property) && Boolish<T>(obj[property]);
  });
}
