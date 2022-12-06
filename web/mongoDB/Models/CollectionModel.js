import mongoose from 'mongoose'

// Defining schema.
const CollSchema = new mongoose.Schema(
    {
        shop_coll_id:{
            type: Array,
        }
    }
)

// Model.
const CollectionModel = mongoose.model("collection_id", CollSchema)

export default CollectionModel