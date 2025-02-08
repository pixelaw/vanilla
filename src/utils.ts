export const DEFAULT_WORLD = "local-populated"

export const clearDomChildren = (element: HTMLElement) => {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
};
export const hexRGBtoNumber = (color: string) => {
    return Number.parseInt(`0x${color.replace("#", "")}FF`, 16)
}


