# import matplotlib.pyplot as plt, mpld3
# import numpy as np
# from matplotlib.patches import Rectangle
# from matplotlib.collections import PatchCollection
import pandas as pd
import json
import sys
import ast


def initializeAnalysis(shapes):
    newshapes = []
    for x in shapes.split(" "):
        newshapes.append(ast.literal_eval(x))

    props = section_properties(newshapes)

    result = {
                "props": props,
                "geom": newshapes
            }

    print(json.dumps(result, indent=2))
    return result


def section_properties(test, mirror=False, xbar_init=0, ybar_init=0):
    columns = ["el", "base", "height", "Area", "xbar", "Ax", "Ax^2", "Ioy"]
    data_y = pd.DataFrame(columns=columns)

    # Y moment
    for i in range(len(test)):
        basey = test[i][2]
        heighty = test[i][3]
        areay = basey * heighty
        xbar = test[i][0] + basey / 2
        Ax = areay * xbar
        Ax_sq = Ax * xbar
        Ioy = (heighty * basey ** 3) / 12

        data_y.at[i, "el"] = i + 1
        data_y.at[i, "base"] = basey
        data_y.at[i, "height"] = heighty
        data_y.at[i, "Area"] = areay
        data_y.at[i, "xbar"] = xbar
        data_y.at[i, "Ax"] = Ax
        data_y.at[i, "Ax^2"] = Ax_sq
        data_y.at[i, "Ioy"] = Ioy

    # Sum all columns
    sums_y = data_y.sum(axis=0)
    xbar_cg = sums_y["Ax"] / sums_y["Area"]
    Ioy_all = sums_y["Ioy"] + sums_y["Ax^2"] - xbar_cg * sums_y["Ax"]

    columns = ["el", "base", "height", "Area", "ybar", "Ay", "Ay^2", "Iox"]
    data_x = pd.DataFrame(columns=columns)

    # X moment
    for i in range(len(test)):
        basex = test[i][2]
        heightx = test[i][3]
        areax = basex * heightx
        ybarx = test[i][1] + heightx / 2
        Ay_x = areax * ybarx
        Ay_sqx = Ay_x * ybarx
        Iox = (basex * heightx ** 3) / 12

        data_x.at[i, "el"] = i + 1
        data_x.at[i, "base"] = basex
        data_x.at[i, "height"] = heightx
        data_x.at[i, "Area"] = areax
        data_x.at[i, "ybar"] = ybarx
        data_x.at[i, "Ay"] = Ay_x
        data_x.at[i, "Ay^2"] = Ay_sqx
        data_x.at[i, "Iox"] = Iox

    # Sum all columns
    sums_x = data_x.sum(axis=0)
    ybar_cg = sums_x["Ay"] / sums_x["Area"]
    Iox_all = sums_x["Iox"] + sums_x["Ay^2"] - ybar_cg * sums_x["Ay"]

    sec_props = {
        "Iox": Iox_all,
        "Ioy": Ioy_all,
        "xbar": xbar_cg,
        "ybar": ybar_cg
    }

    return sec_props


# def main(args):
#     print("test")
#     print(args)
#     print(len(args))
#     print(args[1].split(" "))
# #     return initializeAnalysis([ast.literal_eval(args[1]), ast.literal_eval(args[1])])


if __name__ == "__main__":
#     main(sys.argv)
#     print("exit main")
#     print(sys.argv[1])
    initializeAnalysis(sys.argv[1])

# python sectionProps.py '[ 0.50, 0, 1.00, 0.30]' '[ 0.85, 0.3, 0.30, 2.40]' '[ 0, 2.7, 2.00, 0.30]'

# [(0.50,    0), 1.00, 0.30],
#         [(0.85,  0.3), 0.30, 2.40],
#         [(0   ,  2.7), 2.00, 0.30]