from random import randint

"""
问题描述：https://www.zhihu.com/question/41507833/
"""
INT_TO = 1000
ARRAY_LEN = 20


def main_balance():
    # 生成完全平衡的数组
    a = [randint(0, INT_TO) for _ in range(ARRAY_LEN)]
    b = [randint(0, INT_TO) for _ in range(ARRAY_LEN)]

    sum_a = sum(a)
    sum_b = sum(b)
    diff = sum_a - sum_b

    offset = 1 if diff > 0 else -1
    for i in range(abs(diff)):
        b[i % ARRAY_LEN] += offset
    print('Sum:', sum_a)

    # 打乱数组
    for i in range(ARRAY_LEN):
        index_a = randint(0, ARRAY_LEN - 1)
        index_b = randint(0, ARRAY_LEN - 1)
        a[index_a], b[index_b] = b[index_b], a[index_a]

    print('Sum - a:', sum(a))
    print('Sum - b:', sum(b))

    def balance_greedy(array_a: list, array_b: list):
        temp_a = []
        temp_b = []

        total = array_a + array_b
        total.sort()

        swap_flag = False
        for i, j in zip(total[0::2], total[1::2]):
            if swap_flag:
                i, j = j, i

            temp_a.append(i)
            temp_b.append(j)
            swap_flag = not swap_flag

        print('Sum - a:', sum(temp_a))
        print('Sum - b:', sum(temp_b))
        return temp_a, temp_b

    a, b = balance_greedy(a, b)

    def balance_evolution(array_a: list, array_b: list, times=2000):
        diff = sum(array_a) - sum(array_b)

        for i in range(times):
            if diff == 0:
                break

            index_a = randint(0, ARRAY_LEN - 1)
            index_b = randint(0, ARRAY_LEN - 1)

            drift = array_a[index_a] - array_b[index_b]
            if abs(diff - drift * 2) < abs(diff):
                array_a[index_a], array_b[index_b] = array_b[index_b], array_a[index_a]
                diff -= drift * 2

        sum_a = sum(array_a)
        sum_b = sum(array_b)
        print('Sum - a:', sum_a)
        print('Sum - b:', sum_b)
        print('Evo Times', i)

        if sum_a == sum_b:
            return True

    return balance_evolution(a, b)


failed_times = 0
for i in range(1000):
    if not main_balance():
        failed_times += 1
print('Balance Failed Times:', failed_times)
