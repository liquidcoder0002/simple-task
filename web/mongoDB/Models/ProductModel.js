import mongoose from 'mongoose'

// Defining schema.
const proSchema = new mongoose.Schema(
    {
        shop_product_id:{
            type: Array,
        }
    }
)

// Model.
const ProductModel = mongoose.model("Product_id", proSchema)

export default ProductModel