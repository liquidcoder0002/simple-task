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
  const [coll, setColl] = useState("");
  console.log("object", coll);

  // console.log("ddddddddddddddddddd",props.p_id);
  const api__key_link = props.p_id;
  const handleChange = useCallback((newValue) => setValue(newValue), []);

  const app = useAppBridge();
  const getCustomers1 = async () => {
    const token = await getSessionToken(app);

    const res = await axios.get(`/api/Collections-get`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    // setprod(res.data.product);
    console.log("=====reas", res.data.collection);
    setColl(res.data.collection);
    console.log("===set dtaa==", coll);
  };

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
    // setprod(res.data.collection);
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
    getCustomers1();
    console.log("first coll ", coll);
  }, []);

  return (
    <>
      <Card>
        <div style={{ padding: "20px" }}>
          <TextField
            label="Collection Quantity"
            value={value}
            onChange={handleChange}
            autoComplete="off"
          />
          <br></br>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button primary onClick={() => Createcoll()}>
              Add Collections
            </Button>
            <Button destructive onClick={() => delecoll()}>
              Delete All Collections
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <ResourceList
          resourceName={{ singular: "customer", plural: "customers" }}
          items={coll}
          renderItem={(item) => {
            const {
              id,
              url,
              avatarSource,
              name,
              location,
              handle,
              body_html,
              image,
              title,
            } = item;

            return (
              <ResourceItem
                id={id}
                url={image?.src}
                media={
                  <Avatar
                    customer
                    size="medium"
                    name={name}
                    source={image?.src}
                  />
                }
                accessibilityLabel={`View details for ${name}`}
                name={name}
              >
                {name}
                <div>
                  <b> Title :</b> {title}
                </div>
                <div>
                  <b>Body_html :</b>
                  {body_html}
                </div>
                <div>
                  <b> Handle</b> :{handle}
                </div>

                <div>
                  <b>Id :</b>
                  {id}
                </div>
              </ResourceItem>
            );
          }}
        />
      </Card>
    </>
  );
}
