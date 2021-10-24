import * as joint from 'jointjs';

function deleteLinkByPortID(graph, element, portId) {

    const links = graph.getConnectedLinks(element, { outbound: true });
    links.forEach((link) => {
        if (link.source().portId === portId) {
            link.remove();
        }
    });
}

function reLabelPort(element, portId, label) {
    const x = element.getPorts();

    element.portProp(portId, "attrs/text/text", label)
    const port = element.getPort(portId);
}

export default {reLabelPort, deleteLinkByPortID};