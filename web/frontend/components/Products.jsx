import React from 'react'
import {
    Card,TextField,Spinner,
    ResourceList,
    ResourceItem,
    Avatar,
    TextStyle,Button,
  } from '@shopify/polaris';
  import { useEffect,useState ,useCallback} from 'react';
  import axios from "axios";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";




export default function Products(props) {
  const [value, setValue] = useState(5);
  const [spin1, setSpin] = useState(false);
  const [spin2, setSpin2] = useState(false);

    const handleChange = useCallback((newValue) => setValue(newValue), []);
  
    
    const app = useAppBridge();
  const[prod,setprod] = useState([]);
  const[api_id_link,set_api_id] = useState();
// const url = images[0].src
  const getCustomers1 = async () => {

    const token = await getSessionToken(app);
    
    const res = await axios.get(`/api/products-get`, {
      headers: {
        Authorization: "Bearer " + token,
      }
      
    });
    setprod(res.data.product);
    console.log("=====",res.data.product );
  let api_id = [];
    for (let index = 0; index < res.data.product.length; index++) {
      // const element = array[index];
      api_id.push(res.data.product[index].admin_graphql_api_id)
      // console.log("product====>",res.data.product[index].admin_graphql_api_id) 
      // console.log("=====",prod.images[index].src );
    }
    
    props.p_id(api_id)
    set_api_id(api_id)
    // console.log("get product :",res.data.product[1].vendor);
  }
const newProds = {
  qty:value,
};

  const getCustomers2 = async (newProds) => {
// console.log("new prods", newProds);
    const token = await getSessionToken(app);
    const config = {
        headers: {
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(newProds)
          
    }
    const res = await axios.post(`/api/products-create`,newProds,config );
    // if(res.)
    console.log("product cont:==",res.data.success)
    if(res.data.success == true){
      getCustomers1();
      setSpin(false)
    }else{

    }
    
    
  }

  const deleteProduct = async (newProds) => {
    const token = await getSessionToken(app);
    const config = {
      headers: {
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(newProds),
    };
    const res = await axios.delete(`/api/Products-delete`, config);
    // setprod(res.data.product);
    console.log("res Del product ==", res.data);
    getCustomers1();
    if(res.data.success === true){
    console.log("res succes  Del product ==", res.data.success);
    // getCustomers1();
    // setSpin2(false)
    }else{

    }
  };

const delepro = () =>{
  // setSpin2(true)
  deleteProduct(newProds)
}

const CreateProd =  () => {
  setSpin(true)
        getCustomers2(newProds)
        getCustomers1();

}
  
  useEffect(() => {
    getCustomers1();
    console.log("spin=",prod) 
  }, []);

  const spin = <Spinner accessibilityLabel="Spinner example" size="large" />
  const spinde = <Spinner accessibilityLabel="Spinner example" size="large" />

  return (
    <>
  
    <Card>
<div style={{padding:'20px'}}>

    <TextField
      label="Product Quantity"
      value={value}
      onChange={handleChange}
      autoComplete="off"
    />
    <br></br>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
{spin1 == false ? <Button primary onClick={() => CreateProd()}>Add product</Button> : spin}
    
{/* <Button primary onClick={() => CreateProd()}>Add product</Button> */}
{spin2 == false ? <Button destructive onClick={() => delepro()}>Delete All products</Button> : spinde}
    
    </div>
</div>

    </Card>
    <Card>
      <ResourceList
        resourceName={{singular: 'customer', plural: 'customers'}}
        items={prod}
        renderItem={(item) => {
          const {id, url, avatarSource, name, location, latestOrderUrl,title,image,vendor,product_type,tags,variants} = item;
          // console.log("first",image?.src)
          const shortcutActions = latestOrderUrl
            ? [{content: 'View latest order', url: latestOrderUrl}]
            : null;

          return (
            <ResourceItem
              id={id}
              url={image}
              media={
                <Avatar
                  customer
                  size="medium"
                  name={name}
                  source={image?.src}
                />
              }
              shortcutActions={shortcutActions}
              accessibilityLabel={`View details for ${name}`}
              name={name}
            >
              <h3>
                <TextStyle variation="strong"><b>Title : </b>{title}</TextStyle>
              </h3>
              <div><b>Vendor : </b>{vendor}</div>
              <div><b>Tags : </b>{tags}</div>
              <div><b>Price : </b>${variants[0]?.price}</div>
              <div><b>Created Date : </b>{variants[0]?.created_at}</div>
            </ResourceItem>
          );
        }}
      />
    </Card>
    </>
  )
}
