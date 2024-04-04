import * as yup from 'yup'
// Based on https://github.com/jquense/yup/issues/851#issuecomment-931295671
export function yupSequentialStringSchema(
  schemas: yup.StringSchema[],
  resetForm?: () => void
) {
  return yup.string().test(async function (value, context) {
    resetForm && resetForm()
    try {
      for (const schema of schemas) {
        // eslint-disable-next-line no-await-in-loop
        await schema.validate(value)
      }
    } catch (error: unknown) {
      const message = (error as yup.ValidationError).message
      return context.createError({ message })
    }

    return true
  })
}
