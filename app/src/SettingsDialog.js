import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Settings from "./Settings.js";
import PropTypes from 'prop-types';

/**
 * <SettingsDialog wf=<Object>/>
 * 
 * The wf should be a Workflow object.
 */
class SettingsDialog extends React.Component {

    constructor(props) {
        console.log("Settings Dialog created!");
        // open: boolean
        // onOk: func
        // onCancel: func
        // wf: object
        super(props);
        this.state = {wf: props.wf};
    }

    componentDidUpdate(prevProps) {
        if (prevProps.wf !== this.props.wf) {
            this.setState({wf: this.props.wf});
        }
    }

    render() {
        return (
            <Dialog open={this.props.open} fullWidth>
                <DialogTitle>Step Settings</DialogTitle>
                <DialogContent>
                    <Settings wf={this.props.wf} onChange={(wf) => {
                        this.setState({wf: wf});
                    }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        this.props.onOk(this.state.wf);
                    }} color="primary">OK</Button>
                    <Button onClick={() => {
                        this.props.onCancel(this.wf);
                    }} color="primary">Cancel</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

SettingsDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onOk: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    wf: PropTypes.object.isRequired
};

export default SettingsDialog;