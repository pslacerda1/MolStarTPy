import { TMAlign } from 'molstar/lib/mol-math/linear-algebra/3d/tm-align'
import * as loaders from 'molstar/lib/extensions/plugin/loaders';
import {
    QueryContext,
    StructureSelection,
    StructureProperties
} from 'molstar/lib/mol-model/structure';
import { atoms } from 'molstar/lib/mol-model/structure/query/queries/generators';

import { ArrayTrajectory, Structure } from 'molstar/lib/mol-model/structure';
import {
    StructureElement,
} from 'molstar/lib/mol-model/structure';

import { OrderedSet } from 'molstar/lib/mol-data/int';

import { PythonEnvironment } from '../PythonEnvironment/environment';
import { intoPythonFromMain } from '../PythonEnvironment/main';
import { getMolstar } from '../../App';
import { Logger } from '../../utils';


const python = PythonEnvironment('main');

const log = Logger();


/**
 * Load a PDB record into a model.
 */
export const loadPdb = intoPythonFromMain('loadPdb',
    async function (pdbId: string) {
        log.debug(`Loading PDB ${pdbId}...`);
        await loaders.loadPdb(getMolstar(), pdbId);
    }
);


intoPythonFromMain('script01',
    async function (pdbList: string[]=['1BZL', '2JK6', '5SMJ']) {
        for (const pdb of pdbList) {
            await loadPdb(pdb);
        }
        return await tmAlignMatrix(pdbList);
    }
);


/**
 * Align many models .
 */
export const tmAlignMatrix = intoPythonFromMain('tmAlignMatrix',
    async function (modelLabels: string[]) {

        /**
         * Insane Mol* query system.
         */
        const query = atoms({
            atomTest: ctx => {
                const atom = StructureProperties.atom.auth_atom_id(ctx.element);
                return atom == 'CA';
            }
        });
        /**
         * Lets compare both methods.
         */
        const rmsdMatMolstar: number[] = [];
        const rmsdMatTmtools: number[] = [];

        for (const [label1, label2] of combinations(modelLabels, 2)) {
            const struct1 = findStructure(label1);
            const loci1 = StructureSelection.toLociWithCurrentUnits(
                query(new QueryContext(struct1))
            );
            const [coords1, seq1] = getAtomData(loci1);

            const struct2 = findStructure(label2);
            const loci2 = StructureSelection.toLociWithCurrentUnits(
                query(new QueryContext(struct2))
            );
            const [coords2, seq2] = getAtomData(loci2);

            // lets...
            const resultMs = TMAlign.compute({
                a: coords1,
                b: coords2,
                seqA: seq1,
                seqB: seq2
            });
            rmsdMatMolstar.push(resultMs.rmsd);

            // ...go!
            const resultTm: any = await python.callWorkerFunction(
                'MolstarScripts.tmtools_align',
                [coords1, coords2, seq1, seq2]
            );
            rmsdMatTmtools.push(resultTm['rmsd']);
        }

        /**
         * Just for fun!
         */
        const matrixMs = await python.callWorkerFunction(
            'scipy.spatial.distance.squareform',
            [rmsdMatMolstar]
        );
        await python.callWorkerFunction(
            'builtins.print',
            ['Mol*', matrixMs]
        )

        const matrixTm = await python.callWorkerFunction(
            'scipy.spatial.distance.squareform',
            [rmsdMatTmtools]
        );
        await python.callWorkerFunction(
            'builtins.print',
            ['tmtools', matrixTm]
        )
        return rmsdMatMolstar;
    }
);




/**
 * Get stuff from Mol*.
 *
 * @param loci only C-alpha supported.
 * @returns Coordenadas 3D e sequência primária.
 */

export type Coords = {x: number[], y: number[], z: number[]};
export type PrimarySequence = string;
export type AtomData = [Coords, PrimarySequence];

export function getAtomData(loci: StructureElement.Loci): AtomData {
    const AA: Record<string, string> = {
        'ALA': 'A', 'ARG': 'R', 'ASN': 'N', 'ASP': 'D',
        'CYS': 'C', 'GLN': 'Q', 'GLU': 'E', 'GLY': 'G',
        'HIS': 'H', 'ILE': 'I', 'LEU': 'L', 'LYS': 'K',
        'MET': 'M', 'PHE': 'F', 'PRO': 'P', 'SER': 'S',
        'THR': 'T', 'TRP': 'W', 'TYR': 'Y', 'VAL': 'V'
    };
    const coords: Coords = {x: [], y: [], z: []}
    const seq: string[] = [];

    const compId = StructureProperties.residue.label_comp_id;
    const { x, y, z } = StructureProperties.atom;

    // A location works like a cursor
    const loc = StructureElement.Location.create(loci.structure);

    for (const { unit, indices } of loci.elements) {
        // moving the "cursor" unit/chain
        loc.unit = unit;

        const elements = unit.elements;
        const size = OrderedSet.size(indices);

        for (let i = 0; i < size; i++) {
            // moving the location unit/chain
            loc.element = OrderedSet.getAt(elements, i);

            // create point
            const aa = AA[compId(loc) || 'X'];
            seq.push(aa);

            coords.x.push(x(loc));
            coords.y.push(y(loc));
            coords.z.push(z(loc));
        }
    }
    return [coords, seq.join('')];
}


//lixo meu
export function findStructure(structureLabel: string): Structure {
    const plugin = getMolstar();
    const cells = [...plugin.state.data.cells.values()];
    const structureCell =
        cells.find(cell => cell.obj?.label === structureLabel);
    if (!structureCell?.obj?.data) {
        throw new Error(`Structure '${structureLabel}' not found in state`);
    }
    const trajArray: ArrayTrajectory = structureCell?.obj?.data;
    const model = trajArray.getFrameAtIndex(0)
    return Structure.ofModel(model);
}

/////// lixo da ia
export function* combinations<T>(iterable: Iterable<T>, r: number): Generator<T[], void, unknown> {
    const pool = Array.from(iterable);
    const n = pool.length;

    if (r > n || r < 0) return;

    // Indices array initialized to [0, 1, ..., r-1]
    const indices = Array.from({ length: r }, (_, i) => i);

    yield indices.map(i => pool[i]);

    while (true) {
        let i = r - 1;
        while (i >= 0 && indices[i] === i + n - r) {
            i--;
        }

        if (i < 0) return;

        indices[i]++;
        for (let j = i + 1; j < r; j++) {
            indices[j] = indices[j - 1] + 1;
        }

        yield indices.map(idx => pool[idx]);
    }
}