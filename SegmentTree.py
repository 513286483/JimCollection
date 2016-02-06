from typing import List


class Node:
    def __init__(self, num_from=None, num_to=None):
        self.num_from = num_from
        self.num_to = num_to
        if num_from != num_to:
            self.left = self.right = None
        self.values = []

    def get_left(self):
        if self.left:
            return self.left
        else:
            left_num_to = (self.num_from + self.num_to) // 2
            left = Node(self.num_from, left_num_to)
            self.left = left
            return left

    def get_right(self):
        if self.right:
            return self.right
        else:
            right_from = (self.num_from + self.num_to) // 2 + 1
            right = Node(right_from, self.num_to)
            self.right = right
            return right

    def __repr__(self):
        return '[{},{}]{}'.format(self.num_from, self.num_to, self.values)


def build(num_from: int, num_to: int):
    init_node = Node(num_from, num_to)
    return init_node


def insert(node: Node, num_from: int, num_to: int, value, value_range: int):
    if node.num_from <= num_from and num_to <= node.num_to and node.num_to - node.num_from < value_range:
        node.values.append(value)
    if node.num_from == num_from and node.num_to == num_to:
        return

    mid = (node.num_from + node.num_to) // 2
    if num_from <= mid:
        insert(node.get_left(), num_from, mid, value, value_range)
    if num_to > mid:
        insert(node.get_right(), mid + 1, num_to, value, value_range)


def search(node: Node, num_from: int, num_to: int, output: List):
    if node.num_from == num_from and node.num_to == num_to:
        return output.extend(node.values)

    mid = (node.num_from + node.num_to) // 2
    if num_from <= mid:
        search(node.get_left(), num_from, mid, output)
    if num_to > mid:
        search(node.get_right(), mid + 1, num_to, output)


if __name__ == '__main__':
    def main():
        value_range = 5
        node = build(0, 10)
        insert(node, 3, 6, 1, value_range)
        insert(node, 3, 9, 2, value_range)
        insert(node, 3, 10, 3, value_range)
        insert(node, 1, 6, 4, value_range)
        insert(node, 0, 6, 5, value_range)
        output = []
        search(node, 3, 8, output)
        print(output)
        input()


    main()
