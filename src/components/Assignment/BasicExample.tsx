import React, { Component, PropsWithChildren } from 'react';
import Card from 'react-bootstrap/Card';

interface BasicExampleProps {
  name: string;
  icon: JSX.Element;
}

function BasicExample(props: BasicExampleProps) {
  return (
    <Card bg='light'>
      <Card.Body>
        <Card.Title>
          {props.icon}
        </Card.Title>
        <Card.Subtitle className="mx-auto">{props.name}</Card.Subtitle>
      </Card.Body>
    </Card>
  );
}

export default BasicExample;