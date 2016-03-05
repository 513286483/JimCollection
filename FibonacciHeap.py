from functools import lru_cache, total_ordering
from math import inf
from typing import List


@lru_cache()
def heap_size(degree):
    if degree == 0:
        return 1
    elif degree == 1:
        return 2
    else:
        return 2 * heap_size(degree - 1)


def degree_test():
    for i in range(10):
        size = heap_size(i)
        total = sum(heap_size(i) for i in reversed(range(i + 1)))
        print('Degree: {}; Size: {}; Total: {}'.format(i, size, total))


# -------------------------------------
@total_ordering
class FibNode:
    key = inf

    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.is_child_deleted = False

        self.parent = FibNode
        self.children = []  # type: List[FibNode]

    def __lt__(self, other: 'FibNode'):
        return self.key < other.key

    def __eq__(self, other: 'FibNode'):
        return self.key == other.key

    def __repr__(self):
        return str(self.key)


class FibHeap:
    def __init__(self):
        self.min_node = FibNode
        self.children = []  # type: List[FibNode]

    def union(self, other: 'FibHeap'):
        self.children.extend(other.children)
        self.min_node = min(self.min_node, other.min_node)

    def push(self, key, value):
        push_node = FibNode(key, value)
        self.children.append(push_node)
        self.min_node = min(self.min_node, push_node)

    def pop(self):
        for node in self.min_node.children:
            node.parent = FibNode
        self.children.extend(self.min_node.children)
        self.children.remove(self.min_node)
        pair = (self.min_node.key, self.min_node.value)

        def merge(a: FibNode, b: FibNode) -> FibNode:
            if a < b:
                small, big = a, b
            else:
                small, big = b, a

            small.children.append(big)
            return small

        bucket = {}
        for node in self.children:
            degree = len(node.children)

            while degree in bucket:
                node = merge(node, bucket.pop(degree))
                degree += 1
            bucket[degree] = node

        self.children = list(bucket.values())
        if self.children:
            self.min_node = min(self.children)
        else:
            self.min_node = FibNode
        return pair


def fib_heap_test():
    fib_heap = FibHeap()
    for i in range(10):
        fib_heap.push(i, i)
    for i in range(10):
        print(fib_heap.pop())


if __name__ == '__main__':
    fib_heap_test()
