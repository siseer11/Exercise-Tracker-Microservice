//Checks for a date, to be valid
module.exports = date => {
  function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
  }
  return isValidDate(new Date(date));
};
