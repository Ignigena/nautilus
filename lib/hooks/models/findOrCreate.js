module.exports = function findOrCreatePlugin(schema, options) {
  /**
  * Simple findOrCreate plugin for Mongoose.
  * This can produce unexpected side-effects on a production application which
  * is scaled horizontally, particularly around concurrency since this involves
  * two separate MongoDB transactions. Pay close attention to the criteria you
  * use particularly when targeting collections with a `unique` index as
  * non-matches immediately call `create`. Your application is responsible for
  * handling all errors that are thrown if `create` fails.
  * @see https://docs.mongodb.com/manual/core/write-operations-atomicity/#concurrency-control
  * @param {Object} criteria - The criteria used when `findOne` is called. This
  * is also merged with the `doc` parameter to create the document if a match
  * is not found.
  * @param {Object} doc - The fields to use when creating the document.
  * @return {Object}
  */
  schema.statics.findOrCreate = async function findOrCreate(criteria, doc) {
    let result = await this.findOne(criteria);
    if (result) return result;

    try {
      return await this.create({ ...criteria, ...doc });
    } catch (err) {
      // Basic error prevention for concurrency when `unique` index is present.
      // It's possible in certain situations that a matching document gets
      // created after `findOne` returns empty. In this case, Mongo will throw a
      // duplicate key error. We check one last time for a document based on the
      // criteria and return this if found. Otherwise we pass along the error
      // for the host application to handle.
      if (err && err.code === 11000) {
        let result = await this.findOne(criteria);
        if (result) return result;
      }
      throw err;
    }
  };
};
