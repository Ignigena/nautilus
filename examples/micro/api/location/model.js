module.exports = {
  schema: {
    address: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    description: String,
    sponsored: Boolean
  }
}
