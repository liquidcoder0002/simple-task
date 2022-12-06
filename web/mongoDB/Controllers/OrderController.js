import OrderModel from "../Models/OrderModel.js";

export const getorderid = async( req, res, order_id_array) => {
    
    console.log("Data order.=", order_id_array);
    const data = await OrderModel.create({shop_order_id:[order_id_array]});
    console.log("Created Order", data);
}

export const  createDoc_order = async(req, res) => {

const data = await OrderModel.find();
console.log("Created data get===", data.length);

}
