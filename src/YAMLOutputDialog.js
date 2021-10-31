import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';

/**
 * <YAMLOutputDialog onClose=<function> text=<text> open=<open>/>
 */
class YAMLOutputDialog extends React.Component {

    constructor(props) {
        super(props);
        console.dir(props);
    } // constructor

    _copy() {
        navigator.clipboard.writeText(this.props.text);
    }

    render() {
        return (
            <Dialog open={this.props.open} fullWidth>
                <DialogTitle>Workflow YAML</DialogTitle>
                <DialogContent>
                    <TextField
                        inputProps={{
                            style: { fontFamily: 'monospace', fontSize: "small" },
                            spellCheck: 'false'
                        }}
                        fullWidth
                        multiline

                        value={this.props.text}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={this._copy.bind(this)}
                        variant="contained"
                        color="primary">Copy</Button>
                    &nbsp;
                    <Button
                        onClick={this.props.onClose}
                        variant="contained"
                        color="primary">Close</Button>
                </DialogActions>
            </Dialog>
        );
    } // render
}

YAMLOutputDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
};

export default YAMLOutputDialog