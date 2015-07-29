"use strict";

export default class TreeNode {

    constructor(val) {
        this.val      = val;
        this.parent   = null;
        this.children = [];
    }

    get [Symbol.toStringTag]() {
        return 'TreeNode';
    }

    add(val) {
        let node = (val instanceof TreeNode)
            ? val
            : new TreeNode(val);
        node.parent = this;
        this.children.push(node);
        return this;
    }

    isLeaf() {
        return this.children.length === 0;
    }

    isRoot() {
        return this.parent === null;
    }
}
