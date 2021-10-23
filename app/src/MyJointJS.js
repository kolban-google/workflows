import React from 'react';
import * as joint from 'jointjs';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Input from '@material-ui/core/Input';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import SettingsDialog from './SettingsDialog.js';
import clone from 'just-clone';


const WFShape_BaseColor = "#daecf2";

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

const WFRect = joint.dia.Element.define('standard.Rectangle', {
    attrs: {
        body: {
            refWidth: '100%',
            refHeight: '100%',
            strokeWidth: 2,
            stroke: '#000000',
            fill: '#FFFFFF'
        },
        label: {
            textVerticalAnchor: 'middle',
            textAnchor: 'middle',
            refX: '50%',
            refY: '50%',
            fontSize: 14,
            fill: '#333333'
        }
    }
}, {
    markup: [{
        tagName: 'rect',
        selector: 'body',
    }, {
        tagName: 'text',
        selector: 'label'
    }]
});

class MyJointJS extends React.Component {

    constructor(props) {
        super(props);
        this.graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
        this.state = {
            openLoad: false,
            openSave: false,
            saveText: "",
            loadText: "",
            settingsShowDialog: false, // Set to true to show the settings dialog.
            contextShowMenu: false, // Set to true to show the context menu.
            mouse: { x: 0, y: 0 },
            menuElement: null,
            wf: {}
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
        /*
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
        */
    }

    _add() {
        let stepName = "StepX";
        /*
        let rect = new joint.shapes.standard.Rectangle({
            ports: portsDef
        });
        */
        let rect = new WFRect({
            ports: portsDef
        });
        rect.position(100, 30);
        rect.resize(100, 40);
        rect.attr({
            body: {
                fill: WFShape_BaseColor
            },
            label: {
                text: stepName,
                fill: 'black'
            }
        });
        rect.addPort({ group: 'out' });
        rect.addPort({ group: 'in' });
        rect.addTo(this.graph);
        rect.set("wf", {
            [stepName]: {
                "call": "None" + new Date().toISOString()
            }
        });

        /**
         * Add a handler for the context menu.
         */
        this.paper.findViewByModel(rect).on('element:contextmenu', (e) => {
            this.setState({
                contextShowMenu: true,
                mouse: { x: e.clientX, y: e.clientY },
                menuElement: rect,
                wf: clone(rect.get('wf'))
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

    _settingsOk(wf) {
        let jjsElement = this.state.menuElement;
        jjsElement.set("wf", wf);
        let propertyNames = Object.getOwnPropertyNames(wf);
        if (propertyNames > 1) {
            console.error("Too many properties!");
        }
        let stepName = propertyNames[0];
        this.setState({ settingsShowDialog: false });
        jjsElement.attr("label/text", stepName);
        this._menuClose();
    }

    _settingsCancel(wf) {
        this.setState({ settingsShowDialog: false });
        this._menuClose();
    }

    _dumpElement() {
        console.dir(this.state.menuElement.get('wf'));
    }

    render() {
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
                anchorPosition={{
                    top: this.state.mouse.y,
                    left: this.state.mouse.x
                }}
                MenuListProps={{ onMouseLeave: () => this._menuClose() }}
            >
                <MenuItem onClick={() => {
                    this.setState({ settingsShowDialog: true });
                }}>Settings</MenuItem>
                <MenuItem onClick={() => this._deleteElement()}>Delete</MenuItem>
                <MenuItem onClick={this._dumpElement.bind(this)}>Dump</MenuItem>
            </Menu>

            {/* SETTINGS */}
            <SettingsDialog open={this.state.settingsShowDialog}
                wf={this.state.wf}
                onOk={this._settingsOk.bind(this)}
                onCancel={this._settingsCancel.bind(this)}
            />
        </div>);
    }
}

export default MyJointJS;