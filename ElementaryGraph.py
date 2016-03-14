from math import inf
from collections import deque

WHITE = object()
GRAY = object()
BLACK = object()


class Vertex:
    def __init__(self, identifier):
        self.identifier = identifier
        self.adjacency_list = []

    def __repr__(self):
        return self.identifier

    def connect(self, *args):
        self.adjacency_list.extend(args)


class VertexBFS(Vertex):
    def __init__(self, identifier):
        super().__init__(identifier)

        self.color = WHITE
        self.distance = inf
        self.parent = VertexBFS

    def build_bfs(self):
        self.color = GRAY
        self.distance = 0

        q = deque()
        q.append(self)
        while q:
            cursor = q.popleft()

            for adjacency in cursor.adjacency_list:
                if adjacency.color is WHITE:
                    adjacency.color = GRAY
                    adjacency.distance = cursor.distance + 1
                    adjacency.parent = cursor
                    q.append(adjacency)
            cursor.color = BLACK

    def print_path_to(self, other):
        if other is self:
            print(self)

        elif other.parent is VertexBFS:
            print('No Path to', other)

        else:
            self.print_path_to(other.parent)
            print(other)


class VertexDFS(Vertex):
    time = 0

    def __init__(self, identifier):
        super().__init__(identifier)

        self.color = WHITE
        self.time_go = self.time_back = -1
        self.parent = VertexDFS

    def build_dfs(self):
        self.color = GRAY
        VertexDFS.time += 1
        self.time_go = VertexDFS.time

        for adjacency in self.adjacency_list:
            if adjacency.color is WHITE:
                adjacency.parent = self
                adjacency.build_dfs()

        self.color = BLACK
        VertexDFS.time += 1
        self.time_back = VertexDFS.time

    def __repr__(self):
        return super().__repr__() + ' {}:{}'.format(self.time_go, self.time_back)


if __name__ == '__main__':
    def main_bfs():
        r = VertexBFS('r')
        s = VertexBFS('s')
        t = VertexBFS('t')
        u = VertexBFS('u')
        y = VertexBFS('y')
        x = VertexBFS('x')
        w = VertexBFS('w')
        v = VertexBFS('v')

        r.connect(s, v)
        s.connect(r, w)
        t.connect(w, x, u)
        u.connect(t, x, y)
        v.connect(r)
        w.connect(s, t, x)
        x.connect(t, u, w, y)
        y.connect(u, x)

        s.build_bfs()
        s.print_path_to(u)
        print()


    def main_dfs():
        shirt = VertexDFS('shirt')
        belt = VertexDFS('belt')
        tie = VertexDFS('tie')
        jacket = VertexDFS('jacket')
        undershorts = VertexDFS('undershorts')
        pants = VertexDFS('pants')
        shoes = VertexDFS('shoes')
        socks = VertexDFS('socks')
        watch = VertexDFS('watch')

        shirt.connect(belt, tie)
        belt.connect(jacket)
        tie.connect(jacket)
        undershorts.connect(pants, shoes)
        pants.connect(belt, shoes)
        socks.connect(shoes)

        clothes = [shirt, belt, tie, jacket, undershorts, pants, shoes, socks, watch]
        for i in clothes:
            if i.color is WHITE:
                i.build_dfs()
        clothes.sort(key=lambda x: x.time_back, reverse=True)

        print(clothes)
        print()


    main_dfs()
