// import { TMAlign } from 'molstar/lib/mol-math/linear-algebra/3d/tm-align'
// import {
//     QueryContext,
//     StructureSelection,
//     StructureProperties
// } from 'molstar/lib/mol-model/structure';
// import { atoms } from 'molstar/lib/mol-model/structure/query/queries/generators';
// import { intoPythonFromWorker } from '../PythonEnvironment/worker';


// /**
//  * Align many models .
//  */

// export const tmAlignMatrixOnWorker = intoPythonFromWorker('tmAlignMatrixOnWorker',
//     async function (coords: string[]) {

//         /**
//          * Insane Mol* query system.
//          */
//         const query = atoms({
//             atomTest: ctx => {
//                 const atom = StructureProperties.atom.auth_atom_id(ctx.element);
//                 return atom == 'CA';
//             }
//         });
//         /**
//          * Just import the Python package and use the modules.
//          */
//         const pyodide = await getPyodide();
//         const MolstarScripts = pyodide.pyimport('MolstarScripts');
//         const tmToolsAlign = MolstarScripts.tmtools_align; // its a callable function defined in index.py

//         /**
//          * Lets compare both methods.
//          */
//         const rmsdMatMolstar: number[] = [];
//         const rmsdMatTmtools: number[] = [];

//         for (const [label1, label2] of combinations(modelLabels, 2)) {
//             const struct1 = findStructure(label1);
//             const loci1 = StructureSelection.toLociWithCurrentUnits(
//                 query(new QueryContext(struct1))
//             );
//             const [coords1, seq1] = getAtomData(loci1);

//             const struct2 = findStructure(label2);
//             const loci2 = StructureSelection.toLociWithCurrentUnits(
//                 query(new QueryContext(struct2))
//             );
//             const [coords2, seq2] = getAtomData(loci2);

//             // lets...
//             const resultMs = TMAlign.compute({
//                 a: coords1,
//                 b: coords2,
//                 seqA: seq1,
//                 seqB: seq2
//             });
//             rmsdMatMolstar.push(resultMs.rmsd);

//             // ..go!
//             const resultTm = tmToolsAlign(coords1, coords2, seq1, seq2);
//             rmsdMatTmtools.push(resultTm.rmsd);
//         }
//         console.log('RMSD Molstar', rmsdMatMolstar);
//         console.log('RMSD tmtools', rmsdMatTmtools);

//         /**
//          * Just for fun!
//          */
//         const builtins = pyodide.pyimport('builtins');
//         const scipy = pyodide.pyimport('scipy.spatial.distance');

//         builtins.print('RMSD Molstar', scipy.squareform(rmsdMatMolstar));
//         builtins.print('RMSD tmtools', scipy.squareform(rmsdMatTmtools));

//         return rmsdMatMolstar;
//     }
// );
