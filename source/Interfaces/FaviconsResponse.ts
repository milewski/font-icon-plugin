export type File = { name: string, contents: string }

export interface FaviconsResponse {
    images: { name: string, contents: Buffer }[]
    files: File[]
    html: string[]
}

export interface FaviconsError {
    status: number | null
    name: string
    message: string
}
