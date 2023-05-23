interface IGlobalStore {
  registerReducer(
    reducer: (state: any, actionName: string, payload: any) => void
  ): void;

  dispatch(actionName: string, payload: any): void;

  subscribe<T>(
    selector: (state: T) => T,
    subscribeFn: (newData: T, oldData: T) => void
  ): () => void;

  addMiddleware(
    ...middlewares: ((
      store: any
    ) => (actionName: any, payload: any, next: () => void) => void)[]
  ): void;
}

// ---------------- Your Code -----------------------

export default class GlobalStore implements IGlobalStore {
  state: any;
  middlewareChain: ((
    actionName: string,
    payload: any,
    nextMiddleware: () => void
  ) => void)[];
  reducerFunction: (state: any, actionName: string, payload: any) => void;
  subscriberArray: {
    selector: (store: any) => string;
    callback: (newData: string, oldData: string) => void;
  }[];

  constructor(initialState: any) {
    this.state = initialState;
    this.middlewareChain = [];
    this.subscriberArray = [];

    this.dispatch = this.dispatch.bind(this);
  }

  registerReducer(
    reducer: (state: any, actionName: string, payload: any) => void
  ): void {
    this.reducerFunction = reducer;
  }

  dispatch(actionName: string, payload: any): void {
    const handlePayload = (resolvedPayload: any): void => {
      const next = (index: number): void => {
        if (index >= this.middlewareChain.length) {
          this.reducerFunction(this.state, actionName, resolvedPayload);
          return;
        }

        const middleware = this.middlewareChain[index];

        middleware(actionName, resolvedPayload, () => next(index + 1));
      };

      next(0); // Start calling the middleware chain
    };

    if (typeof payload === "function") {
      payload().then((resolvedValue: any) => {
        handlePayload(resolvedValue);
      });
      return;
    } else {
      handlePayload(payload);
    }
    const oldState = { ...this.state };
    this.reducerFunction(this.state, actionName, payload);
    const newState = { ...this.state };

    this.subscriberArray.forEach(({ selector, callback }) => {
      const newValue = selector(newState);
      const oldValue = selector(oldState);
      if (newValue !== oldValue) {
        callback(newValue, oldValue);
      }
    });
  }

  subscribe(
    selector: (store: any) => any,
    subscribeFn: (newData: any, oldData: any) => void
  ): () => void {
    const subscription = { selector: selector, callback: subscribeFn };
    this.subscriberArray.push(subscription);

    return () => {
      const index = this.subscriberArray.indexOf(subscription);
      if (index !== -1) {
        this.subscriberArray.splice(index, 1);
      }
    };
  }

  addMiddleware(
    ...middlewares: ((
      store: any
    ) => (
      actionName: string,
      payload: any,
      next: (actionName: string, payload: any) => void
    ) => void)[]
  ): void {
    middlewares.forEach((middleware) => {
      this.middlewareChain.push(middleware(this));
    });
  }
}

const store = new GlobalStore({
  name: "",
  email: "",
});

store.registerReducer((state, action, payload) => {
  switch (action) {
    case "changeName":
      state.name = payload;
      break;
    case "changeEmail":
      state.email = payload;
      break;
    default:
      break;
  }
});
