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
  // console.log("ddddddddddddddddddd",props.p_id);
  // const api__key_link = props.p_id;
  const handleChange = useCallback((newValue) => setValue(newValue), []);
    const app = useAppBridge();

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
    </>
  )
}
