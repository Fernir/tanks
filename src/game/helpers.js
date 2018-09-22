export const rand = (m, mi = 0) => (Math.random() * (m - mi)) + mi;
export const deg = Math.PI / 180;
export const int = (v, m = 0) => v >> m;
const previous = [];

export const computeFPS = () => {
  if (previous.length > 60) {
    previous.splice(0, 1);
  }
  const start = (new Date()).getTime();

  previous.push(start);

  let sum = 0;

  for (let id = 0; id < previous.length - 1; id++) {
    sum += previous[id + 1] - previous[id];
  }

  return int(1000.0 / (sum / previous.length));
};
