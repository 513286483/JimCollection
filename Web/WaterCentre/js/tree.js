var Tree = {
    create: (from, to) => {
        return {
            from: Math.floor(from),
            to: Math.floor(to)
        }
    },

    getLeft: (node) => {
        if (node.left) {
            return node.left
        } else {
            return node.left = Tree.create(node.from, Math.floor((node.from + node.to) / 2));
        }
    },

    getRight: (node) => {
        if (node.right) {
            return node.right
        } else {
            return node.right = Tree.create(Math.floor((node.from + node.to) / 2) + 1, node.to);
        }
    },

    insert: (node, from, to, value) => {
        from = Math.floor(from);
        to = Math.floor(to);

        if (node.from === from && node.to === to) {
            if (node.values) {
                return node.values.push(value);
            } else {
                return node.values = [value];
            }
        }

        var mid = Math.floor((node.from + node.to) / 2);
        if (from < mid) {
            Tree.insert(Tree.getLeft(node), from, Math.min(to, mid), value);
        }
        if (to > mid) {
            Tree.insert(Tree.getRight(node), Math.max(from, mid + 1), to, value);
        }
    },

    search: (node, from, to, outPipe) => {
        from = Math.floor(from);
        to = Math.floor(to);

        if (node.from === from && node.to === to) {
            return include(node, outPipe);
        }
        if (node.values && node.values.length) {
            outPipe(node.values);
        }

        var mid = Math.floor((node.from + node.to) / 2);
        if (from < mid) {
            Tree.search(Tree.getLeft(node), from, Math.min(to, mid), outPipe);
        }
        if (to > mid) {
            Tree.search(Tree.getRight(node), Math.max(from, mid + 1), to, outPipe);
        }

        function include(node, outPipe) {
            if (node.values && node.values.length) {
                outPipe(node.values);
            }
            if (node.left) {
                include(node.left, outPipe)
            }
            if (node.right) {
                include(node.right, outPipe)
            }
        }
    }
};