from random import randint

"""
问题描述：https://www.zhihu.com/question/41507833/
"""
INT_TO = 1000
ARRAY_LEN = 20


def main_balance():
    # 生成随机数组
    a = [randint(0, INT_TO) for _ in range(ARRAY_LEN)]
    b = [randint(0, INT_TO) for _ in range(ARRAY_LEN)]

    sum_a = sum(a)
    sum_b = sum(b)
    diff = sum_a - sum_b

    # 平衡数组
    offset = 1 if diff > 0 else -1
    for i in range(abs(diff)):
        b[i % ARRAY_LEN] += offset
    print('sum:', sum_a)

    # 打乱数组
    for i in range(ARRAY_LEN):
        index_a = randint(0, ARRAY_LEN - 1)
        index_b = randint(0, ARRAY_LEN - 1)
        a[index_a], b[index_b] = b[index_b], a[index_a]

    print('sum - a:', sum(a))
    print('sum - b:', sum(b))

    def balance_greedy(array_a: list, array_b: list):
        temp_a = []
        temp_b = []

        total = array_a + array_b
        total.sort()

        flip_flag = False
        for i, j in zip(total[0::2], total[1::2]):
            if flip_flag:
                i, j = j, i
            temp_a.append(i)
            temp_b.append(j)
            flip_flag ^= True

        print('sum - a:', sum(temp_a))
        print('sum - b:', sum(temp_b))
        return temp_a, temp_b

    a, b = balance_greedy(a, b)

    def balance_evolution(array_a: list, array_b: list, times=1000):
        diff = sum(array_a) - sum(array_b)

        for i in range(times):
            if diff == 0:
                break

            index_a = randint(0, ARRAY_LEN - 1)
            index_b = randint(0, ARRAY_LEN - 1)

            drift = (array_a[index_a] - array_b[index_b]) * 2
            if abs(diff - drift) < abs(diff):
                array_a[index_a], array_b[index_b] = array_b[index_b], array_a[index_a]
                diff -= drift

        sum_a = sum(array_a)
        sum_b = sum(array_b)
        print('final sum - a:', sum_a)
        print('final sum - b:', sum_b)
        return abs(sum_a - sum_b)

    return balance_evolution(a, b)


max_diff = -1
perfect_times = 0

for i in range(10000):
    diff = main_balance()
    max_diff = max(max_diff, diff)

    if diff == 0:
        perfect_times += 1

print('Perfect Times:', perfect_times)
print(max_diff)
