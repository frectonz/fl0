type Observer<T> = (value: T) => void;
type MapFn<T, U> = (value: T) => U;
type UpdateFn<T> = (value: T) => T;

class Var<T> {
  private value: T;
  private dependents: Observable<T>[];

  constructor(init: T) {
    this.value = init;
    this.dependents = [];
  }

  peek(): T {
    return this.value;
  }

  set(value: T) {
    this.value = value;
    this.notifyDependats();
  }

  update(updateFn: UpdateFn<T>): void {
    this.set(updateFn(this.peek()));
  }

  get(): Observable<T> {
    const observable = new Observable(this.value);
    this.dependents.push(observable);
    return observable;
  }

  private notifyDependats(): void {
    for (const dependant of this.dependents) {
      dependant.push(this.value);
    }
  }
}

class Observable<T> {
  private value: T;
  private observers: Observer<T>[] = [];

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  push(value: T) {
    this.value = value;
    this.notifyObservers();
  }

  private notifyObservers(): void {
    for (const observer of this.observers) {
      observer(this.value);
    }
  }

  observe(observer: Observer<T>): void {
    this.observers.push(observer);
    observer(this.value);
  }

  map<U>(mapFn: MapFn<T, U>): Observable<U> {
    const mappedVar = new Observable(mapFn(this.value));

    this.observe((value: T) => {
      mappedVar.push(mapFn(value));
    });

    return mappedVar;
  }

  combine<U>(other: Observable<U>): Observable<[T, U]> {
    const pair: [T, U] = [this.value, other.value];
    const combined = new Observable(pair);

    this.observe((val) => {
      const pair: [T, U] = [val, combined.value[1]];
      combined.push(pair);
    });

    other.observe((val) => {
      const pair: [T, U] = [combined.value[0], val];
      combined.push(pair);
    });

    return combined;
  }
}

export default {
  var<T>(init: T) {
    return new Var(init);
  },
};
