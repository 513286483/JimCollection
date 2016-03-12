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
        if self.min == -1:
            raise Exception

        if range_from <= self.min <= range_to:
            return self.min

        if range_from == self.min:
            return self.min
        elif range_from == self.max:
            return self.max
        elif len(self.children) == 0:
            raise Exception

        index_from, remainder_from = divmod(range_from, self.child_range)
        if range_to == -1:
            index_to, remainder_to = len(self.children) - 1, self.child_range - 1
        else:
            index_to, remainder_to = divmod(range_to, self.child_range)

        child = self.children[index_from]
        if child.min != -1:
            drift = index_from * self.child_range

            if index_from < index_to:
                remainder_to = self.child_range - 1

            if remainder_from <= child.min <= remainder_to:
                return drift + child.min

            if child.min < remainder_from <= child.max:
                return drift + child.range_min(remainder_from, remainder_to)

        if index_from < index_to:
            index_min = self.cache.range_min(index_from + 1, index_to)
            result = index_min * self.child_range + self.children[index_min].min
            if result <= range_to:
                return result
        raise Exception

    def insert(self, number: int):
        if self.min == -1:
            self.min = self.max = number
        else:
            if number < self.min:
                number, self.min = self.min, number

            elif number > self.max:
                self.max = number

            if number != self.min and len(self.children) > 0:
                index, remainder = divmod(number, self.child_range)
                child = self.children[index]

                if child.min == -1:
                    self.cache.insert(index)
                    child.min = child.max = remainder
                else:
                    child.insert(remainder)

    def delete(self, number: int):
        pass

    def search(self, number: int) -> bool:
        if self.min == number or self.max == number:
            return True

        if self.min == -1 or len(self.children) == 0:
            return False

        index, remainder = divmod(number, self.child_range)
        return self.children[index].search(remainder)

    def __iter__(self) -> int:
        if self.min != -1:
            yield self.min

        if self.min == self.max:
            return

        if len(self.children) == 0:
            yield self.max
        else:
            for i in range(self.min // self.child_range, self.max // self.child_range + 1):
                child = self.children[i]
                drift = i * self.child_range
                for value in child:
                    yield drift + value


if __name__ == '__main__':
    from random import randint


    def main_0():
        tree = VEBTree(1024)
        compare_set = set()

        for i in range(1000):
            random = randint(0, 1023)
            compare_set.add(random)
            tree.insert(random)

        compare_list = list(compare_set)
        tree_list = list(tree)
        tree_set = set(tree_list)

        print('compare_list', len(compare_list))
        print('tree_list', len(tree_list))
        print('tree_set', len(tree_set))

        for i in compare_list:
            if i not in tree_set or not tree.search(i):
                print(i, 'NO')
                raise Exception
            else:
                print(i, 'OK')


    def main_1():
        bucket = [0 for _ in range(16)]
        sample = (2, 3, 4, 5, 7, 14, 15)
        for i in sample:
            bucket[i] = 1

        tree = VEBTree(16)
        for i in sample:
            tree.insert(i)

        for _ in range(10000):
            random_0 = randint(0, 15)
            random_1 = randint(random_0, 15)

            value = -1
            for i in range(random_0, random_1 + 1):
                if bucket[i]:
                    value = i
                    break

            if value == -1:
                try:
                    result = tree.range_min(random_0, random_1)
                except Exception:
                    print('OK')
                else:
                    print()
                    print('error result:', result)
                    print('from:to', random_0, random_1)
                    raise Exception
            else:
                result = tree.range_min(random_0, random_1)
                print('result:', result)
                print('from:to', random_0, random_1)
                print('expected:', value)
                assert value == result


    main_1()
