import mongoose from 'mongoose'

// Defining schema.
const CustomerSchema = new mongoose.Schema(
    {
        shop_customer_id:{
            type: Array,
        }
    }
)

// Model.
const CustomerModel = mongoose.model("customer_id", CustomerSchema)

export default CustomerModel