const {
        normalizeFields, 
        normalizeEntry, 
        processContentType, 
        processEntry
    } = require("./normalize");

const fetchData = require("./fetch");

exports.sourceNodes = async ({ boundActionCreators, createNodeId },configOptions) => {
    const { createNode } = boundActionCreators;

    const { contentstackData } = await fetchData(configOptions);

    
    contentstackData.contentTypes.forEach(contentType => {
        const entries = contentstackData.entries[contentType.uid];

        entries.forEach(entry => {
            const normalizedEntry = normalizeEntry(contentType, entry, contentstackData.entries, createNodeId);
            // Process the contentTypes data to match the structure of a Gatsby node
            const entryNode = processEntry(contentType, normalizedEntry, createNodeId);
            // Use Gatsby's createNode helper to create a node from the node data
            createNode(entryNode);
        });

        // Process the contentTypes data to match the structure of a Gatsby node
        const contentTypeNode = processContentType(contentType, createNodeId);
        // Use Gatsby's createNode helper to create a node from the node data
        createNode(contentTypeNode);
    });

    return 

};
