export const getTextColorForBackground = (hexColor?: string): string => {
    if (!hexColor || hexColor.length < 7) return '#000000';
    try {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    } catch (e) {
        return '#000000';
    }
};

export const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const calculateWorkHours = (clockIn: string | null, clockOut: string | null, breakStart: string | null, breakEnd: string | null): number => {
    if (!clockIn || !clockOut) return 0;
    
    try {
        const start = new Date(`1970-01-01T${clockIn}`);
        const end = new Date(`1970-01-01T${clockOut}`);
        let diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        if (breakStart && breakEnd) {
            const breakS = new Date(`1970-01-01T${breakStart}`);
            const breakE = new Date(`1970-01-01T${breakEnd}`);
            if (breakE > breakS) {
                diff -= (breakE.getTime() - breakS.getTime()) / (1000 * 60 * 60);
            }
        }
        return parseFloat(Math.max(0, diff).toFixed(1));
    } catch (e) {
        return 0;
    }
};
