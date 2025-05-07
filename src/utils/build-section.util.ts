export const buildSelections = (columns: string[], hiddenColumns: string[]) => {
  const selections = {};
  columns.forEach(column => {
    selections[column] = true;
  });
  hiddenColumns.forEach(column => {
    selections[column] = false;
  });
  return selections;
};
