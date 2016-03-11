from typing import List
from math import floor, ceil, log2


class VEBTree:
    # input_range must be 2^k
    def __init__(self, input_range: int):
        self.input_range = input_range
        self.min = self.max = -1
        self.children = ()

        if self.input_range > 2:
            average_bits = log2(self.input_range) / 2
            small, big = 2 ** floor(average_bits), 2 ** ceil(average_bits)

            self.children = [VEBTree(small) for _ in range(big)]  # type: List[VEBTree]
            self.cache = VEBTree(len(self.children))

    def range_min(self, range_from: int = 0, range_to: int = -1) -> int:
        if range_to == -1:
            range_to = self.input_range

        if range_from == self.min:
            return self.min

        length = self.input_range / len(self.children)
        index_from, remainder_from = divmod(range_from, length)
        index_to = range_to // length

        child = self.children[index_from]
        if child.min != -1:
            return child.range_min(remainder_from, range_to)

        index_min = self.cache.range_min(index_from + 1)
        if index_min <= index_to:
            return self.children[index_min].min

    def range_max(self, range_from: int = 0, range_to: int = -1) -> int:
        pass

    def insert(self, number: int):
        pass

    def delete(self, number: int):
        pass

    def search(self, number) -> int:
        if self.min == -1:
            return False

        if self.min == number or self.max == number:
            return True

        index, remainder = divmod(number, self.input_range / len(self.children))
        return self.children[index].search(remainder)

    def __iter__(self) -> int:
        if self.min != -1:
            yield self.min

        if self.min == self.max:
            return

        if len(self.children) == 0:
            return self.max

        for child in self.children[self.min // len(self.children):]:
            yield from child
