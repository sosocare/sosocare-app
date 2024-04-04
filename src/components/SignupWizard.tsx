import React, { useState } from 'react';
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";

const Wizard = ({ children, initialValues, onSubmit }) => {
    const [stepNumber, setStepNumber] = useState(0);
    const steps = React.Children.toArray(children);
    const [snapshot, setSnapshot] = useState(initialValues);

    const step = steps[stepNumber];
    const totalSteps = steps.length;
    const isLastStep = stepNumber === totalSteps - 1;

    const next = values => {
        setSnapshot(values);
        setStepNumber(Math.min(stepNumber + 1, totalSteps - 1));
    };

    const previous = values => {
        setSnapshot(values);
        setStepNumber(Math.max(stepNumber - 1, 0));
    };

    const handleSubmit = async (values, formikBag) => {
        if (isLastStep) {
            return onSubmit(values, formikBag);
        } else {
            next(values);
        }
    };

    return (
        <Formik
            initialValues={snapshot}
            onSubmit={handleSubmit}
            validationSchema={step.props.validationSchema}
        >
            {formik => (
                <Form>
                    <p>
                        Step {stepNumber + 1} of {totalSteps}
                    </p>
                    {step}
                    <div style={{ display: "flex" }}>
                        {stepNumber > 0 && (
                            <button onClick={() => previous(formik.values)} type="button">
                                Back
                            </button>
                        )}
                        <div>
                            <button disabled={formik.isSubmitting} type="submit">
                                {isLastStep ? "Submit" : "Next"}
                            </button>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

const WizardStep = ({ children }) => children;

const Demo = () => {
    const submitform = (values) => {
        alert('First name:' + values.firstName + ' Last name:' + values.lastName + ' Mobile:' + values.mobile + ' Email:' + values.email);
    };

    return (
        <>
            <Wizard
                initialValues={{
                    email: "",
                    firstName: "",
                    lastName: "",
                    mobile: ''
                }}
                onSubmit={values => submitform(values)}

            >
                <WizardStep
                    validationSchema={Yup.object({
                        firstName: Yup.string().required("required"),
                        lastName: Yup.string().required("required")
                    })}
                >
                    <div>
                        <label htmlFor="firstName">First Name</label>
                        <Field
                            autoComplete="given-name"
                            component="input"
                            id="firstName"
                            name="firstName"
                            placeholder="First Name"
                            type="text"
                        />
                        <ErrorMessage className="error" component="div" name="firstName" />
                    </div>
                    <div>
                        <label htmlFor="lastName">Last Name</label>
                        <Field
                            autoComplete="family-name"
                            component="input"
                            id="lastName"
                            name="lastName"
                            placeholder="Last Name"
                            type="text"
                        />
                        <ErrorMessage className="error" component="div" name="lastName" />
                    </div>
                </WizardStep>
                <WizardStep
                    validationSchema={Yup.object({
                        mobile: Yup.number('Invalid mobile').min(10, "Invalid mobile").required("required")
                    })}
                >
                    <div>
                        <label htmlFor="mobile">Mobile</label>
                        <Field
                            autoComplete="mobile"
                            component="input"
                            id="mobile"
                            name="mobile"
                            placeholder="Mobile"
                            type="text"
                        />
                        <ErrorMessage className="error" component="div" name="mobile" />
                    </div>
                </WizardStep>
                <WizardStep
                    validationSchema={Yup.object({
                        email: Yup.string()
                            .email("Invalid email address")
                            .required("required")
                    })}
                >
                    <div>
                        <label htmlFor="email">Email</label>
                        <Field
                            autoComplete="email"
                            component="input"
                            id="email"
                            name="email"
                            placeholder="Email"
                            type="text"
                        />
                        <ErrorMessage className="error" component="div" name="email" />
                    </div>
                </WizardStep>
            </Wizard>
        </>
    );
};