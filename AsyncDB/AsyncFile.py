from asyncio import get_event_loop, Semaphore
from collections import deque
from concurrent.futures import ThreadPoolExecutor
from typing import Callable, BinaryIO, List


class FastIO:
    def __init__(self, filename: str):
        self.file = open(filename, 'rb+')
        self.cursor = 0

    def read(self, offset: int, length: int):
        self.seek(offset)
        self.file.read(length)
        self.cursor = offset + length

    def write(self, offset: int, data: bytes):
        self.seek(offset)
        self.file.write(data)
        self.cursor = offset + len(data)

    def seek(self, offset: int):
        if offset != self.cursor:
            self.file.seek(offset)

    def execute(self, offset: int, action: Callable[[BinaryIO], object]):
        self.seek(offset)
        result = action(self.file)
        self.cursor = self.file.tell()
        return result


class AsyncFile:
    def __init__(self, filename: str, io_num=8):
        self.event_loop = get_event_loop()
        self.semaphore = Semaphore(value=io_num)
        self.executor = ThreadPoolExecutor(max_workers=io_num)
        self.io_queue = deque((FastIO(filename) for _ in range(io_num)), maxlen=io_num)  # type: List[FastIO]

    async def read(self, offset: int, length: int):
        with await self.semaphore:
            io = self.io_queue.pop()
            result = await self.event_loop.run_in_executor(self.executor, io.read, offset, length)
            self.io_queue.append(io)
        return result

    async def write(self, offset: int, data: bytes):
        with await self.semaphore:
            io = self.io_queue.pop()
            await self.event_loop.run_in_executor(self.executor, io.write, offset, data)
            self.io_queue.append(io)

    async def execute(self, offset: int, action: Callable[[BinaryIO], object]):
        with await self.semaphore:
            io = self.io_queue.pop()
            result = await self.event_loop.run_in_executor(self.executor, io.execute, offset, action)
            self.io_queue.append(io)
        return result
