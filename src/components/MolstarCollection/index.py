from pyodide.ffi import JsException
import numpy as np
import tmtools


def tmtools_align(pos1, pos2, seq1, seq2):
    try:
        pos1 = pos1.to_py()
        pos2 = pos2.to_py()

        x1, y1, z1 = np.array(pos1['x']), np.array(pos1['y']), np.array(pos1['z'])
        x2, y2, z2 = np.array(pos2['x']), np.array(pos2['y']), np.array(pos2['z'])

        coords1 = np.column_stack([x1, y1, z1])
        coords2 = np.column_stack([x2, y2, z2])
        return tmtools.tm_align(coords1, coords2, seq1, seq2)
    except JsException as e:
        print(e.stack)