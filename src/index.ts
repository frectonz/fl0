type Observer<T> = (value: T) => void;
type MapFn<T, U> = (value: T) => U;
type UpdateFn<T> = (value: T) => T;

class Var<T> {
  private value: T;
  private observers: Observable<T>[];

  constructor(init: T) {
    this.value = init;
    this.observers = [];
  }

  peek(): T {
    return this.value;
  }

  set(value: T) {
    this.value = value;
    this.notifyObservers();
  }

  update(updateFn: UpdateFn<T>): void {
    this.set(updateFn(this.peek()));
  }

  get(): Observable<T> {
    const observable = new Observable(this.value, () =>
      this.observers.splice(this.observers.length - 1, 1),
    );
    this.observers.push(observable);
    return observable;
  }

  private notifyObservers(): void {
    for (const dependant of this.observers) {
      dependant.push(this.value);
    }
  }
}

class Observable<T> {
  private value: T;
  private observers: Observer<T>[] = [];
  private detacher: () => void;

  constructor(init: T, detacher: () => void) {
    this.value = init;
    this.detacher = detacher;
  }

  push(value: T) {
    this.value = value;
    this.notifyObservers();
  }

  private notifyObservers(): void {
    for (const observer of this.observers) {
      try {
        observer(this.value);
      } catch {}
    }
  }

  observe(observer: Observer<T>): void {
    this.observers.push(observer);
    try {
      observer(this.value);
    } catch {}
  }

  map<U>(mapFn: MapFn<T, U>): Observable<U> {
    const mappedVar = new Observable(mapFn(this.value), () => this.detach());

    this.observe((value: T) => {
      mappedVar.push(mapFn(value));
    });

    return mappedVar;
  }

  combine<U>(other: Observable<U>): Observable<[T, U]> {
    const pair: [T, U] = [this.value, other.value];
    const combined = new Observable(pair, () => {
      this.detach();
      other.detach();
    });

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

  detach() {
    this.detacher();
  }
}

export default {
  var<T>(init: T) {
    return new Var(init);
  },
  combine<T, U>(first: Var<T>, second: Var<U>) {
    return first.get().combine(second.get());
  },
};
