from math import floor, ceil, log2
from typing import List


class VEBTree:
    # input_range must be 2^k
    def __init__(self, input_range: int):
        self.min = self.max = -1
        self.children = ()

        if input_range > 2:
            average_bits = log2(input_range) / 2
            small, big = 2 ** floor(average_bits), 2 ** ceil(average_bits)

            self.children = [VEBTree(small) for _ in range(big)]  # type: List[VEBTree]
            self.child_range = small
            self.cache = VEBTree(big)

    def range_min(self, range_from: int = 0, range_to: int = -1) -> int:
        pass

    def range_max(self, range_from: int = 0, range_to: int = -1) -> int:
        pass

    def insert(self, number: int):
        if self.min == -1:
            self.min = self.max = number
        else:
            if number < self.min:
                number, self.min = self.min, number

            if len(self.children) != 0:
                index, remainder = divmod(number, self.child_range)
                child = self.children[index]
                if child.min == -1:
                    child.min = child.max = remainder
                    self.cache.insert(index)
                else:
                    child.insert(remainder)

            if number > self.max:
                self.max = number

    def delete(self, number: int):
        pass

    def search(self, number: int) -> bool:
        if self.min == -1:
            return False

        if self.min == number or self.max == number:
            return True

        index, remainder = divmod(number, self.child_range)
        return self.children[index].search(remainder)

    def __iter__(self) -> int:
        if self.min != -1:
            yield self.min

        if self.min == self.max:
            return

        if len(self.children) == 0:
            return self.max

        for i in range(self.min // self.child_range, self.max // self.child_range + 1):
            child = self.children[i]
            drift = i * self.child_range
            for value in child:
                yield drift + value


if __name__ == '__main__':
    from random import randint


    def main():
        tree = VEBTree(128)
        compare_list = []

        for i in range(10):
            rand_int = randint(0, 128)
            compare_list.append(rand_int)
            tree.insert(rand_int)

        compare_list.sort()
        for a, b in zip(tree, compare_list):
            print(a, b, tree.search(a))


    main()
