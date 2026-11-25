// Shared JSON transform: expose `id` (string) alongside `_id`, drop __v / password.
export const jsonTransform = {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id?.toString()
    delete ret.password
    return ret
  },
}
