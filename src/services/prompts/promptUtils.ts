export const formatApiData = (apiData: unknown): string => {
    if (typeof apiData === 'string') {
        return apiData;
    }
    return JSON.stringify(apiData, null, 2);
};
