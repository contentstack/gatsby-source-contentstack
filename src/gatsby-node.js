const {
  normalizeEntry,
  processContentType,
  processEntry,
} = require('./normalize')

const fetchData = require('./fetch')

exports.sourceNodes = async ({ actions, createNodeId }, configOptions) => {
  const { createNode } = actions

  const { contentstackData } = await fetchData(configOptions)

  // loop over all content types
  for (const contentType of contentstackData.contentTypes) {
    // loop over all entries in that content type
    for (const entry of contentstackData.entries[contentType.uid]) {
      const normalizedEntry = await normalizeEntry(
        contentType,
        entry,
        contentstackData.entries,
        createNodeId
      )
      // Process the contentTypes data to match the structure of a Gatsby node
      const entryNode = processEntry(contentType, normalizedEntry, createNodeId)
      // Use Gatsby's createNode helper to create a node from the node data
      createNode(entryNode)
    }

    // Process the contentTypes data to match the structure of a Gatsby node
    const contentTypeNode = processContentType(contentType, createNodeId)
    // Use Gatsby's createNode helper to create a node from the node data
    createNode(contentTypeNode)
  }

  return
}
