<div align="center">
  <img src="coming-soon.jpg" />
</div>

# ReactToPrint - Print React components in the browser

[![Build Status](https://travis-ci.org/gregnb/react-to-print.svg?branch=master)](https://travis-ci.org/gregnb/react-to-print)
[![dependencies Status](https://david-dm.org/gregnb/react-to-print/status.svg)](https://david-dm.org/gregnb/react-to-print)
[![npm version](https://badge.fury.io/js/jsonreactor.svg)](https://badge.fury.io/js/react-to-print)

Print React components in the browser

## Install

`npm install react-to-print --save-dev `

## Demo

## Usage


```js

class Example extends React.Component {

  render() {
    return (
      <div>
         <ReactToPrint
          trigger={() => (
            <a href="#">Print this out!</a>
          )}
          content={() => this.componentRef}
         />               
        <ComponentToPrint ref={(el) => this.componentRef = el} />
      </div>
    );

  }
}
```
