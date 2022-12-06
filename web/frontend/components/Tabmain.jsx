import React from 'react'
import {Card, Tabs} from '@shopify/polaris';
import {useState, useCallback} from 'react';
import Products from './Products';
import CollectionCard from './CollectionCard';
import CustomerCard from './CustomerCard';
import OrderCard from './OrderCard';

export default function Tabmain() {

    const [selected, setSelected] = useState(0);
    const [p_id, setP_id] = useState(null);


  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    [],
  );

  const tabs = [
    {
      id: 'all-customers-1',
      content: 'Products',
      accessibilityLabel: 'All customers',
      panelID: 'all-customers-content-1',
    },
    {
      id: 'accepts-marketing-1',
      content: 'Collections',
      panelID: 'accepts-marketing-content-1',
    },
    {
      id: 'repeat-customers-1',
      content: 'Customers',
      panelID: 'repeat-customers-content-1',
    },
    {
      id: 'Orders-customers-1',
      content: 'Orders',
      panelID: 'Orders-customers-content-1',
    }
  ];
// console.log("pddd", p_id);
  return (
    // <Card>
      <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
        <Card.Section>
        {selected === 0 && <Products p_id={(e)=>setP_id(e)}/> } 
        {selected === 1 && <CollectionCard p_id={p_id}/> } 
        {selected === 2 && <CustomerCard /> } 
        {selected === 3 && <OrderCard/> } 
        </Card.Section>
      </Tabs>
    // </Card>
  )
}
