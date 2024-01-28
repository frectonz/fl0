type Observer<T> = (value: T) => void;
type MapFn<T, U> = (value: T) => U;
type UpdateFn<T> = (value: T) => T;

class Var<T> {
  private value: T;
  private observers: Observer<T>[] = [];

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  peek(): T {
    return this.value;
  }

  set(value: T) {
    this.value = value;
    this.notifyObservers();
  }

  update(updateFn: UpdateFn<T>): void {
    const newValue = updateFn(this.value);
    this.value = newValue;
    this.notifyObservers();
  }

  observe(observer: Observer<T>): void {
    this.observers.push(observer);
    observer(this.value);
  }

  map<U>(mapFn: MapFn<T, U>): Var<U> {
    const mappedVar = new Var(mapFn(this.value));

    this.observe((value: T) => {
      mappedVar.update(() => mapFn(value));
    });

    return mappedVar;
  }

  combine<U>(other: Var<U>): Var<[T, U]> {
    const pair: [T, U] = [this.value, other.peek()];
    const combined = new Var(pair);

    this.observe((val) => {
      combined.update(([_, o]) => [val, o]);
    });

    other.observe((val) => {
      combined.update(([t, _]) => [t, val]);
    });

    return combined;
  }

  private notifyObservers(): void {
    for (const observer of this.observers) {
      observer(this.value);
    }
  }
}

export default {
  var<T>(init: T) {
    return new Var(init);
  },
};
