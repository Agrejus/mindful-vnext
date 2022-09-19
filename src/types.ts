export type PathInfoType = "directory" | "file"

export interface IPathInfo {
    name: string;
    type: PathInfoType;
    isTracked: boolean;
    isSelected: boolean;
    parts:string[];
    children: IPathInfo[];
    fullPath: string;
    isVisible: boolean;
}

export interface IFileSearchResult {
    name: string,
    type: "directory" | "file" | "other",
    fullPath: string;
}

export interface IContextMenuItem<T extends {}> { name: string, onClick: (data: T) => Promise<void> }