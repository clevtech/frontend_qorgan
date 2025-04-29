import { NavItem } from '@/types/custom';

class Utils {
    /**
     * Get first character from first & last sentences of a username
     * @param {string} name - Username
     * @return {string} 2 characters string
     */
    static getNameInitial(name: string): string {
        const initials = name.match(/\b\w/g) || [];

        return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
    }

    /**
     * Get current path related object from Navigation Tree
     * @param {Array} navTree - Navigation Tree from directory 'configs/NavigationConfig'
     * @param {string} path - Location path you looking for e.g '/app/dashboards/analytic'
     * @return {Object | null} object that contained the path string
     */
    static getRouteInfo(navTree: Array<NavItem>, path: string): NavItem | null {
        for (const item of navTree) {
            if (item.path === path) {
                return item;
            }

            if (item.submenu && item.submenu.length > 0) {
                const route = this.getRouteInfo(item.submenu, path);
                if (route) {
                    return route;
                }
            }
        }

        return null;
    }

    /**
     * Get accessible color contrast
     * @param {string} hex - Hex color code e.g '#3e82f7'
     * @return {string} 'dark' or 'light'
     */
    static getColorContrast(hex: string): string {
        if (!hex) {
            return 'dark';
        }

        const threshold = 130;

        const hRed = hexToR(hex);
        const hGreen = hexToG(hex);
        const hBlue = hexToB(hex);

        function hexToR(hex: string) {
            return parseInt(cutHex(hex).substring(0, 2), 16);
        }

        function hexToG(hex: string) {
            return parseInt(cutHex(hex).substring(2, 4), 16);
        }

        function hexToB(hex: string) {
            return parseInt(cutHex(hex).substring(4, 6), 16);
        }

        function cutHex(hex: string) {
            return hex.charAt(0) === '#' ? hex.substring(1, 7) : hex;
        }

        const cBrightness = (hRed * 299 + hGreen * 587 + hBlue * 114) / 1000;

        if (cBrightness > threshold) {
            return 'dark';
        } else {
            return 'light';
        }
    }

    /**
     * Darken or lighten a hex color
     * @param {string} color - Hex color code e.g '#3e82f7'
     * @param {number} percent - Percentage -100 to 100, positive for lighten, negative for darken
     * @return {string} Darken or lighten color
     */
    static shadeColor(color: string, percent: number): string {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);

        R = Math.min(255, Math.max(0, R + (percent / 100) * R));
        G = Math.min(255, Math.max(0, G + (percent / 100) * G));
        B = Math.min(255, Math.max(0, B + (percent / 100) * B));

        const RR = Math.round(R).toString(16).padStart(2, '0');
        const GG = Math.round(G).toString(16).padStart(2, '0');
        const BB = Math.round(B).toString(16).padStart(2, '0');

        return `#${RR}${GG}${BB}`;
    }

    /**
     * Convert RGBA to HEX
     * @param {string} rgba - RGBA color code e.g 'rgba(197, 200, 198, .2)')'
     * @return {string} HEX color
     */
    static rgbaToHex(rgba: string): string {
        const trim = (str: string) => str.replace(/^\s+|\s+$/gm, '');

        const inParts = rgba.substring(rgba.indexOf('(')).split(',');
        const r = parseInt(trim(inParts[0].substring(1)), 10);
        const g = parseInt(trim(inParts[1]), 10);
        const b = parseInt(trim(inParts[2]), 10);
        const a = parseFloat(trim(inParts[3].substring(0, inParts[3].length - 1)));

        const rHex = r.toString(16).padStart(2, '0');
        const gHex = g.toString(16).padStart(2, '0');
        const bHex = b.toString(16).padStart(2, '0');
        const aHex = Math.round(a * 255)
            .toString(16)
            .padStart(2, '0');

        return `#${rHex}${gHex}${bHex}${aHex}`;
    }

    /**
     * Returns either a positive or negative
     * @param {number} number - number value
     * @param {T} positive - value that return when positive
     * @param {T} negative - value that return when negative
     * @return {T | null} positive or negative value based on param
     */
    static getSignNum<T>(number: number, positive: T, negative: T): T | null {
        if (number > 0) {
            return positive;
        }
        if (number < 0) {
            return negative;
        }
        return null;
    }

    /**
     * Returns either ascending or descending value
     * @param {Record<string, string | number>} a - antd Table sorter param a
     * @param {Record<string, string | number>} b - antd Table sorter param b
     * @param {string} key - object key for compare
     * @return {number | undefined} a value minus b value
     */
    static antdTableSorter(
        a: Record<string, string | number>,
        b: Record<string, string | number>,
        key: string,
    ): number | undefined {
        if (typeof a[key] === 'number' && typeof b[key] === 'number') {
            return (a[key] as number) - (b[key] as number);
        }

        if (typeof a[key] === 'string' && typeof b[key] === 'string') {
            const valueOfA = (a[key] as string).toLowerCase();
            const valueOfB = (b[key] as string).toLowerCase();

            return valueOfA > valueOfB ? -1 : valueOfB > valueOfA ? 1 : 0;
        }

        return undefined;
    }

    /**
     * Filter array of object
     * @param {Array<T>} list - array of objects that need to filter
     * @param {keyof T} key - object key target
     * @param {T[keyof T]} value  - value that excluded from filter
     * @return {Array<T>} a value minus b value
     */
    static filterArray<T>(list: Array<T>, key: keyof T, value: T[keyof T]): Array<T> {
        let data = list;

        if (list) {
            data = list.filter((item) => item[key] === value);
        }

        return data;
    }

    /**
     * Remove object from array by value
     * @param {Array<T>} list - array of objects
     * @param {keyof T} key - object key target
     * @param {T[keyof T]} value  - target value
     * @return {Array<T>} Array that removed target object
     */
    static deleteArrayRow<T>(list: Array<T>, key: keyof T, value: T[keyof T]): Array<T> {
        let data = list;

        if (list) {
            data = list.filter((item) => item[key] !== value);
        }

        return data;
    }

    /**
     * Wild card search on all property of the object
     * @param {number | string} input - any value to search
     * @param {Array<T>} list - array for search
     * @return {Array<T>} array of object contained keyword
     */
    static wildCardSearch<T extends Record<string, string | number>>(list: Array<T>, input: number | string): Array<T> {
        const searchText = (item: T) => {
            for (const key in item) {
                if (item[key] == null) {
                    continue;
                }

                if (item[key].toString().toUpperCase().indexOf(input.toString().toUpperCase()) !== -1) {
                    return true;
                }
            }
        };

        list = list.filter((value) => searchText(value));

        return list;
    }

    /**
     * Get Breakpoint
     * @param {Record<string, boolean>} screens - Grid.useBreakpoint() from antd
     * @return {Array<string>} array of breakpoint size
     */
    static getBreakPoint(screens: Record<string, boolean>): Array<string> {
        const breakpoints = [];

        for (const key in screens) {
            if (Object.prototype.hasOwnProperty.call(screens, key)) {
                const element = screens[key];
                if (element) {
                    breakpoints.push(key);
                }
            }
        }

        return breakpoints;
    }

    /**
     * Lightens a color based on a percentage.
     *
     * @param {string} color - The input color in the format "#RRGGBB".
     * @param {number} percentage - The percentage by which to lighten the color (0-100).
     * @returns {string} The new color in the format "#RRGGBB".
     * @throws {Error} If the percentage is not in the valid range or if the color format is invalid.
     */
    static lightenColor(color: string, percentage: number): string {
        if (percentage < 0 || percentage > 100) {
            throw new Error('Percentage must be between 0 and 100.');
        }

        const match = color.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);

        if (!match) {
            throw new Error('Invalid color format. Use a hex color like #RRGGBB.');
        }

        const red = parseInt(match[1], 16);
        const green = parseInt(match[2], 16);
        const blue = parseInt(match[3], 16);

        const newRed = Math.floor((255 * percentage + red * (100 - percentage)) / 100);
        const newGreen = Math.floor((255 * percentage + green * (100 - percentage)) / 100);
        const newBlue = Math.floor((255 * percentage + blue * (100 - percentage)) / 100);

        const newColor = `#${newRed.toString(16).padStart(2, '0')}${newGreen.toString(16).padStart(2, '0')}${newBlue
            .toString(16)
            .padStart(2, '0')}`;

        return newColor;
    }

    /**
     * Darkens a color based on a percentage.
     *
     * @param {string} color - The input color in the format "#RRGGBB".
     * @param {number} percentage - The percentage by which to darken the color (0-100).
     * @returns {string} The darkened color in the format "#RRGGBB".
     * @throws {Error} If the percentage is not in the valid range or if the color format is invalid.
     */
    static darkenColor(color: string, percentage: number): string {
        if (percentage < 0 || percentage > 100) {
            throw new Error('Percentage must be between 0 and 100.');
        }

        const match = color.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);

        if (!match) {
            throw new Error('Invalid color format. Use a hex color like #RRGGBB.');
        }

        const red = parseInt(match[1], 16);
        const green = parseInt(match[2], 16);
        const blue = parseInt(match[3], 16);

        const newRed = Math.floor((red * (100 - percentage)) / 100);
        const newGreen = Math.floor((green * (100 - percentage)) / 100);
        const newBlue = Math.floor((blue * (100 - percentage)) / 100);

        const newColor = `#${newRed.toString(16).padStart(2, '0')}${newGreen.toString(16).padStart(2, '0')}${newBlue
            .toString(16)
            .padStart(2, '0')}`;

        return newColor;
    }
}

export default Utils;
