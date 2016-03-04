from functools import lru_cache


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