function getStepName(wf) {
    let propertyNames = Object.getOwnPropertyNames(wf);
    if (propertyNames > 1) {
        console.error("Too many properties!");
    }
    let stepName = propertyNames[0];
    return stepName;
}

function getStepContent(wf) {
    const stepName = getStepName(wf);
    return wf[stepName];
}

function getStepType(wf) {
    const stepContent = getStepContent(wf);
    if (stepContent.hasOwnProperty("call")) {
        return "call";
    }
    if (stepContent.hasOwnProperty("assign")) {
        return "assign";
    }
    if (stepContent.hasOwnProperty("switch")) {
        return "switch";
    }
    console.error("Unknown step type!");
    return "UNKNOWN_STEP_TYPE";
}

function getConditions(wf) {
    if (getStepType(wf) !== "switch") {
        console.error("Request to get conditions from non switch step");
        return null;
    }
    const content = getStepContent(wf);
    // We know that it will have a property called "switch" which is an array of {condition, next}
    return content.switch;
}

export default { getStepName, getStepContent, getStepType, getConditions }