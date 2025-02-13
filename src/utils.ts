export const DEFAULT_WORLD = "local-populated"

export const clearDomChildren = (element: HTMLElement) => {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
};
export const hexRGBtoNumber = (color: string) => {
    return Number.parseInt(`${color.replace("#", "")}FF`, 16)
}

export const numberToHexRGB = (num: number) => {
    const hex = (num >>> 8).toString(16).padStart(6, '0');
    return `#${hex}`.toUpperCase();
};


