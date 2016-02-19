from math import inf
from functools import lru_cache
from time import time

price_tuple = (1, 5, 8, 9, 10, 17, 17, 20, 24, 30)


def cut_rob(price_tuple: tuple, length: int):
    if length == 0:
        return 0

    revenue = -inf
    for i in range(1, min(len(price_tuple), length) + 1):
        revenue = max(revenue, price_tuple[i - 1] + cut_rob(price_tuple, length - i))
    return revenue


@lru_cache(100)
def cut_rob_cached(price_tuple: tuple, length: int):
    if length == 0:
        return 0

    revenue = -inf
    for i in range(1, min(len(price_tuple), length) + 1):
        revenue = max(revenue, price_tuple[i - 1] + cut_rob_cached(price_tuple, length - i))
    return revenue


go_time = time()
for i in range(10000):
    result = cut_rob_cached(price_tuple, 11)
end_time = time()
print(result)
print(int(end_time - go_time))

go_time = time()
for i in range(10000):
    result = cut_rob(price_tuple, 11)
end_time = time()
print(result)
print(int(end_time - go_time))
