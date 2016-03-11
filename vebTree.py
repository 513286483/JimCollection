from typing import List
from math import floor, ceil, log2


class VEBTree:
    # input_range must be 2^k
    def __init__(self, input_range: int):
        self.min = self.max = -1
        self.children = ()

        if input_range > 2:
            average_bits = log2(input_range) / 2
            small, big = 2 ** floor(average_bits), 2 ** ceil(average_bits)

            self.children = [VEBTree(small) for _ in range(big)]  # type: List[VEBTree]
            self.child_length = input_range / len(self.children)
            self.summary = VEBTree(len(self.children))

    def range_min(self, range_from: int = 0, range_to: int = -1) -> int:
        pass

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

        index, remainder = divmod(number, self.child_length)
        return self.children[index].search(remainder)

    def __iter__(self) -> int:
        if self.min != -1:
            yield self.min

        if self.min == self.max:
            return

        if len(self.children) == 0:
            return self.max

        for child in self.children[self.min // self.child_length:self.max // self.child_length + 1]:
            yield from child
