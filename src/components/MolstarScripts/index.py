import time
import numpy as np
import tmtools

def tmtools_align(coords1, coords2, seq1, seq2):
    x1, y1, z1 = np.array(coords1.x), np.array(coords1.y), np.array(coords1.z)
    x2, y2, z2 = np.array(coords2.x), np.array(coords2.y), np.array(coords2.z)

    coords1 = np.column_stack([x1, y1, z1])
    coords2 = np.column_stack([x2, y2, z2])
    print('A', time.time())
    tma = tmtools.tm_align(coords1, coords2, seq1, seq2)
    print('B', time.time())

    return {
        'rmsd': tma.rmsd,
        'u': tma.u,
        't': tma.t,
    }
