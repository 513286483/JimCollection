from math import inf
from typing import List

W = [[0, 3, 8, inf, -4],
     [inf, 0, inf, 1, 7],
     [inf, 4, 0, inf, inf],
     [2, inf, -5, 0, inf],
     [inf, inf, inf, 6, 0]]


class Node:
    def __init__(self, weight: int):
        self.weight = weight
        self.parent = -1
        self.fee = 1

    def __repr__(self):
        if self.weight >= 0:
            return ' ' + str(self.weight)
        else:
            return str(self.weight)


class Matrix:
    def __init__(self, weight_matrix: List[List[int]]):
        self.matrix = [[Node(weight) for weight in row] for row in weight_matrix]

    def __repr__(self):
        return '\n'.join((str(i) for i in self.matrix))

    def extend_shortest_paths(self) -> bool:
        is_modified = False
        matrix_len = len(self.matrix)

        for pos in range(matrix_len):
            for pos_to in range(matrix_len):
                for pos_mid in range(matrix_len):
                    curr_weight = self.matrix[pos][pos_mid].weight + self.matrix[pos_mid][pos_to].weight
                    if curr_weight < self.matrix[pos][pos_to].weight:
                        self.matrix[pos][pos_to].weight = curr_weight
                        self.matrix[pos][pos_to].parent = pos_mid
                        is_modified = True
        return is_modified


matrix = Matrix(W)
while matrix.extend_shortest_paths():
    matrix.extend_shortest_paths()
print(matrix)
