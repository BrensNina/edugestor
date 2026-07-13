export function formatHora(valor) {
    if (!valor) return '';
    const coincidencia = String(valor).match(/(\d{2}:\d{2})/);
    return coincidencia ? coincidencia[1] : valor;
}
