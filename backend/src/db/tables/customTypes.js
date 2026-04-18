const { customType } = require('drizzle-orm/pg-core');

const bytea = customType({
  dataType() {
    return 'bytea';
  },
  toDriver(value) {
    return value;
  },
  fromDriver(value) {
    return value;
  },
});

const byteaArray = customType({
  dataType() {
    return 'bytea[]';
  },
  toDriver(value) {
    return value;
  },
  fromDriver(value) {
    return value;
  },
});

module.exports = { bytea, byteaArray };
