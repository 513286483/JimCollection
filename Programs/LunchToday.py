from random import choice

vegetable = ('绿豆', '芦笋')
pasta = ('圈面', '细面')
meat = ('火腿', '三文鱼', '金枪鱼', '牛肉')

result = []
for i in (vegetable, pasta, meat):
    result.append(choice(i))

print(result)
