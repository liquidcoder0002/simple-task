import CollectionModel from "../models/CollectionModel.js"


export const getCollectionid = async( req, res, coll_id_array) => {
    
    console.log("Data", coll_id_array);
    const data = await CollectionModel.create({shop_coll_id:[coll_id_array]});
    console.log("Created", data);
}

export const  createDoc = async(req, res) => {
    // console.log("Data", coll_id_array);
const data = await CollectionModel.find();
console.log("Created data get===", data.length);
    // res.redirect("/student")
}

// export default MainController