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


export default function CustomerCard() {
    const [value, setValue] = useState(2);
    const[cust,setcust] = useState([]);
  
  const handleChange = useCallback((newValue) => setValue(newValue), []);
    const app = useAppBridge();

    const getCustomers1 = async () => {

      const token = await getSessionToken(app);
      
      const res = await axios.get(`/api/Customer-get`, {
        headers: {
          Authorization: "Bearer " + token,
        }
        
      });
      
      setcust(res.data.customer);
      console.log("customer front=====",res.data.customer);
    
    }



    const newColl1 = {
        qty: value,
      };
      const createCustomer = async (newColl1) => {
        const token = await getSessionToken(app);
        const config = {
          headers: {
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(newColl1),
        };
        const res = await axios.post(`/api/Customer-create`, newColl1, config);
        // setprod(res.data.product);
        console.log("res creat customer ==", res);
      };


      const deleteCustomer = async (newColl1) => {
        const token = await getSessionToken(app);
        const config = {
          headers: {
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(newColl1),
        };
        const res = await axios.delete(`/api/Customer-delete`, config);
        // setprod(res.data.product);
        console.log("res Del collection ==", res);
      };


      const Createcust = () => {
        createCustomer(newColl1);
        // getCustomers1();
        // console.log("value ==>",value);
      };


      const delecust = () => {
        deleteCustomer(newColl1);
      };


      useEffect(() => {
        getCustomers1()
      }, []);

  return (
    <>
    <Card>
<div style={{padding:'20px'}}>

      <TextField
        label="Customer Quantity"
        value={value}
        onChange={handleChange}
        autoComplete="off"
      />
      <br></br>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button primary onClick={() => Createcust()}>Add Customer</Button>
        <Button destructive onClick={() => delecust()}>Delete All Customers</Button>
      </div>
</div>
</Card>


<Card>
      <ResourceList
        resourceName={{singular: 'customer', plural: 'customers'}}
        items={cust}
        renderItem={(item) => {
          const {id, url, avatarSource, name, latestOrderUrl,image,last_name,first_name,email,phone  } = item;
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
               <b>First Name : </b> {first_name} 
              </h3>
              <h3>
                <b>
              Last Name : 
                </b>
               {last_name}
              </h3>

              <h3>
                <b>
              Email : 
                </b>
               {email}
              </h3>

              <h3>
                <b>
              Phone : 
                </b>
               {phone}
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
