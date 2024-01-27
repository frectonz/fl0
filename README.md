# fl0

An incremental computaion library.

```typescript
const count = fl0.var(0);
const stars = count.map(count => "*".repeat(count));

const countElm = document.querySelector("#count")!;
const inc = document.querySelector("#inc")!;
const dec = document.querySelector("#dec")!;

inc.addEventListener("click", () => {
  count.update((old: number) => old + 1);
});

dec.addEventListener("click", () => {
  count.update((old: number) => old - 1);
});

stars.observe((stars: string) => {
  countElm.textContent = stars;
});
```
