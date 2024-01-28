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
