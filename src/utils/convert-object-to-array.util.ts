export const convertObjectToArray = (values: object) => {
  return Object.keys(values).map(key => values[key]);
};
