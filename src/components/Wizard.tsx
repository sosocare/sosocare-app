import React, { useState } from 'react';
import { Form, Formik } from "formik";
import { Text, View, Button } from 'react-native';

export const Wizard = ({ children, initialValues, onSubmit, validationSchema }) => {
    const [stepNumber, setStepNumber] = useState(0);
    const steps = React.Children.toArray(children);
    const [snapshot, setSnapshot] = useState(initialValues);

    const Step = steps[stepNumber];
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
            validationSchema={validationSchema}
        >
            {({ errors, handleBlur, touched, handleChange, handleSubmit, values })  => (
                <Form>
                    <Text>
                        Step {stepNumber + 1} of {totalSteps}
                    </Text>
                    <Step errors={errors} handleBlur={handleBlur} handleChange={handleChange} />
                    <View style={{ display: "flex" }}>
                        {stepNumber > 0 && (
                            <Button 
                                disabled={formik.isSubmitting}
                                onPress={() => previous(formik.values)}
                                title="Back"
                            />
                        )}
                        <View>
                            <Button
                                disabled={formik.isSubmitting}
                                onPress={() => handleSubmit}
                                title={isLastStep ? "Submit" : "Next"}
                            />

                        </View>
                    </View>
                </Form>
            )}
        </Formik>
    );
};

export const WizardStep = ({ children, errors, handleBlur, touched, handleChange, }) => children;