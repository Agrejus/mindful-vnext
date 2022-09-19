export const getIcon = async (path: string): Promise<string> => {
    return await window.api.interactivity().getIcon(path)
}