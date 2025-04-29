export const getNameInitials = (fullName: string) => {
    try {
        const arr = fullName.split(' ');

        let initials = '';

        if (arr.length === 3) {
            initials = `${arr[0]} ${arr[1][0]}.${arr[2][0]}.`;
        } else if (arr.length === 2) {
            initials = `${arr[0]} ${arr[1][0]}.`;
        } else {
            initials = arr[0];
        }

        return initials;
    } catch {
        return '';
    }
};

export const getPercentage = (activeCount: number, totalCount: number) => {
    let result = 0;

    if (activeCount === 0 && totalCount === 0) {
        return `${result}%`;
    }

    if (activeCount / totalCount === 1) {
        result = 100;

        return `${result}%`;
    }

    result = (activeCount / totalCount) * 100;

    const formatResult = result.toFixed(2);

    if (formatResult.endsWith('.00')) {
        return `${formatResult.slice(0, -3)}%`;
    }

    if (formatResult.endsWith('0')) {
        return `${formatResult.slice(0, -1)}%`;
    }

    return `${formatResult}%`;
};
