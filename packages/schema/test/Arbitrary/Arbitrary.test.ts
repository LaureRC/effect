import * as A from "@effect/schema/Arbitrary"
import * as S from "@effect/schema/Schema"
import { propertyFrom, propertyTo } from "@effect/schema/test/util"
import * as fc from "fast-check"

describe("Arbitrary/Arbitrary", () => {
  it("exports", () => {
    expect(A.ArbitraryHookId).exist
  })

  it("should throw on transformations", () => {
    const schema = S.NumberFromString
    expect(() => A.go(schema.ast)).toThrow(
      new Error("cannot build an Arbitrary for transformations")
    )
  })

  it("to", () => {
    const schema = S.NumberFromString
    propertyTo(schema)
  })

  it("from", () => {
    const NumberFromString = S.NumberFromString
    const schema = S.struct({
      a: NumberFromString,
      b: S.tuple(NumberFromString),
      c: S.union(NumberFromString, S.boolean),
      d: NumberFromString.pipe(S.positive()),
      e: S.optionFromSelf(NumberFromString)
    })
    propertyFrom(schema)
  })

  it("from/ lazy", () => {
    const NumberFromString = S.NumberFromString
    interface I {
      readonly a: string | I
    }
    interface A {
      readonly a: number | A
    }
    const schema: S.Schema<I, A> = S.lazy(() =>
      S.struct({
        a: S.union(NumberFromString, schema)
      })
    )
    propertyFrom(schema)
  })

  it("templateLiteral. a", () => {
    const schema = S.templateLiteral(S.literal("a"))
    propertyTo(schema)
  })

  it("templateLiteral. a b", () => {
    const schema = S.templateLiteral(S.literal("a"), S.literal(" "), S.literal("b"))
    propertyTo(schema)
  })

  it("templateLiteral. a${string}", () => {
    const schema = S.templateLiteral(S.literal("a"), S.string)
    propertyTo(schema)
  })

  it("templateLiteral. a", () => {
    const schema = S.templateLiteral(S.literal("a"))
    propertyTo(schema)
  })

  it("templateLiteral. ${string}", () => {
    const schema = S.templateLiteral(S.string)
    propertyTo(schema)
  })

  it("templateLiteral. a${string}b", () => {
    const schema = S.templateLiteral(S.literal("a"), S.string, S.literal("b"))
    propertyTo(schema)
  })

  it("never", () => {
    expect(() => A.to(S.never)(fc)).toThrow(
      new Error("cannot build an Arbitrary for `never`")
    )
  })

  it("string", () => {
    propertyTo(S.string)
  })

  it("void", () => {
    propertyTo(S.void)
  })

  it("number", () => {
    propertyTo(S.number)
  })

  it("boolean", () => {
    propertyTo(S.boolean)
  })

  it("bigint", () => {
    propertyTo(S.bigintFromSelf)
  })

  it("symbol", () => {
    propertyTo(S.symbolFromSelf)
  })

  it("object", () => {
    propertyTo(S.object)
  })

  it("literal 1 member", () => {
    const schema = S.literal(1)
    propertyTo(schema)
  })

  it("literal 2 members", () => {
    const schema = S.literal(1, "a")
    propertyTo(schema)
  })

  it("uniqueSymbol", () => {
    const a = Symbol.for("@effect/schema/test/a")
    const schema = S.uniqueSymbol(a)
    propertyTo(schema)
  })

  it("empty enums should throw", () => {
    enum Fruits {}
    const schema = S.enums(Fruits)
    expect(() => A.to(schema)(fc)).toThrow(
      new Error("cannot build an Arbitrary for an empty enum")
    )
  })

  it("Numeric enums", () => {
    enum Fruits {
      Apple,
      Banana
    }
    const schema = S.enums(Fruits)
    propertyTo(schema)
  })

  it("String enums", () => {
    enum Fruits {
      Apple = "apple",
      Banana = "banana",
      Cantaloupe = 0
    }
    const schema = S.enums(Fruits)
    propertyTo(schema)
  })

  it("Const enums", () => {
    const Fruits = {
      Apple: "apple",
      Banana: "banana",
      Cantaloupe: 3
    } as const
    const schema = S.enums(Fruits)
    propertyTo(schema)
  })

  it("tuple. empty", () => {
    const schema = S.tuple()
    propertyTo(schema)
  })

  it("tuple. required element", () => {
    const schema = S.tuple(S.number)
    propertyTo(schema)
  })

  it("tuple. required element with undefined", () => {
    const schema = S.tuple(S.union(S.number, S.undefined))
    propertyTo(schema)
  })

  it("tuple. optional element", () => {
    const schema = S.tuple().pipe(S.optionalElement(S.number))
    propertyTo(schema)
  })

  it("tuple. optional element with undefined", () => {
    const schema = S.tuple().pipe(S.optionalElement(S.union(S.number, S.undefined)))
    propertyTo(schema)
  })

  it("tuple. e + e?", () => {
    const schema = S.tuple(S.string).pipe(S.optionalElement(S.number))
    propertyTo(schema)
  })

  it("tuple. e + r", () => {
    const schema = S.tuple(S.string).pipe(S.rest(S.number))
    propertyTo(schema)
  })

  it("tuple. e? + r", () => {
    const schema = S.tuple().pipe(S.optionalElement(S.string), S.rest(S.number))
    propertyTo(schema)
  })

  it("tuple. r", () => {
    const schema = S.array(S.number)
    propertyTo(schema)
  })

  it("tuple. r + e", () => {
    const schema = S.array(S.string).pipe(S.element(S.number))
    propertyTo(schema)
  })

  it("tuple. e + r + e", () => {
    const schema = S.tuple(S.string).pipe(S.rest(S.number), S.element(S.boolean))
    propertyTo(schema)
  })

  it("lazy/to tuple", () => {
    type A = readonly [number, A | null]
    const schema: S.Schema<A> = S.lazy<A>(
      () => S.tuple(S.number, S.union(schema, S.literal(null)))
    )
    propertyTo(schema)
  })

  // 71 MB heap used
  it.skip("lazy/to struct", () => {
    interface A {
      readonly a: string
      readonly as: ReadonlyArray<A>
    }
    const schema: S.Schema<A> = S.lazy(() =>
      S.struct({
        a: S.string,
        as: S.array(schema)
      })
    )
    propertyTo(schema)
  })

  // 37 MB heap used
  it.skip("lazy/to record", () => {
    type A = {
      [_: string]: A
    }
    const schema: S.Schema<A> = S.lazy(() => S.record(S.string, schema))
    propertyTo(schema)
  })

  describe("struct", () => {
    it("required property signature", () => {
      const schema = S.struct({ a: S.number })
      propertyTo(schema)
    })

    it("required property signature with undefined", () => {
      const schema = S.struct({ a: S.union(S.number, S.undefined) })
      propertyTo(schema)
    })

    it("optional property signature", () => {
      const schema = S.struct({ a: S.optional(S.number) })
      propertyTo(schema)
    })

    it("optional property signature with undefined", () => {
      const schema = S.struct({ a: S.optional(S.union(S.number, S.undefined)) })
      propertyTo(schema)
    })

    it("baseline", () => {
      const schema = S.struct({ a: S.string, b: S.number })
      propertyTo(schema)
    })
  })

  it("union", () => {
    const schema = S.union(S.string, S.number)
    propertyTo(schema)
  })

  it("record(string, string)", () => {
    const schema = S.record(S.string, S.string)
    propertyTo(schema)
  })

  it("record(symbol, string)", () => {
    const schema = S.record(S.symbolFromSelf, S.string)
    propertyTo(schema)
  })

  it("minLength", () => {
    const schema = S.string.pipe(S.minLength(1))
    propertyTo(schema)
  })

  it("maxLength", () => {
    const schema = S.string.pipe(S.maxLength(2))
    propertyTo(schema)
  })

  it("lessThanOrEqualTo", () => {
    const schema = S.number.pipe(S.lessThanOrEqualTo(1))
    propertyTo(schema)
  })

  it("greaterThanOrEqualTo", () => {
    const schema = S.number.pipe(S.greaterThanOrEqualTo(1))
    propertyTo(schema)
  })

  it("lessThan", () => {
    const schema = S.number.pipe(S.lessThan(1))
    propertyTo(schema)
  })

  it("greaterThan", () => {
    const schema = S.number.pipe(S.greaterThan(1))
    propertyTo(schema)
  })

  it("startsWith", () => {
    const schema = S.string.pipe(S.startsWith("a"))
    propertyTo(schema)
  })

  it("endsWith", () => {
    const schema = S.string.pipe(S.endsWith("a"))
    propertyTo(schema)
  })

  it("int", () => {
    const schema = S.number.pipe(S.int())
    propertyTo(schema)
  })

  it("nonNaN", () => {
    const schema = S.number.pipe(S.nonNaN())
    propertyTo(schema)
  })

  it("finite", () => {
    const schema = S.number.pipe(S.finite())
    propertyTo(schema)
  })

  it("extend/ struct + record", () => {
    const schema = S.struct({ a: S.string }).pipe(
      S.extend(S.record(S.string, S.union(S.string, S.number)))
    )
    propertyTo(schema)
  })

  it("between + int", () => {
    const schema = S.number.pipe(S.between(1, 10), S.int())
    propertyTo(schema)
  })

  it("int + between", () => {
    const schema = S.number.pipe(S.int(), S.between(1, 10))
    propertyTo(schema)
  })

  it("pattern: should be set by default", () => {
    const regexp = /^[A-Z]{3}[0-9]{3}$/
    const schema = S.string.pipe(S.pattern(regexp))
    propertyTo(schema)
  })

  it("should support doubles as constraints", () => {
    const schema = S.number.pipe(S.clamp(1.3, 3.1))
    propertyTo(schema)
  })
})
