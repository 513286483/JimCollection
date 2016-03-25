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

    def __repr__(self):
        return '{:2}'.format(self.weight)


class Matrix:
    def __init__(self, weight_matrix: List[List[int]]):
        self.matrix = [[Node(weight) for weight in row] for row in weight_matrix]

    def __repr__(self):
        return '\n'.join((str(i) for i in self.matrix))

    def extend_shortest_paths(self) -> bool:
        is_modified = False
        matrix_len = len(self.matrix)

        for pos_from in range(matrix_len):
            for pos_to in range(matrix_len):
                for pos_mid in range(matrix_len):
                    curr_weight = self.matrix[pos_from][pos_mid].weight + self.matrix[pos_mid][pos_to].weight
                    if curr_weight < self.matrix[pos_from][pos_to].weight:
                        self.matrix[pos_from][pos_to].weight = curr_weight
                        self.matrix[pos_from][pos_to].parent = pos_mid
                        is_modified = True
        return is_modified

    def floyd_shortest_paths(self):
        matrix_len = len(self.matrix)

        for pos_mid in range(matrix_len):
            for pos_from in range(matrix_len):
                for pos_to in range(matrix_len):

                    curr_weight = self.matrix[pos_from][pos_mid].weight + self.matrix[pos_mid][pos_to].weight
                    path_from_to = self.matrix[pos_from][pos_to]

                    if curr_weight < path_from_to.weight:
                        path_from_to.weight = curr_weight
                        path_from_to.parent = pos_mid

                    elif path_from_to.parent == -1 and pos_from != pos_to and path_from_to.weight < inf:
                        path_from_to.parent = pos_from

    def print_paths(self):
        print('\n'.join(','.join('{:2}'.format(node.parent) for node in row) for row in self.matrix))

    def print_path_from_to(self, pos_from, pos_to):
        print(pos_from)
        if self.matrix[pos_from][pos_to].parent != -1:
            return self.print_path_from_to(self.matrix[pos_from][pos_to].parent, pos_to)

    def transitive_closure(self):
        matrix_len = len(self.matrix)

        for pos_mid in range(matrix_len):
            for pos_from in range(matrix_len):
                for pos_to in range(matrix_len):
                    self.matrix[pos_from][pos_to].weight = self.matrix[pos_from][pos_to].weight or (
                        self.matrix[pos_from][pos_mid].weight and self.matrix[pos_mid][pos_to].weight)


def slow_matrix():
    matrix = Matrix(W)
    while matrix.extend_shortest_paths():
        matrix.extend_shortest_paths()
    print(matrix)


def floyd_matrix():
    matrix = Matrix(W)
    matrix.floyd_shortest_paths()
    print(matrix)
    print('---------------')
    matrix.print_paths()


def transitive_closure():
    g = [[1, 0, 0, 0],
         [0, 1, 1, 1],
         [0, 1, 1, 0],
         [1, 0, 1, 1]]

    matrix = Matrix(g)
    matrix.transitive_closure()
    print(matrix)


transitive_closure()
