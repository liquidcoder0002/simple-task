import mongoose from 'mongoose'

// Defining schema.
const OrderSchema = new mongoose.Schema(
    {
        shop_order_id:{
            type: Array,
        }
    }
)

// Model.
const OrderModel = mongoose.model("Order_id", OrderSchema)

export default OrderModel