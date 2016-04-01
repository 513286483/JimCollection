from typing import List

WHITE = object()
GRAY = object()
BLACK = object()


class Vertex:
    flow_map = {}
    residual_map = {}

    def __init__(self, identifier: str):
        self.identifier = identifier
        self.flow_vertexes = []  # type: List[Vertex]
        self.residual_vertexes = []  # type: List[Vertex]
        self.color = WHITE

    def __repr__(self):
        return self.identifier

    def build_pipe(self, vertex_to: 'Vertex', capacity: int):
        edge_name = str(self) + str(vertex_to)

        self.flow_vertexes.append(vertex_to)
        Vertex.flow_map[edge_name] = 0
        self.residual_vertexes.append(vertex_to)
        Vertex.residual_map[edge_name] = capacity

        vertex_to.residual_vertexes.append(self)
        Vertex.residual_map[str(vertex_to) + str(self)] = 0

    def augment_to(self, vertex_sink: 'Vertex'):
        recolor_list = []

        def travel(vertex: Vertex) -> List[Vertex]:
            if vertex is vertex_sink:
                return [vertex_sink]

            vertex.color = GRAY
            recolor_list.append(vertex)
            for cursor in vertex.residual_vertexes:
                if Vertex.residual_map[str(vertex) + str(cursor)] == 0:
                    continue

                if cursor.color is WHITE:
                    result = travel(cursor)
                    if result:
                        return [vertex, *result]
            self.color = BLACK

        aug_path = travel(self)
        for vertex in recolor_list:
            vertex.color = WHITE

        if not aug_path or len(aug_path) <= 1:
            return False
        else:
            min_residual = min(
                Vertex.residual_map[str(aug_path[i - 1]) + str(aug_path[i])] for i in range(1, len(aug_path)))

            for i in range(1, len(aug_path)):
                edge_name = str(aug_path[i - 1]) + str(aug_path[i])
                reverse_edge = str(aug_path[i]) + str(aug_path[i - 1])

                Vertex.residual_map[edge_name] -= min_residual
                if edge_name in Vertex.flow_map:
                    Vertex.flow_map[edge_name] += min_residual
                else:
                    Vertex.flow_map[reverse_edge] -= min_residual
                Vertex.residual_map[reverse_edge] += min_residual
            return True


if __name__ == '__main__':
    def ford_fulkerson_main():
        s = Vertex('s')
        v1 = Vertex('v1')
        v2 = Vertex('v2')
        v3 = Vertex('v3')
        v4 = Vertex('v4')
        t = Vertex('t')

        s.build_pipe(v1, 16)
        s.build_pipe(v2, 13)

        v1.build_pipe(v3, 12)

        v2.build_pipe(v1, 4)
        v2.build_pipe(v4, 14)

        v3.build_pipe(v2, 9)
        v3.build_pipe(t, 20)

        v4.build_pipe(v3, 7)
        v4.build_pipe(t, 4)

        while True:
            if not s.augment_to(t):
                break
        print()


class VertexPushRelabel:
    def __init__(self):
        pass
