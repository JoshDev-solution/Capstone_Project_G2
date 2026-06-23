"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = exports.ProductController = void 0;
const product_service_1 = require("../services/product.service");
class ProductController {
    async getAllProducts(req, res, next) {
        try {
            const products = await product_service_1.productService.getAllProducts();
            res.json(products);
        }
        catch (error) {
            next(error);
        }
    }
    async getProductById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const product = await product_service_1.productService.getProductById(id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        }
        catch (error) {
            next(error);
        }
    }
    async createProduct(req, res, next) {
        try {
            const product = await product_service_1.productService.createProduct(req.body);
            res.status(201).json(product);
        }
        catch (error) {
            next(error);
        }
    }
    async updateProduct(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const product = await product_service_1.productService.updateProduct(id, req.body);
            res.json(product);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteProduct(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            await product_service_1.productService.deleteProduct(id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ProductController = ProductController;
exports.productController = new ProductController();
