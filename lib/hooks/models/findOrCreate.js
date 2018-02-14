module.exports = function findOrCreatePlugin(schema, options) {
  schema.statics.findOrCreate = async function findOrCreate(criteria, doc) {
    let result = await this.findOne(criteria);
    if (result) return result;

    return await this.create({ ...criteria, ...doc });
  };
}
