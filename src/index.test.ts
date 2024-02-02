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

test("combine two vars", () => {
  const count1 = fl0.var(0);
  const count2 = fl0.var(0);

  const combined = fl0.combine(count1, count2).map(([c1, c2]) => c1 * c2);

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

test("detach observer", () => {
  const count = fl0.var(0);
  const observer1 = count.get();
  const observer2 = count.get();

  const values1: number[] = [];
  observer1.observe((x) => values1.push(x));
  const values2: number[] = [];
  observer2.observe((x) => values2.push(x));

  expect(values1).toEqual([0]);
  expect(values2).toEqual([0]);

  count.set(10);
  expect(values1).toEqual([0, 10]);
  expect(values2).toEqual([0, 10]);

  observer2.detach();

  count.set(100);
  expect(values1).toEqual([0, 10, 100]);
  expect(values2).toEqual([0, 10]);
});

test("detach a mapped observer", () => {
  const count = fl0.var(0);
  const observer = count.get().map((x) => x.toString());

  const values: string[] = [];
  observer.observe((x) => values.push(x));

  expect(values).toEqual(["0"]);

  count.set(10);
  expect(values).toEqual(["0", "10"]);

  observer.detach();

  count.set(100);
  expect(values).toEqual(["0", "10"]);
});

test("detach a combined observer", () => {
  const count1 = fl0.var(0);
  const count2 = fl0.var(0);
  const observer = fl0.combine(count1, count2);

  let value = 0;
  observer.observe(([x, y]) => {
    value = x + y;
  });

  expect(value).toBe(0);

  count1.set(10);
  count2.set(3);
  expect(value).toBe(13);

  observer.detach();

  count1.set(100);
  count2.set(20);
  expect(value).toBe(13);
});
