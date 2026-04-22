x= int(input("WHAT IS X: ?"))
y= int(input("WHAT IS Y: ?"))
i=(x,y)
if x > y:
    print("X is greater than Y")
    print(x+y)
elif x < y:
    print("Y is greater than X")
    print(x-y)
elif x == y:
    print("X and Y are equal")
    print(x*y)
else:
    print(round(x/y, 1))

