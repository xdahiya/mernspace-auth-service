/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IDBCrudBase {
    create(input: any): any;
    getById(id: number): any | undefined;
    update(id: number, data: any): any | undefined;
    deleteById(id: number): void;
}
