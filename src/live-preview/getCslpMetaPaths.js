export function getCslpMetaPaths(
  selectionSet,
  path = "",
  schema,
  fragments,
  contentTypeMap,
  typePrefix
) {
  const paths = {
    referencePaths: [],
    jsonRtePaths: [],
  }
  const refPaths = paths.referencePaths;
  const rtePaths = paths.jsonRtePaths;
  if (schema.data_type === "reference" && path) {
    refPaths.push(path)
  }
  if (schema.data_type === "json" && schema.field_metadata?.allow_json_rte) {
    rtePaths.push(path)
  }
  if (!selectionSet || !selectionSet.selections) {
    return paths;
  }
  for (const selection of selectionSet.selections) {
    // exit when selection.kind is not Field, SelectionSet or InlineFragment
    // selection.name is not present for selection.kind is "InlineFragment"
    if (selection?.name?.value === "cslp__meta") {
      continue;
    }
    if (
      selection.selectionSet ||
      selection.kind === "Field" ||
      selection.kind === "InlineFragment" ||
      selection.kind === "FragmentSpread"
    ) {

      const fragmentName = selection.name?.value;
      const fragmentDefinition = fragments[fragmentName];
      const inlineFragmentNodeType = selection.typeCondition?.name?.value;

      // Fragment
      // note - when a fragment is used inside a reference field, the reference field
      // path gets added twice, this can maybe avoided by re-structuring the code, 
      // but a Set works fine
      if (selection.kind === "FragmentSpread" && fragmentDefinition) {
        const fragmentSpreadPaths = getCslpMetaPaths(
          fragmentDefinition.selectionSet,
          path,
          schema,
          fragments,
          contentTypeMap,
          typePrefix
        );
        combineCslpMetaPaths(fragmentSpreadPaths, paths)
      }
      // InlineFragment (ref_multiple)
      else if (selection.kind === "InlineFragment" && inlineFragmentNodeType) {
        const contentTypeUid = inlineFragmentNodeType.replace(`${typePrefix}_`, "");
        if (!contentTypeUid || !(contentTypeUid in contentTypeMap)) {
          return paths;
        }
        const contentTypeSchema = contentTypeMap[contentTypeUid];
        const inlineFragmentPaths = getCslpMetaPaths(
          selection.selectionSet,
          path,
          contentTypeSchema,
          fragments,
          contentTypeMap,
          typePrefix
        );
        combineCslpMetaPaths(inlineFragmentPaths, paths)
      }
      // SelectionSet (all fields that can have nested properties)
      else {
        let nestedFields = schema?.blocks ?? schema.schema;
        // cannot traverse inside file or link schema
        if (schema.data_type === "file" || schema.data_type === "link") {
          return paths;
        }
        // when a reference, change nested fields to schema of referenced CT
        if (schema.data_type === "reference" && schema.reference_to) {
          nestedFields = contentTypeMap[schema.reference_to[0]].schema
        }
        const nestedFieldSchema = nestedFields.find((item) => item.uid === selection.name.value);
        if (nestedFieldSchema) {
          let nextPath = [];
          if (path) {
            nextPath = path.split(".");
          }
          nextPath.push(selection.name.value);
          const metaPaths = getCslpMetaPaths(
            selection.selectionSet,
            nextPath.join("."),
            nestedFieldSchema,
            fragments,
            contentTypeMap,
            typePrefix
          );
          combineCslpMetaPaths(metaPaths, paths);
        }
      }
    }
  }
  return {
    referencePaths: Array.from(new Set(paths.referencePaths)),
    jsonRtePaths: Array.from(new Set(paths.jsonRtePaths))
  };
}

/**
 * @typedef {{referencePaths: string[], jsonRtePaths: string[]}} paths
 * @param {paths} source 
 * @param {paths} target 
 * @returns merges the path fields from the source into the target's path fields
 */
function combineCslpMetaPaths(source, target) {
  target.referencePaths.push(...source.referencePaths);
  target.jsonRtePaths.push(...source.jsonRtePaths);
  return target;
}
