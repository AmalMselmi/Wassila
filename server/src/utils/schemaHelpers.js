// Used for prices stored as integer millimes.
export const integerValidator = {
  validator: Number.isInteger,
  message: '{PATH} must be a whole number',
};

export const toJSONOptions = {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    delete ret._id;
    return ret;
  },
};

const BLOCKED_QUERY_OPERATIONS = [
  'updateOne',
  'updateMany',
  'findOneAndUpdate',
  'findOneAndReplace',
  'replaceOne',
  'deleteOne',
  'deleteMany',
  'findOneAndDelete',
];

// Makes a collection append-only at the application level.
// Database-level protection (a user without update/delete rights) is added in Phase 7.
export function appendOnly(schema, label) {
  schema.pre(BLOCKED_QUERY_OPERATIONS, function blockMutation() {
    throw new Error(`${label} is append-only`);
  });
  schema.pre('save', function blockResave() {
    if (!this.isNew) {
      throw new Error(`${label} is append-only`);
    }
  });
}