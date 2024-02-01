import { expect, test } from "vitest";
import fl0 from "./index";

test("simple var", () => {
  const count = fl0.var(0);
  const values: number[] = [];

  count.get().observe((c) => values.push(c));

  expect(values).toEqual([0]);
});

test("an updated var", () => {
  const count = fl0.var(0);
  const values: number[] = [];

  count.get().observe((c) => values.push(c));

  count.update((old) => old + 1);

  expect(values).toEqual([0, 1]);
});

test("a var with a map", () => {
  const count = fl0.var(0);
  const stars = count.get().map((c) => "*".repeat(c));

  const values: number[] = [];
  const starValues: string[] = [];

  count.get().observe((newCount) => values.push(newCount));
  stars.observe((newStars) => starValues.push(newStars));

  expect(values).toEqual([0]);
  expect(starValues).toEqual([""]);

  count.update((old) => old + 1);

  expect(values).toEqual([0, 1]);
  expect(starValues).toEqual(["", "*"]);

  count.update((old) => old * 10);

  expect(values).toEqual([0, 1, 10]);
  expect(starValues).toEqual(["", "*", "*".repeat(10)]);
});

test("update a mapped var", () => {
  const count = fl0.var(0);
  const stars = count.get().map((c) => "*".repeat(c));

  const starValues: string[] = [];

  stars.observe((newStars) => starValues.push(newStars));
  stars.push("CATS");

  expect(starValues).toEqual(["", "CATS"]);
});

test("peek a value", () => {
  const count = fl0.var(0);

  expect(count.peek()).toBe(0);
});

test("set a value", () => {
  const count = fl0.var(0);
  count.set(69);

  const values: number[] = [];
  count.get().observe((count) => values.push(count));

  expect(values).toEqual([69]);
  expect(count.peek()).toBe(69);
});

test("combine two vars", () => {
  const count1 = fl0.var(0);
  const count2 = fl0.var(0);

  const combined = count1
    .get()
    .combine(count2.get())
    .map(([c1, c2]) => c1 * c2);

  const values: number[] = [];
  combined.observe((product) => values.push(product));

  expect(values).toEqual([0]);

  count1.set(10);
  expect(values).toEqual([0, 0]);

  count2.set(10);
  expect(values).toEqual([0, 0, 100]);
});

test("throwing observer", () => {
  const count = fl0.var(0);

  const values: number[] = [];
  count.get().observe((_) => {
    throw new Error("oops");
  });
  count.get().observe((num) => values.push(num));

  count.update((num) => num + 1);

  expect(values).toEqual([0, 1]);
});
