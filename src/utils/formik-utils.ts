import { FormikContextType } from 'formik'

export const isInValid = (formikContext: FormikContextType<any>) =>
  Object.keys(formikContext.errors).some(
    (errorField) => formikContext.touched[errorField]
  )

export const AreInValid = (
  fields: readonly string[],
  formikContext: FormikContextType<any>
) => fields.some((field) => formikContext.errors[field])

export const touchFields = (
  fields: readonly string[],
  formikContext: FormikContextType<any>
) => fields.forEach((field) => formikContext.setFieldTouched(field))

export const proceedIfValid = (
  fields: readonly string[],
  context: FormikContextType<any>,
  onValid: () => void
) => {
  touchFields(fields, context)
  if (!AreInValid(fields, context)) {
    onValid()
  }
}
