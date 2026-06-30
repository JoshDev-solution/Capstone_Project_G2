"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = exports.ProductController = void 0;
const product_service_1 = require("../services/product.service");
class ProductController {
    async getAllProducts(req, res, next) {
        try {
            const products = await product_service_1.productService.getAllProducts();
            const mapped = products.map((p) => ({
                id: p.id,
                name: p.name,
                category: p.category?.name || 'Uncategorized',
                categoryId: p.categoryId,
                sku: p.sku || `PRD-${p.id}`,
                price: Number(p.price),
                buyPrice: p.costPrice ? Number(p.costPrice) : undefined,
                stock: p.inventory?.quantity || 0,
                unit: p.unit || "piece",
                reorderLevel: p.inventory?.reorderLevel || 10,
                expiry: p.inventory?.expirationDate ? new Date(p.inventory.expirationDate).toISOString().split('T')[0] : "",
                active: p.isActive,
                status: p.isActive ? (p.inventory?.quantity > 0 ? "In Stock" : "Low Stock") : "Out of Stock",
                lastRestocked: p.inventory?.lastRestocked ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(p.inventory.lastRestocked)) : 'Never'
            }));
            res.json(mapped);
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
