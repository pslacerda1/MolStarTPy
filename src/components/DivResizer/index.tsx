import { ReactNode, useEffect, useRef, useCallback, useState } from 'react';
import './index.scss'

interface IDivResizerProps {
    title?: string;
    max?: number;
    min?: number;
    top: ReactNode;
    bottom: ReactNode;
}

export const DivResizer: React.FunctionComponent<IDivResizerProps> = ({
    title: initialTitle,
    max: initMax,
    min: initMin,
    top: topChild,
    bottom: bottomChild,
}: IDivResizerProps) => {

    const title = initialTitle ?? '';

    const [max, setMax] = useState<number>(initMax ?? 70);
    const [min, setMin] = useState<number>(initMin ?? 10);
    const [height, setHeight] = useState<number>(80);
    const isDraggingRef = useRef<boolean>(false);

    const containerRef = useRef<HTMLDivElement>(null);


    // Start dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isDraggingRef.current = true;
        document.body.style.cursor = 'row-resize'; // change cursor globally
    };

    // Durante o arrasto
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDraggingRef.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const totalHeight = rect.height;

        // Posição do cursor em relação ao topo do container
        const currentY = e.clientY - rect.top;

        // Porcentagem direta da altura superior:
        // Se e.clientY sobe -> currentY diminui -> newPercentage diminui -> a barra SOBE!
        const rawPercentage = (currentY / totalHeight) * 100;

        // Aplica a restrição de limites (clamp) entre min e max
        const clampedPercentage = Math.max(min, Math.min(max, rawPercentage));

        setHeight(clampedPercentage);
    }, [min, max]);

    // Stops
    const handleMouseUp = useCallback(() => {
        if (isDraggingRef.current) {
            isDraggingRef.current = false;
            document.body.style.cursor = 'default'; // volta ao cursor normal
        }
    }, []);

    // Register global listeners
    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => handleMouseMove(e);
        const onMouseUp = () => handleMouseUp();

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const topHeight = height;
    const bottomHeight = 100 - height;

    return <>
            <div ref={containerRef} className="divresizer-container">
                <div className='divresizer top' style={{ height: `${topHeight}%` }}>
                    { topChild }
                </div>

                <hr
                    className='divresizer'
                    title={ title }
                    onMouseDown={handleMouseDown}
                />

                <div className='divresizer bottom' style={{ height: `${bottomHeight}%` }}>
                    { bottomChild }
                </div>
        </div>
    </>;
};
