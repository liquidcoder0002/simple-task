import React from 'react'
import {
  Card,
  TextField,
  ResourceList,
  ResourceItem,
  Avatar,
  TextStyle,
  Button,
} from "@shopify/polaris";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";


export default function OrderCard() {
  const [value, setValue] = useState(2);
  const [order, setOrder] = useState([]);
  // console.log("ddddddddddddddddddd",props.p_id);
  // const api__key_link = props.p_id;
  const handleChange = useCallback((newValue) => setValue(newValue), []);
    const app = useAppBridge();


    const getOrders = async () => {

      const token = await getSessionToken(app);
      
      const res = await axios.get(`/api/Orders-get`, {
        headers: {
          Authorization: "Bearer " + token,
        }
        
      });
      
      setOrder(res.data.order);
      console.log("order front=====",res.data.order);
    
    }



    const neworder = {
        qty: value,
      };
      const createCustomer = async (neworder) => {
        const token = await getSessionToken(app);
        const config = {
          headers: {
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(neworder),
        };
        const res = await axios.post(`/api/Orders-create`, neworder, config);
        // setprod(res.data.product);
        console.log("res creat order ==", res);
      };


      const deleteCustomer = async (neworder) => {
        const token = await getSessionToken(app);
        const config = {
          headers: {
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(neworder),
        };
        const res = await axios.delete(`/api/Orders-delete`, config);
        // setprod(res.data.product);
        console.log("res Del orders ==", res);
      };


      const Createcust = () => {
        createCustomer(neworder);
        // getCustomers1();
        // console.log("value ==>",value);
      };


      const delecust = () => {
        deleteCustomer(neworder);
      };

useEffect(() => {
  getOrders()
}, []);

  return (
    <>
  <Card>
<div style={{padding:'20px'}}>

      <TextField
        label="Order Quantity"
        value={value}
        onChange={handleChange}
        autoComplete="off"
      />
      <br></br>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button primary onClick={() => Createcust()}>Add Orders</Button>
        <Button destructive onClick={() => delecust()}>Delete All Orders</Button>
      </div>
</div>
</Card>
<Card>
      <ResourceList
        resourceName={{singular: 'customer', plural: 'customers'}}
        items={order}
        renderItem={(item) => {
          const {id, url, avatarSource, name, latestOrderUrl,image,last_name,first_name,email,phone,subtotal_price,created_at } = item;
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
               <b>Id : </b> {id} 
              </h3>

              <h3>
                <b>
              Sub Total : 
                </b>
                $ {subtotal_price}
              </h3>

              <h3>
                <b>
                created_at : 
                </b>
               {created_at}
              </h3>
              {/* <div><b>Vendor : </b>{vendor}</div>
              <div><b>Tags : </b>{tags}</div>
              <div><b>Price : </b>${variants[0]?.price}</div>
              <div><b>Created Date : </b>{variants[0]?.created_at}</div> */}
            </ResourceItem>
          );
        }}
      />
    </Card>
    </>
  )
}
