import { expect, test } from "vitest";
import fl0 from "./index";

test("simple var", () => {
  const count = fl0.var(0);
  const values: number[] = [];

  count.observe((newCount) => values.push(newCount));

  expect(values).toEqual([0]);
});

test("an updated var", () => {
  const count = fl0.var(0);
  const values: number[] = [];

  count.observe((newCount) => values.push(newCount));

  count.update((old) => old + 1);

  expect(values).toEqual([0, 1]);
});

test("a var with a map", () => {
  const count = fl0.var(0);
  const stars = count.map((c) => "*".repeat(c));

  const countValues: number[] = [];
  const starValues: string[] = [];

  count.observe((newCount) => countValues.push(newCount));
  stars.observe((newStars) => starValues.push(newStars));

  expect(countValues).toEqual([0]);
  expect(starValues).toEqual([""]);

  count.update((old) => old + 1);

  expect(countValues).toEqual([0, 1]);
  expect(starValues).toEqual(["", "*"]);

  count.update((old) => old * 10);

  expect(countValues).toEqual([0, 1, 10]);
  expect(starValues).toEqual(["", "*", "*".repeat(10)]);
});

test("update a mapped var", () => {
  const count = fl0.var(0);
  const stars = count.map((c) => "*".repeat(c));

  const starValues: string[] = [];

  stars.observe((newStars) => starValues.push(newStars));
  stars.update((_) => "CATS");

  expect(starValues).toEqual(["", "CATS"]);
});

test("peek a value", () => {
  const count = fl0.var(0);

  expect(count.peek()).toBe(0);
});

test("set a value", () => {
  const count = fl0.var(0);
  count.set(69);

  const countValues: number[] = [];
  count.observe((newCount) => countValues.push(newCount));

  expect(count.peek()).toBe(69);
  expect(countValues).toEqual([69]);
});

test("combine two vars", () => {
  const count1 = fl0.var(0);
  const count2 = fl0.var(0);

  const combined = count1.combine(count2).map(([c1, c2]) => c1 * c2);

  const countValues: number[] = [];
  combined.observe((sum) => countValues.push(sum));

  expect(countValues).toEqual([0]);

  count1.set(10);
  expect(countValues).toEqual([0, 0]);

  count2.set(10);
  expect(countValues).toEqual([0, 0, 100]);
});
