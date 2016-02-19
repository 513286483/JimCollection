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


def cut_rob_bottom_up(price_tuple: tuple, length: int):
    revenue_cache = [0]

    for n in range(1, length + 1):
        revenue = -inf
        for i in range(1, min(n, len(price_tuple)) + 1):
            revenue = max(revenue, price_tuple[i - 1] + revenue_cache[n - i])
        revenue_cache.append(revenue)
    return revenue


go_time = time()
for i in range(10000):
    result = cut_rob_cached(price_tuple, 8)
end_time = time()
print(result)
print(int(end_time - go_time))

go_time = time()
for i in range(10000):
    result = cut_rob_bottom_up(price_tuple, 8)
end_time = time()
print(result)
print(int(end_time - go_time))


def cut_rob_bottom_up_record(price_tuple: tuple, length: int):
    revenue_cache = [0]
    best_move_list = [0]

    for n in range(1, length + 1):
        revenue = -inf
        best_move_list.append(0)

        for i in range(1, min(n, len(price_tuple)) + 1):
            curr_revenue = price_tuple[i - 1] + revenue_cache[n - i]
            if curr_revenue > revenue:
                revenue = curr_revenue
                best_move_list[n] = i

        revenue_cache.append(revenue)
    return revenue, best_move_list


result, best_move_list = cut_rob_bottom_up_record(price_tuple, 11)
print(result)
print(best_move_list)
