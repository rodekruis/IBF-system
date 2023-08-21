export const DEBOUNCE_TIME_LOADER = 500;
const DEBUG = {};

console.log = (string, val) => {
  if (string === 'mapComponent newLayer') {
    if (val && val.name === 'flood_extent') {
      console.info(string, val); // 23 times
    }
  }
  // check for duplicates
  // AggregatesComponent leadTime
  // mapComponent adminLevel
  // mapComponent leadTime

  // console.info('b', string, DEBUG[string]);
  DEBUG[string] = DEBUG[string] ? DEBUG[string] + 1 : 1;
  // console.info('a', string, DEBUG[string]);
  // console.log(DEBUG);
};

console.error = () => {
  console.info(DEBUG);
};
