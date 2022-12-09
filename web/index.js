// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import { Shopify, LATEST_API_VERSION } from "@shopify/shopify-api";
import axios from "axios";
import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";
import { setupGDPRWebHooks } from "./gdpr.js";
import productCreator from "./helpers/product-creator.js";
import redirectToAuth from "./helpers/redirect-to-auth.js";
import { BillingInterval } from "./helpers/ensure-billing.js";
import { AppInstallations } from "./app_installations.js";
import connectDB from "./mongoDB/DB/ConnectDB.js";
import {
  getCollectionid,
  createDoc,
} from "./mongoDB/Controllers/MainController.js";
import CollectionModel from "./mongoDB/models/CollectionModel.js";
import { 
  getCustomerid,
  createDoc1, 
} from "./mongoDB/Controllers/CustomerController.js";
import CustomerModel from "./mongoDB/Models/CustomerModel.js";
import { createDoc_order, getorderid } from "./mongoDB/Controllers/OrderController.js";
import OrderModel from "./mongoDB/Models/OrderModel.js";
import { getProd_id,createProDoc} from "./mongoDB/Controllers/ProductController.js";
import ProductModel from "./mongoDB/Models/ProductModel.js";

const USE_ONLINE_TOKENS = false;

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);
const DATABASE_URL = process.env.DATABASE_URL || "mongodb://0.0.0.0:27017";

// TODO: There should be provided by env vars
const DEV_INDEX_PATH = `${process.cwd()}/frontend/`;
const PROD_INDEX_PATH = `${process.cwd()}/frontend/dist/`;

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https?:\/\//, ""),
  HOST_SCHEME: process.env.HOST.split("://")[0],
  API_VERSION: LATEST_API_VERSION,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  // See note below regarding using CustomSessionStorage with this template.
  // SESSION_STORAGE: new Shopify.Session.SQLiteSessionStorage(DB_PATH),
  ...(process.env.SHOP_CUSTOM_DOMAIN && {
    CUSTOM_SHOP_DOMAINS: [process.env.SHOP_CUSTOM_DOMAIN],
  }),
});

// NOTE: If you choose to implement your own storage strategy using
// Shopify.Session.CustomSessionStorage, you MUST implement the optional
// findSessionsByShopCallback and deleteSessionsCallback methods.  These are
// required for the app_installations.js component in this template to
// work properly.

Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
  path: "/api/webhooks",
  webhookHandler: async (_topic, shop, _body) => {
    await AppInstallations.delete(shop);
  },
});

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const BILLING_SETTINGS = {
  required: false,
  // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
  // chargeName: "My Shopify One-Time Charge",
  // amount: 5.0,
  // currencyCode: "USD",
  // interval: BillingInterval.OneTime,
};

// This sets up the mandatory GDPR webhooks. You’ll need to fill in the endpoint
// in the “GDPR mandatory webhooks” section in the “App setup” tab, and customize
// the code when you store customer data.
//
// More details can be found on shopify.dev:
// https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks
setupGDPRWebHooks("/api/webhooks");

// export for test use only
export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production",
  billingSettings = BILLING_SETTINGS
) {
  const app = express();
  app.use(express.json());
  app.set("use-online-tokens", USE_ONLINE_TOKENS);
  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app, {
    billing: billingSettings,
  });

  connectDB(DATABASE_URL);

  // Do not call app.use(express.json()) before processing webhooks with
  // Shopify.Webhooks.Registry.process().
  // See https://github.com/Shopify/shopify-api-node/blob/main/docs/usage/webhooks.md#note-regarding-use-of-body-parsers
  // for more details.
  app.post("/api/webhooks", async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (e) {
      console.log(`Failed to process webhook: ${e.message}`);
      if (!res.headersSent) {
        res.status(500).send(e.message);
      }
    }
  });

  // All endpoints after this point will require an active session
  app.use(
    "/api/*",
    verifyRequest(app, {
      billing: billingSettings,
    })
  );

  // My API OF PRODUCT RETRIVE

  app.get("/api/products-get", async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens")
      );
      const { Product } = await import(
        `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
      );
      const product = await Product.all({ session });
  //  console.log("req get pro====>", req);
      res.status(200).json({ product });
      console.log("product id===>",product)
    } catch (error) {
      console.log("Error" + error);
      res.status(500).json({ error });
    }
  });
  const get_imag = async () => {
    var config = {
      method: "get",
      url: "https://api.unsplash.com/photos/random?client_id=i3eHAQeGGJhgVxKL27bNoRPdnFxa5b1FyCFvX7aIi5A",
      headers: {},
    };

    const randomImage = await axios(config);
    console.log("ramdom Image is :==> ", randomImage.data.urls.regular);
    return randomImage;
  };

  app.post("/api/products-create", async (req, res) => {
    try {
      // const daata = await CollectionModel.find();
      // console.log("From Controller:", daata[1]);
      const { Location } = await import(
        `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
      );

      const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens")
      );
      const locationData = await Location.all({
        session,
      });
      // console.log("req location length", locationData.length);
      let Loca_id;
      for (let index = 0; index < locationData.length; index++) {
        Loca_id = locationData[index].id;
        // console.log("req locato", locationData[index].id);
      }

      const { qty, api_key } = req.body;
      let product_id_array = [];
      // console.log("name is :==>", new_fun.data.urls.regular);

      const client = new Shopify.Clients.Graphql(
        session?.shop,
        session?.accessToken
      );

      for (let index = 0; index < qty; index++) {
        let x1 = Math.floor(Math.random() * 10 + 1);
        let x2 = Math.floor(Math.random() * 10 + 1);
        let x;
        let comp;
        if (x1 > x2) {
          comp = x2 + 10;
          // console.log("if x1==", x1, "x2", x2 + 10);
        } else {
          comp = x2 + 3;
          // console.log("else x1==", x1, "x2", x2 + 5);
        }
        if (x1 > 4) {
          x = x1;
          // console.log("if ===",x1)
        } else {
          x = x1 + 3;
          // console.log("else ==",(x1 + 3))
        }
        // function generateString(length) {
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let result = " ";
        const charactersLength = characters.length;
        var imag_count = [];

        for (let i = 0; i < x; i++) {
          // const new_fun = await get_imag()
          // const Imgurl = new_fun.data.urls.regular;

          imag_count.push({
            altText: "",
            //  "src": Imgurl
            src: "https://images.unsplash.com/photo-1668479237709-20ee5c44c61a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          });
          // console.log("image urls test", i,imag_count,result)
          result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
          );
        }
        // }
        console.log("image src:==",imag_count)

        const prodData = await client.query({
          data: {
            query: `mutation productCreate($input: ProductInput!) {
              productCreate(input: $input) {
                product {
                  id
                  title
                  
                
                }
        userErrors {
          field
          message
        }
      }
    }
    `,
            variables: {
              input: {
                title: result,
                tags: ["cutome_added"],
                images: imag_count,
                published: true,
                variants: [
                  {
                    position: 1,
                    compareAtPrice: comp,
                    price: x1,
                    inventoryItem: {
                      // "cost": "",
                      tracked: true,
                    },
                    // inventoryQuantities: {
                    //   availableQuantity: 1,
                    //   locationId: 71330300154
                    // },
                  },
                ],
              },
            },
          },
        });
        // console.log("prodData index : ",prodData.body.data.productCreate.product)
        product_id_array.push(prodData.body.data.productCreate.product.id)
      }
      getProd_id(req, res, product_id_array);
    createProDoc(req, res);

    res.status(200).json({ success: true, product_id_array });
    } catch (error) {
      console.log("Error" + error);
      res.status(500).json({ error });
    }
  });

  app.delete("/api/Products-delete", async (req, res) => {
    try {
      // const daata = await CollectionModel.find();
      // console.log("From Controller:", daata[1]);
      const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens")
      );
      const { qty, key_val } = req.body;
      // let coll_id_array = [];
      const client = new Shopify.Clients.Graphql(
        session.shop,
        session?.accessToken
      );

      const data = await ProductModel.find();
      let id_clas;
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        // console.log("delete data===",data[index].shop_coll_id[0].map((i) => console.log("Map data", i)));
        data[index].shop_product_id[0].map(async (i) => {
          console.log("Map data", i);

          const collDatadel = await client.query({
            data: {
              query: `mutation productDelete($input: ProductDeleteInput!) {
                productDelete(input: $input) {
                  deletedProductId
                  shop {
                    id
                  }
                  userErrors {
                    field
                    message
                  }
                }
              }
              
                `,
              variables: {
                input: {
                  id: i,
                },
              },
            },
          });

          // console.log("DELET === Data", id_clas);
          // res.json(collData)
          // coll_id_array.push(collDatadel.body.data.collectionCreate.collection.id)
          // }
          // console.log("DELETE API======",collDatadel.body.data.productDelete);
        });
      }
      // getCollectionid(req, res, coll_id_array);
      // createDoc(req, res);
      const DATA6 = await ProductModel.deleteMany();
      res.status(200).json({ success: true,DATA6 });
    } catch (error) {
      console.log("Error" + error);
      res.status(500).json({ error });
    }
  });



  app.get("/api/Collections-get", async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens")
      );
      const { CustomCollection } = await import(
        `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
      );
      // const product = await Product.all({ session });
      // Session is built by the OAuth process

      const collection = await CustomCollection.all({
  session: session,
});



      // console.log("req get pro====>", req);
      res.status(200).json({ collection });
      // console.log("collection id===>",res.data)
    } catch (error) {
      console.log("Error" + error);
      res.status(500).json({ error });
    }
  });

  app.post("/api/collection-create", async (req, res) => {
    try {
      const daata = await CollectionModel.find();
      console.log("From Controller:", daata[1]);
      const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens")
      );
      const { qty, key_val } = req.body;
      let coll_id_array = [];
      const client = new Shopify.Clients.Graphql(
        session.shop,
        session?.accessToken
      );
      for (let index = 0; index < qty; index++) {
        let x1 = Math.floor(Math.random() * 10 + 1);
        let x2 = Math.floor(Math.random() * 10 + 1);
        let x;
        let comp;
        if (x1 > x2) {
          comp = x2 + 10;
          console.log("if x1==", x1, "x2", x2 + 10);
        } else {
          comp = x2 + 3;
          console.log("else x1==", x1, "x2", x2 + 5);
        }
        if (x1 > 4) {
          x = x1;
          // console.log("if ===",x1)
        } else {
          x = x1 + 3;
          // console.log("else ==",(x1 + 3))
        }
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let result = " ";
        const charactersLength = characters.length;
        var prod_count = [];
        for (let i = 0; i < x; i++) {
          prod_count.push(key_val[i]);
          // console.log("object id ======>",key_val[i])
          result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
          );
        }
        for (let i = comp; i < x; i++) {
          console.log("index loop  check ===", index, x);
        }
        const collData = await client.query({
          data: {
            query: `mutation collectionCreate($input: CollectionInput!) {
            collectionCreate(input: $input) {
              collection {
               id
              }
              userErrors {
                field
                message
              }
            }
          }
            
    `,
            variables: {
              input: {
                descriptionHtml: "this is test collections",
                image: {
                  src: "https://images.unsplash.com/photo-1668479237709-20ee5c44c61a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
                },
                handle: "",
                products: prod_count,
                title: result,
              },
            },
          },
        });

        console.log("Data", collData.body.data.collectionCreate.collection.id);
        // res.json(collData)
        coll_id_array.push(collData.body.data.collectionCreate.collection.id);
      }
      getCollectionid(req, res, coll_id_array);
      createDoc(req, res);
      console.log("idsss======");
      res.status(200).json({ success: true, coll_id_array });
    } catch (error) {
      console.log("Error" + error);
      res.status(500).json({ error });
    }
  });

  app.delete("/api/collection-delete", async (req, res) => {
    try {
      // const daata = await CollectionModel.find();
      // console.log("From Controller:", daata[1]);
      const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens")
      );
      const { qty, key_val } = req.body;
      // let coll_id_array = [];
      const client = new Shopify.Clients.Graphql(
        session.shop,
        session?.accessToken
      );

      const data = await CollectionModel.find();
      let id_clas;
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        // console.log("delete data===",data[index].shop_coll_id[0].map((i) => console.log("Map data", i)));
        data[index].shop_coll_id[0].map(async (i) => {
          console.log("Map data", i);

          // console.log("shopcall lenght===",data[index].shop_coll_id[0].length)
          //   for (var key in data.messages) {
          //     var obj = data.messages[key];
          //     // ...
          // }
          // for (let index = 0; index < qty; index++) {

          // let x1 = Math.floor(Math.random() * 10 + 1);
          // let x2 = Math.floor(Math.random() * 10 + 1);
          // let x;
          // let comp;
          // if (x1 > x2) {
          //   comp = x2 + 10;
          //   console.log("if x1==", x1, "x2", x2 + 10);
          // } else {
          //   comp = x2 + 3;
          //   console.log("else x1==", x1, "x2", x2 + 5);
          // }
          // if (x1 > 4) {
          //   x = x1;
          //   // console.log("if ===",x1)
          // } else {
          //   x = x1 + 3;
          //   // console.log("else ==",(x1 + 3))
          // }
          // const characters =
          //   "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
          // let result = " ";
          // const charactersLength = characters.length;
          // var prod_count = [];
          //   for (let i = 0; i < x; i++) {
          //     prod_count.push(key_val[i])
          //     // console.log("object id ======>",key_val[i])
          //   result += characters.charAt(
          //     Math.floor(Math.random() * charactersLength)
          //   );
          // }
          // for (let i = comp ; i < x; i++) {
          //   console.log("index loop  check ===",index,x)
          // }
          const collDatadel = await client.query({
            data: {
              query: `mutation collectionDelete($input: CollectionDeleteInput!) {
                                collectionDelete(input: $input) {
                                  deletedCollectionId
                                  shop {
                                    id
                                    name
                                  }
                                  userErrors {
                                    field
                                    message
                                  }
                                }
                              }
                              
                              `,
              variables: {
                input: {
                  id: i,
                },
              },
            },
          });

          // console.log("DELET === Data", id_clas);
          // res.json(collData)
          // coll_id_array.push(collDatadel.body.data.collectionCreate.collection.id)
          // }
        });
      }
      // getCollectionid(req, res, coll_id_array);
      // createDoc(req, res);
      // console.log("DELETE API======",collDatadel);
      const DATA6 = await CollectionModel.deleteMany();
      res.status(200).json({ success: true, DATA6 });
    } catch (error) {
      console.log("Error" + error);
      res.status(500).json({ error });
    }
  });



  app.get("/api/Customer-get", async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens")
      );
      const { Customer } = await import(
        `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
      );
      // const product = await Product.all({ session });
      // Session is built by the OAuth process

      const customer = await Customer.all({
        session: session,
      });
      



      // console.log("req get pro====>", req);
      res.status(200).json({ customer });
      // console.log("customer id===>",res)
    } catch (error) {
      console.log("Error" + error);
      res.status(500).json({ error });
    }
  });

  app.post("/api/Customer-create", async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens")
      );

      const { qty } = req.body;
      let customer_id_array = [];
      const client = new Shopify.Clients.Graphql(
        session?.shop,
        session?.accessToken
      );

      for (let index = 0; index < qty; index++) {
        let x1 = Math.floor(Math.random() * 10 + 1);
        let x2 = Math.floor(Math.random() * 10 + 1);
        var digits = Math.floor(Math.random() * 9000000) + 1000000;
        let x;
        let comp;
        if (x1 > x2) {
          comp = x2 + 10;
          // console.log("if x1 ==", x1, "x2 ==", x2 + 10);
        } else {
          comp = x2 + 3;
          // console.log("else x1==", x1, "x2", x2 + 5);
        }
        if (x1 > 4) {
          x = x1;
          // console.log("if ===",x1)
        } else {
          x = x1 + 3;
          // console.log("else ==",(x1 + 3))
        }
        // function generateString(length) {
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let result = " ";
        const charactersLength = characters.length;
        var imag_count = [];

        for (let i = 0; i < x; i++) {
          // const new_fun = await get_imag()
          // const Imgurl = new_fun.data.urls.regular;

          imag_count.push({
            altText: "",
            //  "src": Imgurl
            src: "https://images.unsplash.com/photo-1668479237709-20ee5c44c61a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          });
          // console.log("image urls test", i,imag_count,result)
          result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
          );
          // console.log("Result"+result+" and index "+index);
        }
        // }

        const prodData5 = await client.query({
          data: {
            query: `mutation customerCreate($input: CustomerInput!) {
              customerCreate(input: $input) {
                customer {
                  id
                  firstName
                }
                userErrors {
                  field
                  message
                }
              }
            }`,
            variables: {
              input: {
                email: `${result}test24342@gmail.com`,
                firstName: `${result}`,
                lastName: result,
                phone: `917${digits}`,
                tags: ["tag1", "tag2", "tag3"],
              },
            },
          },
        });
        console.log("customerData :== ", prodData5.body.data.customerCreate.customer.id);
        customer_id_array.push(prodData5.body.data.customerCreate.customer.id);
        // console.log("mob++",digits);
        // res.status(200).json({prodData5});
      }
      // console.log("customerData qty : ", customer_id_array);
      getCustomerid(req, res, customer_id_array);
      createDoc1(req, res);
      res.status(200).json({ success: true});

    } catch (error) {
      console.log("Error" + error);
      res.status(500).json({ error });
    }
  });

   app.delete("/api/Customer-delete", async (req, res) => {
    try {
      // const daata = await CollectionModel.find();
      // console.log("From Controller:", daata[1]);
      const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens")
      );
      const { qty, key_val } = req.body;
      // let coll_id_array = [];
      const client = new Shopify.Clients.Graphql(
        session.shop,
        session?.accessToken
      );

      const data = await CustomerModel.find();
      let id_clas;
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        // console.log("delete data===",data[index].shop_coll_id[0].map((i) => console.log("Map data", i)));
        data[index].shop_customer_id[0].map(async (i) => {
          console.log("Map data", i);

          const collDatadel = await client.query({
            data: {
              query: `mutation customerDelete($input: CustomerDeleteInput!) {
                customerDelete(input: $input) {
                  deletedCustomerId
                  shop {
                    id
                    name
                  }
                  userErrors {
                    field
                    message
                  }
                }
              }
              
                              
                              `,
              variables: {
                input: {
                  id: i,
                },
              },
            },
          });

          // console.log("DELET === Data", id_clas);
          // res.json(collData)
          // coll_id_array.push(collDatadel.body.data.collectionCreate.collection.id)
          // }
        });
      }
      // getCollectionid(req, res, coll_id_array);
      // createDoc(req, res);
      // console.log("DELETE API======",collDatadel);
      const DATA6 = await CustomerModel.deleteMany();
      res.status(200).json({ success: true, DATA6 });
    } catch (error) {
      console.log("Error" + error);
      res.status(500).json({ error });
    }
  });


  app.get("/api/Orders-get", async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens")
      );
      const { DraftOrder } = await import(
        `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
      );
      // const product = await Product.all({ session });
      // Session is built by the OAuth process

      const order = await DraftOrder.all({
        session: session,
      });
      
      



      // console.log("req get pro====>", req);
      res.status(200).json({ order });
      console.log("order id===>",order)
    } catch (error) {
      console.log("Error" + error);
      res.status(500).json({ error });
    }
  });

  app.post("/api/Orders-create", async (req, res) => {
    try {
      const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens")
      );

      const { qty } = req.body;
      let order_id_array = [];
      const client = new Shopify.Clients.Graphql(
        session?.shop,
        session?.accessToken
      );

      for (let index = 0; index < qty; index++) {
        let x1 = Math.floor(Math.random() * 10 + 1);
        let x2 = Math.floor(Math.random() * 10 + 1);
        var digits = Math.floor(Math.random() * 9) + 100;
        var digi = Math.floor(Math.random() * 9) + 10 ;
        let x;
        let comp;
        if (x1 > x2) {
          comp = x2 + 10;
          // console.log("if x1 ==", x1, "x2 ==", x2 + 10);
        } else {
          comp = x2 + 3;
          // console.log("else x1==", x1, "x2", x2 + 5);
        }
        if (x1 > 4) {
          x = x1;
          // console.log("if ===",x1)
        } else {
          x = x1 + 3;
          // console.log("else ==",(x1 + 3))
        }
        // function generateString(length) {
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let result = " ";
        const charactersLength = characters.length;
        var imag_count = [];

        
        const prodData5 = await client.query({
          data: {
            query: `mutation draftOrderCreate($input: DraftOrderInput!) {
              draftOrderCreate(input: $input) {
                draftOrder {
                  id
                }
              }
            }`,
            variables: {
              "input": {
                "note": "Test draft order",
                "email": "test.user@shopify.com",
                "taxExempt": true,
                "tags": [
                  "foo",
                  "bar"
                ],
                "shippingLine": {
                  "title": "Custom Shipping",
                  "price": digi
                },
                "shippingAddress": {
                  "address1": "123 Main St",
                  "city": "Waterloo",
                  "province": "Ontario",
                  "country": "Canada",
                  "zip": "A1A 1A1"
                },
                "billingAddress": {
                  "address1": "456 Main St",
                  "city": "Toronto",
                  "province": "Ontario",
                  "country": "Canada",
                  "zip": "Z9Z 9Z9"
                },
                "lineItems": [
                  {
                    "title": "Custom product",
                    "originalUnitPrice": digits,
                    "quantity": comp,
                    "weight": {
                      "value": 1,
                      "unit": "KILOGRAMS"
                    },
                  },
                ],
               
              }
            },
          },
        });
        console.log("OrderData :== ", prodData5.body.data.draftOrderCreate.draftOrder.id);
        order_id_array.push(prodData5.body.data.draftOrderCreate.draftOrder.id);
        // console.log("mob++",digits);
        // res.status(200).json({prodData5});
      }
      // console.log("customerData qty : ", order_id_array);
      getorderid(req, res, order_id_array);
      createDoc_order(req, res);
      res.status(200).json({ success: true});

    } catch (error) {
      console.log("Error" + error);
      res.status(500).json({ error });
    }
  });

  app.delete("/api/Orders-delete", async (req, res) => {
    try {
      // const daata = await CollectionModel.find();
      // console.log("From Controller:", daata[1]);
      const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens")
      );
      const { qty, key_val } = req.body;
      // let coll_id_array = [];
      const client = new Shopify.Clients.Graphql(
        session.shop,
        session?.accessToken
      );

      const data = await OrderModel.find();
      let id_clas;
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        // console.log("delete data===",data[index].shop_coll_id[0].map((i) => console.log("Map data", i)));
        data[index].shop_order_id[0].map(async (i) => {
          console.log("Map data", i);

          const collDatadel = await client.query({
            data: {
              query: `mutation draftOrderDelete($input: DraftOrderDeleteInput!) {
                draftOrderDelete(input: $input) {
                  deletedId
                  userErrors {
                    field
                    message
                  }
                }
              }
                `,
              variables: {
                input: {
                  id: i,
                },
              },
            },
          });

          // console.log("DELET === Data", id_clas);
          // res.json(collData)
          // coll_id_array.push(collDatadel.body.data.collectionCreate.collection.id)
          // }
        });
      }
      // getCollectionid(req, res, coll_id_array);
      // createDoc(req, res);
      // console.log("DELETE API======",collDatadel);
      const DATA6 = await OrderModel.deleteMany();
      res.status(200).json({ success: true, DATA6 });
    } catch (error) {
      console.log("Error" + error);
      res.status(500).json({ error });
    }
  });
  







  app.get("/api/products/count", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
    );

    const countData = await Product.count({ session });
    res.status(200).send(countData);
  });

  app.get("/api/products/create", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    let status = 200;
    let error = null;

    try {
      await productCreator(session);
    } catch (e) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error });
  });

  // All endpoints after this point will have access to a request.body
  // attribute, as a result of the express.json() middleware
  app.use(express.json());

  app.use((req, res, next) => {
    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${encodeURIComponent(
          shop
        )} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  if (isProd) {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    app.use(compression());
    app.use(serveStatic(PROD_INDEX_PATH, { index: false }));
  }

  app.use("/*", async (req, res, next) => {
    if (typeof req.query.shop !== "string") {
      res.status(500);
      return res.send("No shop provided");
    }

    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    const appInstalled = await AppInstallations.includes(shop);

    if (!appInstalled && !req.originalUrl.match(/^\/exitiframe/i)) {
      return redirectToAuth(req, res, app);
    }

    if (Shopify.Context.IS_EMBEDDED_APP && req.query.embedded !== "1") {
      const embeddedUrl = Shopify.Utils.getEmbeddedAppUrl(req);

      return res.redirect(embeddedUrl + req.path);
    }

    const htmlFile = join(
      isProd ? PROD_INDEX_PATH : DEV_INDEX_PATH,
      "index.html"
    );

    return res
      .status(200)
      .set("Content-Type", "text/html")
      .send(readFileSync(htmlFile));
  });

  return { app };
}

createServer().then(({ app }) => app.listen(PORT));
