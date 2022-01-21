export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

type Handler<Payload, ReturnType> = (
  payload: Payload
) => ReturnType | Promise<ReturnType>;

export const twoWayEventEmitter = <Payload, ReturnType = void>() => {
  const fns: Handler<Payload, ReturnType>[] = [];

  const unsubscribe = (fn: Handler<Payload, ReturnType>) => {
    fns.filter((fn2) => fn2 !== fn);
  };

  const subscribe = (fn: Handler<Payload, ReturnType>) => {
    fns.push(fn);
    return () => unsubscribe(fn);
  };

  const emit = async (payload: Payload) => {
    return await Promise.all(fns.map((fn) => fn(payload)));
  };

  return { subscribe, unsubscribe, emit };
};
