import { Info } from 'lucide-react';

export default function InfoTooltip({ texto }) {
    return (
        <Info
            size={14}
            className="info-tooltip"
            title={texto}
        />
    );
}
