import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import NameValueList from "./NameValueList.js"
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';


/**
 * <Settings wf=<Object>/>
 * 
 * The wf should be a Workflow object.
 */
class Settings extends React.Component {

    /**
     * 
     * @param {*} props 
     * 
     * wf: object
     */
    constructor(props) {
        super(props);
        if (props.wf) {
            this.state = this.parseWF(props.wf);
            delete this.parseFailed;
        } else {
            console.error("!Expected a wf object in Settings");
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
            let result = step.result ? step.result : "";
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

    _settingsChanged() {
        this.props.onChange(this.toWF());
    }

    render() {
        if (this.parseFailed) {
            return <div>PARSE FAILED</div>
        }
        return (
            <div>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <TextField label='Step Name' value={this.state.stepName}
                            onChange={
                                (e) => {
                                    this.setState({ stepName: e.target.value }, this._settingsChanged)
                                }
                            }
                        ></TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="type" value={this.state.type} select onChange={
                            (e) => {
                                this._typeChange(e.target.value)
                            }
                        }>
                            <MenuItem value={"call"}>Call</MenuItem>
                            <MenuItem value={"assign"}>Assign</MenuItem>
                            <MenuItem value={"switch"}>Switch</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
                {this.state.type === "call" ?
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField value={this.state.functionName} label="Function Name" fullWidth
                                onChange={(e) => {
                                    this.setState({ functionName: e.target.value }, this._settingsChanged);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField value={this.state.result} label="Result" fullWidth
                                onChange={(e) => {
                                    this.setState({ result: e.target.value }, this._settingsChanged);
                                }} />
                        </Grid>
                        <Grid item xs={12}>
                            <NameValueList items={this.state.items} />
                        </Grid>
                    </Grid> : null}
                {this.state.type === "assign" ?
                    <div>Hi!! assign
                        <NameValueList items={this.state.items} />
                    </div> : null}

            </div>);
    }
}

Settings.propTypes = {
    wf: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
};

export default Settings;