from bisect import bisect, insort
from functools import total_ordering
from typing import List


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
        def travel(init_node: BTreeNode, key):
            key_index = bisect(init_node.nodes, key) - 1

            if key_index >= 0 and init_node.nodes[key_index] == key:
                if init_node.is_leaf:
                    del init_node.nodes[key_index]

                else:
                    left_child = init_node.children[key_index]
                    right_child = init_node.children[key_index + 1]

                    if len(left_child.nodes) >= self.min_degree:
                        last_node = left_child.nodes[-1]
                        init_node.nodes[key_index] = last_node
                        travel(left_child, last_node.key)

                    elif len(right_child.nodes) >= self.min_degree:
                        first_node = right_child.nodes[0]
                        init_node.nodes[key_index] = first_node
                        travel(right_child, first_node.key)

                    else:
                        del_node = init_node.nodes[key_index]
                        del init_node.nodes[key_index]
                        del init_node.children[key_index + 1]

                        left_child.nodes.append(del_node)
                        left_child.nodes.extend(right_child.nodes)
                        if not left_child.is_leaf:
                            left_child.children.extend(right_child.children)
                        travel(left_child, del_node.key)

            elif not init_node.is_leaf:
                left_sibling, cursor, right_sibling = (init_node.children[key_index + i]
                                                       if 0 <= key_index + i < len(init_node.children)
                                                       else False for i in range(3))

                if len(cursor.nodes) < self.min_degree:
                    if left_sibling and len(left_sibling.nodes) >= self.min_degree:
                        cursor.nodes.insert(0, init_node.nodes[key_index])
                        if not cursor.is_leaf:
                            cursor.children.insert(0, left_sibling.children.pop())
                        init_node.nodes[key_index] = left_sibling.nodes.pop()

                    elif right_sibling and len(right_sibling.nodes) >= self.min_degree:
                        cursor.nodes.append(init_node.nodes[key_index + 1])
                        if not cursor.is_leaf:
                            cursor.children.append(right_sibling.children.pop(0))
                        init_node.nodes[key_index + 1] = right_sibling.nodes.pop(0)

                    else:
                        if left_sibling:
                            del_node = init_node.nodes[key_index]
                            del init_node.nodes[key_index]
                            del init_node.children[key_index + 1]

                            left_sibling.nodes.append(del_node)
                            left_sibling.nodes.extend(cursor.nodes)
                            if not left_sibling.is_leaf:
                                left_sibling.children.extend(cursor.children)
                            cursor = left_sibling

                        else:
                            del_node = init_node.nodes[key_index + 1]
                            del init_node.nodes[key_index + 1]
                            del init_node.children[key_index + 2]

                            cursor.nodes.append(del_node)
                            cursor.nodes.extend(right_sibling.nodes)
                            right_sibling.nodes = cursor.nodes
                            if not right_sibling.is_leaf:
                                cursor.children.extend(right_sibling.children)
                                right_sibling.children = cursor.children
                            cursor = right_sibling

                        if init_node is self.root and len(self.root.nodes) == 0:
                            self.root = cursor
                travel(cursor, key)

        travel(self.root, key)

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

        for i in range(1, 800):
            print('del {}'.format(i))
            tree.delete(i)
            for j in tree:
                assert j

        for i in tree:
            print(i)
            print(tree.search(i.key))


    main()
