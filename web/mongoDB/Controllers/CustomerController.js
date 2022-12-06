import CustomerModel from "../Models/CustomerModel.js";

export const getCustomerid = async( req, res, customer_id_array) => {
    
    console.log("Data custo.=", customer_id_array);
    const data = await CustomerModel.create({shop_customer_id:[customer_id_array]});
    console.log("Created customer", data);
}

export const  createDoc1 = async(req, res) => {
    // console.log("Data", coll_id_array);
const data = await CustomerModel.find();
console.log("Created data get===", data.length);
    // res.redirect("/student")
}

// export default MainController