import { getCslpMetaPaths } from "./getCslpMetaPaths";

export function resolveCslpMeta({
  source,
  args: _args,
  context: _context,
  info,
  contentTypeMap,
  typePrefix
}) {
  const entryUid = source.uid;
  const contentTypeNodeType = source.internal.type
  const queryContentTypeUid = contentTypeNodeType.replace(`${typePrefix}_`, "")

  const fieldNode = info.fieldNodes.find((node) => node.name?.value === "cslp__meta");
  const fieldNodeValue = "cslp__meta";
  const fieldNodeLocation = { start: fieldNode.name?.loc?.start, end: fieldNode.name?.loc?.end }

  // We have all the query selections (`info.operation.selectionSet.selections`) 
  // each time we resolve cslp__meta.
  // So, get the correct Selection from query for the current cslp__meta
  const queryContentTypeSelection = findQuerySelection(
    info.operation.selectionSet,
    fieldNodeValue,
    fieldNodeLocation
  )

  if (typeof queryContentTypeSelection === "undefined") {
    return {
      error: {
        message: "failed to find query selection for cslp__meta"
      }
    }
  }

  const fragments = info?.fragments ?? {};
  const contentType = contentTypeMap[queryContentTypeUid];
  // for the content type selection, get the reference and json RTE paths
  const metaPaths = getCslpMetaPaths(
    queryContentTypeSelection,
    "",
    contentType,
    fragments,
    contentTypeMap,
    typePrefix
  )
  const result = {
    entryUid,
    contentTypeUid: contentType.uid,
    ...metaPaths,
  }
  return result;
}

function findQuerySelection(selectionSet, value, location, depth = 0) {
  // cslp__meta can only be one level deep (or two level deep, see all* case below) 
  // e.g.
  // query {
  //   page {
  //     cslp__meta
  //   }
  //   allBlog {
  //     nodes {
  //       cslp__meta
  //     }
  //   }
  // }
  if (depth > 1 || !selectionSet || !selectionSet.selections) {
    return;
  }
  for (const selection of selectionSet.selections) {
    if (
      selection.name?.value === value &&
      selection.loc?.start === location.start &&
      selection.loc?.end === location.end
    ) {
      return selectionSet
    }
    // "nodes" in all* queries will lead to cslp__meta at depth 2
    if (selection.name?.value === "nodes") {
      const nestedSelectionSet = findQuerySelection(selection.selectionSet, value, location, depth);
      if (nestedSelectionSet) {
        return nestedSelectionSet;
      }
    }
    // search one level deeper for the correct node in this selection
    const nestedSelectionSet = findQuerySelection(selection.selectionSet, value, location, depth + 1)
    // return when not undefined, meaning the correct selection has been found
    if (nestedSelectionSet) {
      return nestedSelectionSet;
    }
  }
}