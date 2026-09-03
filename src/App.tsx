import { createRoot } from 'react-dom/client'
import { MolViewSpec } from 'molstar/lib/extensions/mvs/behavior'
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18'
import { PluginSpec } from 'molstar/lib/mol-plugin/spec'
import { PluginConfig } from 'molstar/lib/mol-plugin/config'
import { createPluginUI } from 'molstar/lib/mol-plugin-ui'
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec'
import { PythonTerminal } from './components/PythonTerminal'
import { DivResizer } from './components/DivResizer'
import { PluginContext } from 'molstar/lib/mol-plugin/context'
import { useEffect, useRef } from 'react'
import 'molstar/lib/mol-plugin-ui/skin/light.scss'

import './components/MolstarScripts/main'; // importante
import './App.scss'


async function createViewer(root: HTMLElement) {
    const spec = DefaultPluginUISpec();
    const plugin = await createPluginUI({
        target: root,
        render: renderReact18,
        spec: {
            ...spec,
            layout: {
                initial: {
                    isExpanded: false,
                    showControls: true,
                    controlsDisplay: 'reactive',
                }
            },
        }
    });
    return plugin;
}

let molstarInstance: PluginContext;

export function getMolstar() {
    return molstarInstance;
}

function Root() {
    const viewerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        (async function () {
            molstarInstance = await createViewer(viewerRef.current!);
        })()
    }, []);
    return (
        <div className='main-container'>
            <DivResizer
                top={
                    <div className="molstar-container">
                        <div className='molstar-root' ref={viewerRef} />
                    </div>
                }
                bottom={
                    <div className='terminal-container'>
                        <PythonTerminal />
                    </div>
                }
            />
        </div>
    );
}

createRoot(document.getElementById('app')!).render(
    <Root />
);