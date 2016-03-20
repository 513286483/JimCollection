from math import inf

from ElementaryGraph import Vertex

e_map = {'tx': 5, 'ty': 8,
         'tz': -4, 'xt': -2,
         'yx': -3, 'yz': 9,
         'zx': 7, 'zs': 2,
         'st': 6, 'sy': 7}


class VertexBellmanFord(Vertex):
    def __init__(self, identifier: str):
        super(VertexBellmanFord, self).__init__(identifier)
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

if __name__ == '__main__':
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


    main_bellman_ford()
