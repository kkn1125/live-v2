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

export { dev };