import React from "react";
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

export default function CollectionCard(props) {
  const [value, setValue] = useState(2);
  // console.log("ddddddddddddddddddd",props.p_id);
  const api__key_link = props.p_id;
  const handleChange = useCallback((newValue) => setValue(newValue), []);

  const app = useAppBridge();

  const newColl = {
    qty: value,
    key_val: api__key_link,
  };
  const getCollection = async (newColl) => {
    const token = await getSessionToken(app);
    const config = {
      headers: {
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(newColl),
    };
    const res = await axios.post(`/api/collection-create`, newColl, config);
    // setprod(res.data.product);
    console.log("res creat collection ==", res);
  };
  const deleteCollection = async (newColl) => {
    const token = await getSessionToken(app);
    const config = {
      headers: {
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(newColl),
    };
    const res = await axios.delete(`/api/collection-delete`, config);
    // setprod(res.data.product);
    console.log("res Del collection ==", res);
  };

  const Createcoll = () => {
    getCollection(newColl);
    // getCustomers1();
    // console.log("value ==>",value);
  };

  const delecoll = () => {
    deleteCollection(newColl);
  };

  useEffect(() => {
    // getCollection();
  }, []);

  return (
    <>

<Card>
<div style={{padding:'20px'}}>

      <TextField
        label="Collection Quantity"
        value={value}
        onChange={handleChange}
        autoComplete="off"
      />
      <br></br>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button primary onClick={() => Createcoll()}>Add Collections</Button>
        <Button  destructive onClick={() => delecoll()}>Delete All Collections</Button>
      </div>
</div>
</Card>


    </>
  );
}
