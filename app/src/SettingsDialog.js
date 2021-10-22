import React from 'react';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import NameValueList from "./NameValueList.js"

/**
 * <SettingsDialog wf=<Object>/>
 * 
 * The wf should be a Workflow object.
 */
class SettingsDialog extends React.Component {

    constructor(props) {
        super(props);
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
   

    render() {

        return (
            <Dialog open={this.props.open} fullWidth>
                <DialogTitle>Step Settings</DialogTitle>
                <DialogContent>
                    <Settings wf={this.props.wf}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        this.props.onOk();
                    }} color="primary">OK</Button>
                    <Button onClick={() => {
                        this.props.onCancel();
                    }} color="primary">Cancel</Button>
                </DialogActions>
            </Dialog>
        );
}

export default SettingsDialog;