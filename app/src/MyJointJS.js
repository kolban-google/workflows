import * as joint from 'jointjs';
import * as dagre from 'dagre';
import graphlib from 'graphlib';
import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Input from '@material-ui/core/Input';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import SettingsDialog from './SettingsDialog.js';
import YAMLInputDialog from './YAMLInputDialog.js';
import YAMLOutputDialog from './YAMLOutputDialog.js';
import clone from 'just-clone';
import yaml from 'js-yaml';
import WFUtils from './WFUtils'


// https://fontawesome.com/v4.7/icons/

const WFShape_BaseColor = "#daecf2"
const WFShape_InColor = "#4fa8d1"
const WFShape_OutColor = "#daf2dc"
const WFShape_CallIcon = '\uf0ac';
const WFShape_AssignIcon = '\uf061';
const WFShape_SwitchIcon = '\uf047';
const WFShape_Width = 100;
const WFShape_Height = 50;
const WFShape_RemoveDistance = -30;

const WFShapeMap = {
    "call": {
        "icon": WFShape_CallIcon
    },
    "assign": {
        "icon": WFShape_AssignIcon
    },
    "switch": {
        "icon": WFShape_SwitchIcon
    },
}

const portsDef = {
    groups: {
        'in': {
            position: "left",
            attrs: {
                circle: { fill: WFShape_InColor, stroke: 'black', 'stroke-width': 1, r: 8, magnet: true }
            }
        },
        'out': {
            position: "right",
            attrs: {
                circle: { fill: WFShape_OutColor, stroke: 'black', 'stroke-width': 1, r: 8, magnet: true }
            }
        },
        'out-condition': {
            position: "right",
            attrs: {
                circle: { fill: WFShape_OutColor, stroke: 'black', 'stroke-width': 1, r: 8, magnet: true },
                text: { fill: '#6a6c8a', fontSize: 14, }
            },
            label: {
                position: {
                    name: 'outsideOriented',
                    args: {
                        offset: 15,
                        attrs: {}
                    }
                }
            },
        }

    },
    items: []
};

const WFRect = joint.dia.Element.define('workflow.Rectangle', {
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
        },
        icon: {
            text: WFShape_CallIcon,
            fontFamily: 'FontAwesome',
            fontSize: 15,
            textWrap: {
                width: -10
            },
            refX: '5%',
            refY: '7%',
        }
    }
}, {
    markup: [{
        tagName: 'rect',
        selector: 'body',
    }, {
        tagName: 'text',
        selector: 'label'
    }, {
        tagName: 'text',
        selector: 'icon'
    }]
});

class MyJointJS extends React.Component {

    stepCount = 1;

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
            yamlInputShowDialog: false,
            yamlOutputShowDialog: false,
            systemShowMenu: false,
            yamlText: "",
            mouse: { x: 0, y: 0 },
            menuElement: null,
            anchorEl: null,
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
            //defaultLink: new joint.shapes.standard.Link(),
            defaultLink: function (cellView, magnet) {
                const link = new joint.shapes.standard.Link();
                /*
                var targetArrowheadTool = new joint.linkTools.TargetArrowhead();
                var toolsView = new joint.dia.ToolsView({
                    tools: [
                        targetArrowheadTool
                    ]
                });
                //var linkView = link.findView(paper);
                
                cellView.addTools(toolsView);
                */
                return link;
            },
            // Validate link connections.  When a link is being formed, we can examine the links and shut it down
            // if there is anything we don't like about it.
            validateConnection: function (cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
                if (cellViewS === cellViewT) return false; // Don't allow a link to start and end at the same element.
                if (magnetT === undefined || magnetT.getAttribute('port-group') !== 'in') return false;  // If there is no target or the target is not an "in" port group, cancel it
                if (!magnetS.getAttribute('port-group').startsWith('out')) return false
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
        this.graph.on('all', function(eventName, cell) {
            console.log(arguments);
        });
        */
        /*
                this.graph.on('change:source change:target', function (link) {
                    console.log(`sourceId: ${link.get('source').id}, targetId: ${link.get('target').id} `)
                    if (link.get('source').id && link.get('target').id) {
                        // both ends of the link are connected.
                        //let lv = this.paper.findViewByModel(link);
                        //let linkView = link.findView(this.paper);
                        //linkView.removeTools();
                    }
                })
                */
/*
        this.graph.on('add', function (cell) {
            if (cell instanceof joint.dia.Link) {
                var targetArrowheadTool = new joint.linkTools.TargetArrowhead();
                var toolsView = new joint.dia.ToolsView({
                  tools: [
                    targetArrowheadTool
                  ]
                });
                const linkView = cell.findView(this.paper);
                if (linkView == null) return; 
                linkView.addTools(toolsView);
            }
        });
        */

        this.paper.on('link:pointerup', function(linkView) {
            if (linkView.hasTools()) return;
            linkView.addTools(new joint.dia.ToolsView({ tools: [new joint.linkTools.Remove({distance: WFShape_RemoveDistance})]}));
          });
          this.paper.on('link:mouseenter', function(linkView) {
            linkView.showTools();
        });
        
        this.paper.on('link:mouseleave', function(linkView) {
            linkView.hideTools();
        });
    } // componentDidMount

    _add() {
        let stepName = `Step${this.stepCount}`
        this.stepCount++

        let rect = new WFRect({
            ports: portsDef
        });
        rect.position(100, 30);
        rect.resize(WFShape_Width, WFShape_Height);
        rect.attr({
            body: {
                fill: WFShape_BaseColor
            },
            label: {
                text: stepName,
                fill: 'black'
            },

        });
        rect.addPort({ group: 'in' });
        rect.addPort({ group: 'out' });
        rect.addTo(this.graph);
        rect.set('wf', {
            [stepName]: {
                'call': "None" + new Date().toISOString()
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

        /*
         * Add a handled for the settings menu on a double click.
         */
        this.paper.findViewByModel(rect).on('element:pointerdblclick', (e) => {
            this.setState({
                settingsShowDialog: true,
                menuElement: rect,
                wf: clone(rect.get('wf'))
            });
        });
        return rect;
    } // _add

    _menuClose() {
        this.setState({ contextShowMenu: false });
    } // _menuClose

    _deleteElement() {
        this.state.menuElement.remove(); // Delete the JointJS element that is the current menu selection from the graph.
        this._menuClose();
    } // _deleteElement

    _setElementFromWF(jjsElement, wf) {
        let type = WFUtils.getStepType(wf);
        let originalWf = jjsElement.get('wf'); // Save the original WF value
        jjsElement.set('wf', wf);
        jjsElement.attr('icon/text', WFShapeMap[type].icon);
        let stepName = WFUtils.getStepName(wf);
        jjsElement.attr('label/text', stepName);

        // We need to check that the output port types are correct for the given WF type.
        // * Other than "switch" - A single output port of type "out"
        // * "switch" - As many output ports of type "out-condition" as there are conditions in the switch
        let originalType = WFUtils.getStepType(originalWf);
        if (type === "switch" && originalType !== "switch") {
            // Delete all "out" ports and add condition ports
            const outPorts = jjsElement.getGroupPorts("out");
            jjsElement.removePorts(outPorts);
            const conditions = WFUtils.getConditions(wf);
            conditions.forEach((condition) => {
                jjsElement.addPort({ id: condition.condition, group: 'out-condition', attrs: { text: { text: condition.condition } } });
            });
            jjsElement.resize(WFShape_Width, WFShape_Height + 10 * conditions.length);
        } else if (type !== "switch" && originalType === "switch") {
            // Delete all ports and add one normal output port
            const outPorts = jjsElement.getGroupPorts("out-condition");
            jjsElement.removePorts(outPorts);
            jjsElement.addPort({ group: 'out' });
            jjsElement.resize(WFShape_Width, WFShape_Height);
        } else if (type === "switch" && originalType === "switch") {
            // We need to check and see if new ports have been added or old ports removed
            const newConditions = WFUtils.getConditions(wf);
            const oldConditions = WFUtils.getConditions(originalWf);
            let dirty = false;
            if (oldConditions.length !== newConditions.length) {
                dirty = true;
            } else {
                for (let i = 0; i < oldConditions.length; i++) {
                    if (oldConditions[i].condition !== newConditions[i].condition) {
                        dirty = true;
                        break;
                    }
                }
            }
            if (dirty) {
                const outPorts = jjsElement.getGroupPorts("out-condition");
                jjsElement.removePorts(outPorts);
                newConditions.forEach((condition) => {
                    jjsElement.addPort({ id: condition.condition, group: 'out-condition', attrs: { text: { text: condition.condition } } });
                });
                jjsElement.resize(WFShape_Width, WFShape_Height + 10 * newConditions.length);
            }
        }
    }

    /**
     * Called when the settings OK button has been clicked.
     * @param {*} wf 
     */
    _settingsOk(wf) {
        this.setState({ settingsShowDialog: false });
        this._setElementFromWF(this.state.menuElement, wf)
        this._menuClose();
    } // _settingsOk

    _settingsCancel(wf) {
        this.setState({ settingsShowDialog: false });
        this._menuClose();
    } // _settingsCancel

    _dumpElement() {
        console.dir(this.state.menuElement.get('wf'));
    } // _dumpElement


    _deleteAll() {
        // Delete all elements
        const allCells = this.graph.getCells();
        this.graph.removeCells(allCells);
    }

    /**
     * Given a YAML Object as input, create the correct graph.
     * @param {*} yamlObj 
     */
    _parseWF(yamlObj) {
        const addLink = (source, target) => {
            const link = new joint.shapes.standard.Link();
            link.source(source);
            link.target(target);
            link.addTo(this.graph);
            const linkView = link.findView(this.paper);
            linkView.addTools(new joint.dia.ToolsView({ tools: [new joint.linkTools.Remove({distance: WFShape_RemoveDistance})]}));
            linkView.hideTools();
        };
        this._deleteAll();
        // We create an element for each step in the YAML.
        yamlObj.forEach((wp) => {
            let element = this._add();
            this._setElementFromWF(element, wp);
        });
        // Now all the elements are in place, we can start wiring them up!
        yamlObj.forEach((wp) => {
            const stepName = WFUtils.getStepName(wp);
            const content = WFUtils.getStepContent(wp);
            const stepType = WFUtils.getStepType(wp);

            if (stepType !== 'switch') {
                const targetStepName = content.next;
                console.log(`Create link from ${stepName} to ${targetStepName}`)
                if (targetStepName && targetStepName !== 'end') {
                    const sourceElement = this._getElementFromStepName(stepName);
                    const targetElement = this._getElementFromStepName(targetStepName);
                    const sourcePort = sourceElement.getGroupPorts("out")[0];
                    const targetPort = targetElement.getGroupPorts("in")[0];
                    addLink({ id: sourceElement.id, port: sourcePort.id }, { id: targetElement.id, port: targetPort.id });
                    /*
                    const link = new joint.shapes.standard.Link();
                    link.source({ id: sourceElement.id, port: sourcePort.id });
                    link.target({ id: targetElement.id, port: targetPort.id });
                    link.addTo(this.graph);
                    const linkView = link.findView(this.paper);
                    linkView.addTools(new joint.dia.ToolsView({ tools: [new joint.linkTools.Remove({distance: WFShape_RemoveDistance})]}));
                    linkView.hideTools();
                    */
                }
            } // End Not switch
            else {
                /*
                This is a switch
                - Step3:
                    switch:
                    - condition: ew
                      next: Step5
                    - condition: re
                      next: Step6
                    - condition: fdf
                
                    The switch algorithm is more interesting.  What we need to do is grab the switch entry which
                    is an array of {condition, next} and use each of the "nexts" as the target
            */
                const conditions = content.switch;
                const sourceElement = this._getElementFromStepName(stepName);
                //console.dir(sourceElement.getGroupPorts("out-condition"));
                conditions.forEach((condition) => {
                    const targetStepName = condition.next;
                    if (targetStepName) {
                        const sourcePortId = condition.condition;
                        const targetElement = this._getElementFromStepName(targetStepName);
                        const targetPort = targetElement.getGroupPorts("in")[0];
                        //console.log(`Forming switch link from port "${portId}" to ${targetStepName}`);
                        addLink({ id: sourceElement.id, port: sourcePortId }, { id: targetElement.id, port: targetPort.id });
                        /*
                        const link = new joint.shapes.standard.Link();
                        link.source({ id: sourceElement.id, port: sourcePortId });
                        link.target({ id: targetElement.id, port: targetPort.id });
                        link.addTo(this.graph);
                        const linkView = link.findView(this.paper);
                        linkView.addTools(new joint.dia.ToolsView({ tools: [new joint.linkTools.Remove({distance: WFShape_RemoveDistance})]}));
                        linkView.hideTools();
                        */
                    }
                });
            } // End ... this is a switch
        });
        this._layout();
    }

    _getElementFromStepName(stepName) {
        const foundElement = this.graph.getElements().find((element) => {
            const wf = element.get('wf');
            if (!wf) {
                return false;
            }
            if (WFUtils.getStepName(wf) === stepName) {
                return true;
            }
            return false;
        });
        return foundElement;
    }

    /**
     * Build the final Workflow JSON for the solution
     */
    _buildWF() {
        // Iterate over each of the WF shapes
        const elements = this.graph.getElements();
        const completeWF = [];
        elements.forEach((element) => {
            const wf = clone(element.get('wf'));

            const stepType = WFUtils.getStepType(wf);
            if (stepType !== "switch") {
                // Now we need to see what it links to!
                const neighbors = this.graph.getNeighbors(element, {
                    outbound: true
                })
                console.assert(neighbors.length < 2);
                if (neighbors.length === 1) {
                    const nextWF = neighbors[0].get('wf');
                    const nextStepName = WFUtils.getStepName(nextWF);
                    WFUtils.getStepContent(wf).next = nextStepName;
                } else {
                    WFUtils.getStepContent(wf).next = "end";
                }
            } else {
                // It IS a switch!!!  We now need to get all the conditions in the WF and see if they are linked!
                const conditions = WFUtils.getConditions(wf);
                const connectedLinks = this.graph.getConnectedLinks(element, { outbound: true });
                conditions.forEach((condition) => {
                    // Condition is an object that contains {condition, next}
                    const conditionLink = connectedLinks.find((link) => {
                        if (link.source().port === condition.condition) {
                            return true;
                        }
                        return false;
                    });
                    if (conditionLink) {
                        const targetElement = conditionLink.getTargetElement();
                        const targetWF = targetElement.get('wf');
                        condition.next = WFUtils.getStepName(targetWF);
                    }
                });
            }
            completeWF.push(wf);
        });
        const y = yaml.dump(completeWF);
        console.log(y)
        this.setState({ yamlText: y, yamlOutputShowDialog: true })
    } // _buildWF


    /**
     * Layout the graph.
     */
    _layout() {
        joint.layout.DirectedGraph.layout(this.graph, {
            dagre,
            graphlib,
            nodeSep: 50,
            edgeSep: 80,
            rankDir: "LR",
            marginX: 50,
            marginY: 50
        });
        console.log("Laid out!");
    } // _layout

    render() {
        return (<div>


            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={(event) => {
                        this.setState({ systemShowMenu: true, anchorEl: event.target })
                    }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" >
                        Google Cloud Workflows
                    </Typography>
                </Toolbar>
            </AppBar>
            <div ref={el => this.el = el}></div>
            <Box m={1}>
                <Button color="primary" variant="contained" onClick={() => {
                    this.setState({ openLoad: true });
                }}>Load</Button>
                &nbsp;
                <Button color="primary" variant="contained" onClick={() => {
                    this.setState({ openSave: true, saveText: JSON.stringify(this.graph.toJSON(), null, 2) });
                    console.log(JSON.stringify(this.graph.toJSON(), null, 2));
                }}>Save</Button>
                &nbsp;
                <Button color="primary" variant="contained" onClick={() => { this._add() }}>Add</Button>
                &nbsp;
                <Button color="primary" variant="contained" onClick={this._buildWF.bind(this)}>Build</Button>
                &nbsp;
                <Button color="primary" variant="contained" onClick={this._layout.bind(this)}>Layout</Button>
                &nbsp;
                <Button color="primary" variant="contained" onClick={
                    () => {
                        this.setState({ yamlInputShowDialog: true })
                    }
                }>YAML Input</Button>
            </Box>


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
                keepMounted
                anchorReference='anchorPosition'
                open={this.state.contextShowMenu}
                anchorPosition={{
                    top: this.state.mouse.y - 10, left: this.state.mouse.x - 10 // Subtract some from the x,y values so that the menu is not at the very edge.
                }}
                MenuListProps={{ onMouseLeave: () => this._menuClose() }}
            >
                <MenuItem onClick={() => {
                    this.setState({ settingsShowDialog: true });
                }}>
                    Settings
                </MenuItem>
                <MenuItem onClick={() => this._deleteElement()}>Delete</MenuItem>
                <MenuItem onClick={this._dumpElement.bind(this)}>Dump</MenuItem>
            </Menu>

            {/* SETTINGS */}
            <SettingsDialog open={this.state.settingsShowDialog}
                wf={this.state.wf}
                onOk={this._settingsOk.bind(this)}
                onCancel={this._settingsCancel.bind(this)}
            />
            <YAMLInputDialog open={this.state.yamlInputShowDialog}
                onOk={
                    (allYaml) => {
                        this.setState({ yamlInputShowDialog: false });
                        this._parseWF(allYaml);
                    }
                }
                onCancel={
                    () => {
                        this.setState({ yamlInputShowDialog: false });
                    }
                }
            />
            <YAMLOutputDialog open={this.state.yamlOutputShowDialog}
                onClose={() => { this.setState({ yamlOutputShowDialog: false }) }}
                text={this.state.yamlText}
            />

            <Menu
                id="menu-appbar"
                anchorEl={this.state.anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                MenuListProps={{ onMouseLeave: () => this.setState({ systemShowMenu: false }) }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={this.state.systemShowMenu}
                onClose={() => {
                    this.setState({ systemShowMenu: false });
                }}
            >
                <MenuItem >About...</MenuItem>
            </Menu>

        </div>);
    } // render
}

/*

*/
export default MyJointJS;