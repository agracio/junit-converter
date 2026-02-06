declare module 'p3x-xml2json' {
    export function toJson(data: any, opts: any): string | object;
    export function toXml(data: any, opts: any): string;
}