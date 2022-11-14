import React from 'react'
import {Card, Tabs} from '@shopify/polaris';
import {useState, useCallback} from 'react';
import Products from './Products';

export default function Tabmain() {

    const [selected, setSelected] = useState(0);

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

  return (
    <Card>
      <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
        <Card.Section title={tabs[selected].content}>
          {selected === 0 && <Products/> } 
        </Card.Section>
      </Tabs>
    </Card>
  )
}
