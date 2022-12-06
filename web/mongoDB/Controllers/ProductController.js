import ProductModel from "../Models/ProductModel.js";

export const getProd_id = async( req, res, product_id_array) => {
    
    console.log("Data prod.=", product_id_array);
    const data = await ProductModel.create({shop_product_id:[product_id_array]});
    console.log("Created product", data);
}

export const  createProDoc = async(req, res) => {
    // console.log("Data", coll_id_array);
const data = await ProductModel.find();
console.log("Created data get===", data.length);
    // res.redirect("/student")
}

// export default MainController