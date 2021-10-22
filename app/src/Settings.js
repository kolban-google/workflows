import React from 'react';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import NameValueList from "./NameValueList.js"

/**
 * <Settings wf=<Object>/>
 * 
 * The wf should be a Workflow object.
 */
class Settings extends React.Component {

    constructor(props) {
        super(props);
        /*
        this.state = {
            stepName: "",
            type: "call",
            result: "",
            items: [
                { name: 'First Item', value: "v1" },
                { name: 'Second Item', value: "v2" },
                { name: 'Third Item', value: "v13" }
            ]
        }
        */
        if (props.wf) {
            this.state = this.parseWF(props.wf);
            delete this.parseFailed;
        } else {
            console.error("!Expected  a wf object in Settings");
            this.parseFailed = true;
        }
    }

    _typeChange(newType) {
        // A new type means to clear all existing items.
        this.setState({ type: newType, items: [] })
    }

    /**
     * Parse a WF object and return the core information.
     * @param {*} wf 
     * @returns 
     * 
     * Call
     * {
  <stepName>: {
    "call": <functionName>,
    "args": {
      <arg1>: <value1>,
      ...
    },
    "result": <varName>
  }
}
     */
    parseWF(wf) {
        let propertyNames = Object.getOwnPropertyNames(wf);
        if (propertyNames > 1) {
            console.error("Too many properties!");
        }
        let stepName = propertyNames[0];
        let step = wf[stepName];
        if (step.hasOwnProperty("call")) {
            // It is a call
            let functionName = step.call;
            let result = step.result;
            let type = "call";
            let items = [];
            if (step.args) {
                Object.getOwnPropertyNames(step.args).forEach((propertyName) => {
                    items.push({
                        name: propertyName,
                        value: step.args[propertyName]
                    })
                });
            }
            return {
                stepName,
                functionName,
                result,
                type,
                items
            };
        }
        return {};
    }

    /**
     * Retunr a WF object from the core information.
     * @returns 
     */
    toWF() {
        let step = {};
        let wf = {}
        wf[this.state.stepName] = step;
        //
        // Call
        //
        if (this.state.type === "call") {
            step["call"] = this.state.functionName;
            step["result"] = this.state.result;
            let args = {};
            step["args"] = args;
            this.state.items.forEach((item) => {
                args[item.name] = item.value;
            });
        }
        return wf;
    }

    render() {
        if (this.parseFailed) {
            return <div>PARSE FAILED</div>
        }
        return (
            <div>
                <Input type='text' value={this.state.stepName}
                    onChange={
                        (e) => {
                            this.setState({ stepName: e.target.value })
                        }
                    }
                ></Input>
                <InputLabel id="type-select-label">Type</InputLabel>
                <Select labelId="type-select-label" value={this.state.type} onChange={
                    (e) => {
                        this._typeChange(e.target.value)
                    }
                }>
                    <MenuItem value={"call"}>Call</MenuItem>
                    <MenuItem value={"assign"}>Assign</MenuItem>
                    <MenuItem value={"switch"}>Switch</MenuItem>
                </Select>
                {this.state.type === "call" ?
                    <div>
                        <TextField value={this.state.functionName} />
                        <TextField value={this.state.result}
                            onChange={() => { }} />
                        <NameValueList items={this.state.items} />
                    </div> : null}
                {this.state.type === "assign" ?
                    <div>Hi!! assign
                        <NameValueList items={this.state.items} />
                    </div> : null}

            </div>);
    }
}

export default Settings;