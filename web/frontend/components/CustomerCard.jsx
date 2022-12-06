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
  // console.log("ddddddddddddddddddd",props.p_id);
  // const api__key_link = props.p_id;
  const handleChange = useCallback((newValue) => setValue(newValue), []);
    const app = useAppBridge();

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
    </>
  )
}
