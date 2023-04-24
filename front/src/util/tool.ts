const dev = function (this: Console) {
  let prefix = "";
  return Object.assign(
    Object.fromEntries(
      Object.entries(console).map(([k, v]) =>
        k === "memory"
          ? [k, v]
          : [
              k,
              (...args: any[]) => {
                v.call(this, prefix, ...args);
                prefix = "";
              },
            ]
      )
    ),
    { alias: (_prefix: string) => (prefix = _prefix) }
  );
}.call(console);

const convert = (obj: any) =>
  Object.assign(
    { ...obj },
    { data: JSON.parse(obj.data), result: JSON.parse(obj.result) }
  );

export { dev, convert };
