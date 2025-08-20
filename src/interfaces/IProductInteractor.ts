export interface IProductInteractor {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createProduct(input: any): any;
    updateStock(id: number, stock: number): void;
    getProducts(limit: number, offset: number): void;
}
