import React from 'react'
import {
    Card,TextField,
    ResourceList,
    ResourceItem,
    Avatar,
    TextStyle,Button,
  } from '@shopify/polaris';
  import { useEffect,useState ,useCallback} from 'react';
  import axios from "axios";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function Products() {
    const [value, setValue] = useState(5);

    const handleChange = useCallback((newValue) => setValue(newValue), []);
  
    
    const app = useAppBridge();
  const[prod,setprod] = useState([]);

  const getCustomers1 = async () => {

    const token = await getSessionToken(app);
    
    const res = await axios.get(`/api/products-get`, {
      headers: {
        Authorization: "Bearer " + token,
      }
      
    });
    console.log(res.data.product)
    setprod(res.data.product)
    
    
  }
const newProds = {
  qty:value,
};

  const getCustomers2 = async (newProds) => {
console.log("new prods", newProds);
    const token = await getSessionToken(app);
    const config = {
        headers: {
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(newProds)
          
    }
    const res = await axios.post(`/api/products-create`,newProds,config );
    // console.log(res)
    // setprod(res.data.product)
    getCustomers1();
    
  }


const CreateProd =  () => {
   
        getCustomers2(newProds)
    

}
  
  useEffect(() => {
    getCustomers1();
    
  }, [newProds]);



  return (
    <>
    
    <Card>
      <ResourceList
        resourceName={{singular: 'customer', plural: 'customers'}}
        items={prod}
        renderItem={(item) => {
          const {id, url, avatarSource, name, location, latestOrderUrl,title} = item;
        //   console.log("first",title)
          const shortcutActions = latestOrderUrl
            ? [{content: 'View latest order', url: latestOrderUrl}]
            : null;

          return (
            <ResourceItem
              id={id}
              url={url}
              media={
                <Avatar
                  customer
                  size="medium"
                  name={name}
                  source={avatarSource}
                />
              }
              shortcutActions={shortcutActions}
              accessibilityLabel={`View details for ${name}`}
              name={name}
            >
              <h3>
                <TextStyle variation="strong">{title}</TextStyle>
              </h3>
              <div>{location}</div>
            </ResourceItem>
          );
        }}
      />
    </Card>
    <TextField
      label="Store name"
      value={value}
      onChange={handleChange}
      autoComplete="off"
    />
    <br></br>
    <Button onClick={() => CreateProd()}>Add product</Button>
    </>
  )
}
