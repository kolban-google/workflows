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


/**
 * Count the number of outgoing links that start at id/port
 * @param {*} graph 
 * @param {*} id 
 * @param {*} port 
 * @returns 
 */
function countOutgoingLinks(graph, id, port) {
    console.assert(graph != null);
    let count = 0;
    const links = graph.getLinks();
    links.forEach((currentLink) => {
        const source = currentLink.source();
        if (source.id === id && source.port === port) {
            count++;
        }
    });
    return count;
} // countOutgoingLinks

export default {reLabelPort, deleteLinkByPortID, countOutgoingLinks};