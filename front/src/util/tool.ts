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
    /(http(s)?\:\/\/([A-Za-z\-\_\.]+)*(\/[A-Za-z\-\_\.]*)*)/g,
    ($$, $1) => {
      if ($1) {
        return `<a class="link-highlight" href="${$1}" target="_blank" title="${encodeURIComponent(
          $$
        )}">${$$}</a>`;
      }
      return $$;
    }
  );
// const convertUrlString = (str: string) =>
//   str.replace(
//     /\[(.+)\]\((http(s)?\:\/\/([A-Za-z\-\_\.]+)*(\/[A-Za-z\-\_\.]*)*)\)/g,
//     ($$, $1, $2) => {
//       if ($1 && $2) {
//         return `<a href="${$2}" target="_blank" title="${$1}">${$1}</a>`;
//       }
//       return $$;
//     }
//   );

const timerConvert = (time: number) => {
  const hours = Math.floor(time / 60 / 60) % 60;
  const minutes = Math.floor(time / 60) % 60;
  const seconds = time % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};

export { dev, convertUrlString, timerConvert };
