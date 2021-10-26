function getStepName(wf) {
    if (!wf) {
        throw new Error("No wf parameter")
    }
    let propertyNames = Object.getOwnPropertyNames(wf);
    if (propertyNames > 1) {
        console.error("Too many properties!");
    }
    let stepName = propertyNames[0];
    return stepName;
}

function setStepName(wf, newName) {
    if (!wf) {
        throw new Error("No wf parameter")
    }
    if (!newName) {
        throw new Error("no newName")
    }
    const originalStepName = getStepName(wf);
    const content = getStepContent(wf);
    delete wf[originalStepName];
    wf[newName] = content;
}

function getStepContent(wf) {
    if (!wf) {
        throw new Error("No wf parameter")
    }
    const stepName = getStepName(wf);
    return wf[stepName];
}

function getStepType(wf) {
    if (!wf) {
        throw new Error("No wf parameter")
    }
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
    if (stepContent.hasOwnProperty("return")) {
        return "return";
    }
    console.error("Unknown step type!");
    return "UNKNOWN_STEP_TYPE";
}

function getConditions(wf) {
    if (!wf) {
        throw new Error("No wf parameter")
    }
    if (getStepType(wf) !== "switch") {
        console.error("Request to get conditions from non switch step");
        return null;
    }
    const content = getStepContent(wf);
    // We know that it will have a property called "switch" which is an array of {condition, next}
    return content.switch;
}

export default { getStepName, getStepContent, getStepType, getConditions, setStepName }