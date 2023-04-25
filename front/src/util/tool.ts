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

const convertUrlString = (str: string) =>
  str.replace(
    /\[(.+)\]\((http(s)?\:\/\/([A-Za-z\-\_\.]+)*(\/[A-Za-z\-\_\.]*)*)\)/g,
    ($$, $1, $2) => {
      if ($1 && $2) {
        return `<a href="${$2}" target="_blank" title="${$1}">${$1}</a>`;
      }
      return $$;
    }
  );

export { dev, convertUrlString };
