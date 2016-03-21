from math import inf

from ElementaryGraph import Vertex, VertexDFS, WHITE


class VertexBellmanFord(Vertex):
    def __init__(self, identifier: str):
        super().__init__(identifier)
        self.parent = VertexBellmanFord
        self.distance = inf  # type: int
        self.fee = 0

    def relax(self):
        next_level_vertexes = []
        for adjacency in self.adjacency_list:
            distance = self.distance + e_map.get(self.identifier + adjacency.identifier)
            if distance < adjacency.distance:
                adjacency.parent = self
                adjacency.distance = distance
                adjacency.fee = self.fee + 1
                next_level_vertexes.append(adjacency)
        return next_level_vertexes


if __name__ == '__main__':
    e_map = {'tx': 5, 'ty': 8,
             'tz': -4, 'xt': -2,
             'yx': -3, 'yz': 9,
             'zx': 7, 'zs': 2,
             'st': 6, 'sy': 7}

    s = VertexBellmanFord('s')
    t = VertexBellmanFord('t')
    x = VertexBellmanFord('x')
    y = VertexBellmanFord('y')
    z = VertexBellmanFord('z')

    s.connect(t, y)
    t.connect(x, z, y)
    x.connect(t)
    y.connect(x, z)
    z.connect(x)
    vertexes = (s, t, x, y, z)


    def main_bellman_ford():
        s.distance = 0
        mod_q = [s]
        for i in range(len(vertexes) - 1):
            if not mod_q:
                break

            temp = []
            for cursor in mod_q:
                if cursor.fee != i:
                    continue
                temp.extend(cursor.relax())
            mod_q = temp

        for vertex in vertexes[1:]:
            print(vertex, vertex.parent, e_map[str(vertex.parent) + str(vertex)])

        for edge in e_map:
            a, b = edge
            a = globals()[a]
            b = globals()[b]

            if b.distance > a.distance + e_map[edge]:
                return print('Negative Cycle')
        print('OK')


def relax_dfs(vertex, e_map):
    for adjacency in vertex.adjacency_list:
        distance = vertex.time_back + e_map.get(vertex.identifier + adjacency.identifier)
        if distance < adjacency.time_back:
            adjacency.parent = vertex
            adjacency.time_back = distance


if __name__ == '__main__':
    r = VertexDFS('r')
    s = VertexDFS('s')
    t = VertexDFS('t')
    x = VertexDFS('x')
    y = VertexDFS('y')
    z = VertexDFS('z')

    r.connect(s, t)
    s.connect(t, x)
    t.connect(x, y, z)
    x.connect(y, z)
    y.connect(z)

    graph = [r, s, t, x, y, z]
    for i in graph:
        if i.color is WHITE:
            i.build_dfs()
    graph.sort(key=lambda x: x.time_back, reverse=True)
    print(graph)
    print()
    for i in graph:
        i.time_back = inf
        i.parent = VertexDFS

    e_map = {'rs': 5, 'rt': 3,
             'st': 2, 'sx': 6,
             'tx': 7, 'ty': 4, 'tz': 2,
             'xy': -1, 'xz': 1,
             'yz': -2}

    s.time_back = 0
    for i in graph[1:]:
        relax_dfs(i, e_map)
    for vertex in graph:
        if vertex.parent is not VertexDFS:
            print(vertex, vertex.parent, e_map[vertex.parent.identifier + vertex.identifier])
    print()
