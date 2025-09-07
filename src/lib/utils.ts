import { TreeItem } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a record of files to a tree structure
 * @param files - Record of files paths to convert
 * @returns Tree structure for TreeView component
 *
 * @example
 * Input: {"src/Button.tsx": "...", "README.md": "..."}
 * Output: [["src", "Button.tsx"], ["README.md"]]
 */

interface TreeNode {
  [key: string]: TreeNode | null;
}

export function convertFilesToTreeItems(
  files: Record<string, string>
): TreeItem[] {
  // build the tree structure
  const tree: TreeNode = {};

  // sort files to ensure consistent order
  const sortedPaths = Object.keys(files).sort();

  for (const filePath of sortedPaths) {
    const parts = filePath.split("/");
    let currentNode: TreeNode = tree;

    // Navigate/create the tree structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!currentNode[part]) {
        currentNode[part] = {};
      }
      currentNode = currentNode[part] as TreeNode;
    }

    const fileName = parts[parts.length - 1];
    currentNode[fileName] = null;
  }

  // Convert the tree structure to a flat array of TreeItems
  function convertNode(node: TreeNode, name?: string): TreeItem[] | TreeItem {
    const entries = Object.entries(node);

    if (entries.length === 0) {
      return name || "";
    }

    const children: TreeItem[] = [];

    for (const [key, value] of entries) {
      if (value === null) {
        // this is a leaf node (file)
        children.push(key);
      } else {
        // this is a parent node (folder)
        const subTree = convertNode(value, key);
        if (Array.isArray(subTree)) {
          children.push([key, ...subTree]);
        } else {
          children.push([key, subTree]);
        }
      }
    }

    return children;
  }

  const result = convertNode(tree);
  return Array.isArray(result) ? result : [result];
}
