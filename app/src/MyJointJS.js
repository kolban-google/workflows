import React from 'react';
import * as joint from 'jointjs';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Input from '@material-ui/core/Input';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import NameValueList from "./NameValueList.js"
import Settings from "./Settings.js"

const portsDef = {
    groups: {
        'in': {
            position: "left",
            attrs: {
                circle: { fill: 'green', stroke: 'black', 'stroke-width': 2, r: 8, magnet: true }
            }
        },
        'out': {
            position: "right",
            attrs: {
                circle: { fill: 'red', stroke: 'black', 'stroke-width': 2, r: 8, magnet: true }
            }
        }

    },
    items: []
};

class MyJointJS extends React.Component {

    constructor(props) {
        super(props);
        this.graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
        this.state = {
            openLoad: false,
            openSave: false,
            saveText: "",
            loadText: "",
            settingsShowDialog: false,
            contextShowMenu: false,
            mouseX: 0,
            mouseY: 0,
            menuElement: null,
            stepName: "",
            type: "call",
            result: "",
            items: [
                { name: 'First Item', value: "v1" },
                { name: 'Second Item', value: "v2" },
                { name: 'Third Item', value: "v13" }
            ]
        }
    }

    componentDidMount() {
        console.log("Mounted!");

        this.paper = new joint.dia.Paper({
            el: this.el,
            model: this.graph,
            width: 900,
            height: 600,
            gridSize: 1,
            background: {
                color: '#f0f0f0'
            },
            linkPinning: false,
            validateConnection: function (cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
                console.log("validateConnection");
                if (cellViewS === cellViewT) return false;
                if (magnetT && magnetT.getAttribute('port-group') !== 'in') return false;
                console.log(cellViewS.model.get('type'));
                return true;
            },
            interactive: function (cellView) {
                if (cellView.model.get('locked')) {
                    return {
                        elementMove: false
                    };
                }

                // otherwise
                return true;
            }
        });
        let rect = new joint.shapes.standard.Rectangle();
        rect.position(100, 30);
        rect.resize(100, 40);
        rect.attr({
            body: {
                fill: 'blue'
            },
            label: {
                text: 'Hello',
                fill: 'white'
            }
        });
        rect.addTo(this.graph);
    }

    _add() {
        let rect = new joint.shapes.standard.Rectangle({
            ports: portsDef
        });
        rect.position(100, 30);
        rect.resize(100, 40);
        rect.attr({
            body: {
                fill: 'green'
            },
            label: {
                text: 'Hello',
                fill: 'white'
            }
        });
        rect.addPort({ group: 'out' });
        rect.addPort({ group: 'in' });
        rect.addTo(this.graph);
        rect.set("wf-stepName", "stepName1");
        rect.set("wf", {
            "StepX": {
                "call": "None"
            }
        });

        /**
         * Add a handler for the context menu.
         */
        this.paper.findViewByModel(rect).on('element:contextmenu', (a, b, c, d, e) => {
            this.setState({
                contextShowMenu: true,
                mouseX: event.clientX,
                mouseY: event.clientY,
                menuElement: rect,
                stepName: rect.get("wf-stepName")
            });
        });
    }

    _menuClose() {
        this.setState({ contextShowMenu: false });
    }

    _deleteElement() {
        this.state.menuElement.remove();
        this._menuClose();
    }

    _settingsClose() {
        this.state.menuElement.set("wf-stepName", this.state.stepName);
        this.state.menuElement.attr("label/text", this.state.stepName);
        this.setState({ settingsShowDialog: false });
        this._menuClose();
    }

    _settingsTypeChange(event) {
        this.type = event.target.value
    }

    _dumpElement() {
        console.dir(this.state.menuElement.get('wf'));
    }

    render() {
        let wf = {
            "step1": {
                "call": "myFunc",
                args: {
                    "a1": "v1",
                    "a2": "v2"
                },
                result: "resultVar"
            }
        }
        return (<div>
            <div ref={el => this.el = el}></div>
            <Button variant="contained" onClick={() => {
                this.setState({ openLoad: true });
            }}>Load</Button>
            <Button variant="contained" onClick={() => {

                this.setState({ openSave: true, saveText: JSON.stringify(this.graph.toJSON(), null, 2) });
                console.log(JSON.stringify(this.graph.toJSON(), null, 2));
            }}>Save</Button>
            <Button variant="contained" onClick={() => { this._add() }}>Add</Button>

            {/* LOAD */}
            <Dialog open={this.state.openLoad} fullWidth>
                <p>Load</p>
                <input type='file' onChange={(event) => {
                    let file = event.target.files[0];
                    const reader = new FileReader();
                    reader.addEventListener('load', (event) => {
                        debugger;
                    });
                    reader.readAsText(file);
                    //debugger;
                }}></input>
                <Input type='text' value={this.state.loadText} multiline rows='12' onChange={(event) => {
                    this.setState({ loadText: event.target.value });
                }}></Input>
                <Button onClick={() => {
                    this.graph.fromJSON(JSON.parse(this.state.loadText));
                }}>Set JSON</Button>
                <Button onClick={() => {
                    this.setState({ openLoad: false });
                }}>Close</Button>
            </Dialog>

            {/* SAVE */}
            <Dialog open={this.state.openSave} fullWidth>
                <p>Save</p>
                <Input type='text' value={this.state.saveText} multiline rows='12' readOnly></Input>
                <Button onClick={() => {
                    this.setState({ openSave: false });
                }}>Close</Button>
            </Dialog>
            <Menu
                id="simple-menu"
                keepMounted
                anchorReference='anchorPosition'
                open={this.state.contextShowMenu}
                anchorPosition={
                    this.state.mouseY !== null && this.state.mouseX !== null
                        ? { top: this.state.mouseY, left: this.state.mouseX }
                        : undefined
                }
                MenuListProps={{ onMouseLeave: () => this._menuClose() }}
            >
                <MenuItem onClick={() => this.setState({ settingsShowDialog: true })}>Settings</MenuItem>
                <MenuItem onClick={() => this._deleteElement()}>Delete</MenuItem>
                <MenuItem onClick={this._dumpElement.bind(this)}>Dump</MenuItem>
            </Menu>

            {/* SETTINGS */}
            <Dialog open={this.state.settingsShowDialog} fullWidth>
                <DialogTitle>Step Settings</DialogTitle>
                <DialogContent>
                    <Settings wf={this.state.menuElement?this.state.menuElement.get("wf"):null}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        this._settingsClose()
                    }} color="primary">OK</Button>
                    <Button onClick={() => {
                        this._settingsClose()
                    }} color="primary">Close</Button>
                </DialogActions>
            </Dialog>
            <Settings wf={wf}></Settings>
        </div>);
    }
}

export default MyJointJS;