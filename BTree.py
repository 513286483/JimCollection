from typing import List
from bisect import bisect, insort
from functools import total_ordering


@total_ordering
class Node:
    def __init__(self, key, value):
        self.key = key
        self.value = value

    def __lt__(self, other):
        if isinstance(other, Node):
            return self.key < other.key
        else:
            return self.key < other

    def __eq__(self, other):
        if isinstance(other, Node):
            return self.key == other.key
        else:
            return self.key == other

    def __repr__(self):
        return str(self.key)


class BTreeNode:
    def __init__(self, is_leaf: bool):
        self.is_leaf = is_leaf
        self.nodes = []  # type: List[Node]
        if not is_leaf:
            self.children = []  # type: List[BTreeNode]

    def __repr__(self):
        return str(self.nodes)


class BTree:
    def __init__(self, min_degree: int):
        self.min_degree = min_degree
        self.root = BTreeNode(is_leaf=True)

    def insert(self, key, value):
        def split_child(parent: BTreeNode, child_index: int):
            child = parent.children[child_index]
            median_next_index = (len(child.nodes) - 1) // 2 + 1

            sibling = BTreeNode(is_leaf=child.is_leaf)
            sibling.nodes = child.nodes[median_next_index:]
            del child.nodes[median_next_index:]
            if not sibling.is_leaf:
                sibling.children = child.children[median_next_index:]
                del child.children[median_next_index:]

            parent.nodes.insert(child_index, child.nodes.pop())
            parent.children.insert(child_index + 1, sibling)

        insert_node = Node(key, value)
        cursor = self.root
        if len(cursor.nodes) == 2 * self.min_degree - 1:
            root = BTreeNode(is_leaf=False)
            root.children.append(self.root)
            split_child(root, 0)
            cursor = self.root = root

        while not cursor.is_leaf:
            child_index = bisect(cursor.nodes, insert_node)
            child = cursor.children[child_index]
            if len(child.nodes) == 2 * self.min_degree - 1:
                split_child(cursor, child_index)
                if cursor.nodes[child_index] < insert_node:
                    child = cursor.children[child_index + 1]
            cursor = child
        insort(cursor.nodes, insert_node)

    def search(self, key):
        def travel(init_node: BTreeNode):
            index = bisect(init_node.nodes, key)
            if init_node.nodes[index - 1] == key:
                return init_node.nodes[index - 1]
            elif not init_node.is_leaf:
                return travel(init_node.children[index])

        return travel(self.root)

    def delete(self, key):
        pass

    def __iter__(self):
        def travel(init_node: BTreeNode):
            if init_node.is_leaf:
                for node in init_node.nodes:
                    yield node
            else:
                for index, node in enumerate(init_node.nodes):
                    for sub_node in travel(init_node.children[index]):
                        yield sub_node
                    yield node
                for sub_node in travel(init_node.children[index + 1]):
                    yield sub_node

        return travel(self.root)


if __name__ == '__main__':
    def main():
        tree = BTree(min_degree=2)
        for i in range(1, 800):
            tree.insert(i, i)
        for i in tree:
            print(i)
            print(tree.search(i.key))


    main()
