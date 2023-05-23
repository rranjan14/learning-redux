import GlobalStore from ".";
describe("GlobalStore", () => {
  let store: GlobalStore;

  beforeEach(() => {
    store = new GlobalStore({
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update the name in the state when dispatching "changeName" action', () => {
    store.dispatch("changeName", "Test");
    expect(store.state.name).toBe("Test");
  });

  it('should update the email in the state when dispatching "changeEmail" action', () => {
    store.dispatch("changeEmail", "test@test.com");
    expect(store.state.email).toBe("test@test.com");
  });

  it("should handle a function payload that resolves to a value and update the state when resolved", async () => {
    const payloadFn = () =>
      new Promise((resolve) => {
        setTimeout(() => resolve("Replit"), 100);
      });

    store.dispatch("changeName", payloadFn);

    // Verify that the state is not updated immediately
    expect(store.state.name).toBe("");

    const val = await payloadFn();
    expect(store.state.name).toBe(val);
  });

  it("should register all middlewares", () => {
    const middleware1 = (store: any) => {
      return (
        actionName: string,
        payload: any,
        next: (actionName: string, payload: any) => void
      ) => {
        console.log("Middleware 1");
        next(actionName, payload);
      };
    };

    const middleware2 = (store: any) => {
      return (
        actionName: string,
        payload: any,
        next: (actionName: string, payload: any) => void
      ) => {
        // Middleware 2 logic
        console.log("Middleware 2");
        next(actionName, payload);
      };
    };

    const middleware3 = (store: any) => {
      return (
        actionName: string,
        payload: any,
        next: (actionName: string, payload: any) => void
      ) => {
        // Middleware 3 logic
        console.log("Middleware 3");
        next(actionName, payload);
      };
    };

    store.addMiddleware(middleware1, middleware2, middleware3);

    expect(store.middlewareChain.length).toBe(3);
  });

  it("should dispatch action with middlewares included", () => {
    const middleware1 = (store: any) => {
      return (
        actionName: string,
        payload: any,
        next: (actionName: string, payload: any) => void
      ) => {
        console.log("Middleware 1");
        next(actionName, payload);
      };
    };

    const middleware2 = (store: any) => {
      return (
        actionName: string,
        payload: any,
        next: (actionName: string, payload: any) => void
      ) => {
        // Middleware 2 logic
        console.log("Middleware 2");
        next(actionName, payload);
      };
    };

    store.addMiddleware(middleware1, middleware2);
    console.log("store.middleware length ", store.middlewareChain.length);

    // Mock console.log to capture middleware logs
    console.log = jest.fn();

    console.log("calling dispatch now");
    store.dispatch("changeName", "Test1");

    expect(console.log).toHaveBeenCalledWith("Middleware 1");
    expect(console.log).toHaveBeenCalledWith("Middleware 2");
  });
});
