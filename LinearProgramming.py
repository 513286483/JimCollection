from collections import UserDict
from typing import Dict


def pivot(coeffs_eq: Dict[int, Dict[int, float]], consts_eq: Dict[int, float],
          coeffs_func: Dict[int, float], const_func: float,
          enter: int, leave: int):
    coeffs_eq_ret = MapPivot()  # type: Dict[int, Dict[int, float]]
    consts_eq_ret = MapPivot()  # type: Dict[int, float]
    coeffs_func_ret = MapPivot()  # type: Dict[int, float]

    # 交换enter与leave
    coeff = coeffs_eq[leave][enter]
    consts_eq_ret[enter] = consts_eq[leave] / coeff
    for x_index in coeffs_eq[leave]:
        if x_index == enter:
            continue
        coeffs_eq_ret[enter][x_index] = coeffs_eq[leave][x_index] / coeff
    coeffs_eq_ret[enter][leave] = 1 / coeff

    # 将等式代入原方程组
    const = consts_eq_ret[enter]
    for y_index in coeffs_eq:
        if y_index == leave:
            continue
        coeff = coeffs_eq[y_index][enter]

        consts_eq_ret[y_index] = consts_eq[y_index] + (- coeff * const)
        for x_index in coeffs_eq[y_index]:
            if x_index == enter:
                continue
            coeffs_eq_ret[y_index][x_index] = coeffs_eq[y_index][x_index] + (-coeff * coeffs_eq_ret[enter][x_index])
        coeffs_eq_ret[y_index][leave] = -coeff * coeffs_eq_ret[enter][leave]

    # 代入Objective Function
    coeff = coeffs_func[enter]
    const_func_ret = const_func + coeff * consts_eq_ret[enter]
    for x_index in coeffs_func:
        if x_index == enter:
            continue
        coeffs_func_ret[x_index] = coeffs_func[x_index] - coeff * coeffs_eq_ret[enter][x_index]
    coeffs_func_ret[leave] = -coeff * coeffs_eq_ret[enter][leave]
    return coeffs_eq_ret, consts_eq_ret, coeffs_func_ret, const_func_ret


class MapPivot(UserDict):
    def __getitem__(self, key):
        return self.data.setdefault(key, {})


if __name__ == '__main__':
    def pivot_main():
        coeffs_eq = {1: {2: 1 / 16, 5: -1 / 8, 6: 5 / 16},
                     3: {2: 3 / 8, 5: 1 / 4, 6: -1 / 8},
                     4: {2: -3 / 16, 5: -5 / 8, 6: 1 / 16}}
        consts_eq = {1: 33 / 4,
                     3: 3 / 2,
                     4: 69 / 4}
        coeffs_func = {2: 1 / 16,
                       5: -1 / 8,
                       6: -11 / 16}
        const_func = 111 / 4
        result = pivot(coeffs_eq, consts_eq, coeffs_func, const_func, 2, 3)
        print(result)


    pivot_main()
