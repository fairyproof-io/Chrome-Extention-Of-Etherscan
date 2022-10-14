/*global chrome*/
/* src/content.js */
import React from 'react';
import ReactDOM from 'react-dom';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import App from "./App";

if (window.location.href.indexOf('/accounts/label') > -1) {
  let addressQuery = 'tbody td a'
  // let labelQuery = 'tbody td.sorting_1'
  let labelQuery = 'tbody td:nth-child(2)'
  let urlQuery = 'div.card.mb-3 div.card-body span a'
  let addresses = Array.from(document.querySelectorAll(addressQuery));
  let labels = Array.from(document.querySelectorAll(labelQuery))
  let url = document.querySelector(urlQuery) || {};
  let result = [];
  for (let i = 0; i < addresses.length; i++) {
    if (labels[i].textContent) {
      console.log("获取地址:", addresses[i], labels[i], url.href);
      result.push({
        address: addresses[i].textContent, label: labels[i].textContent, url: url.href ? url.href : ""
      })
    }
  }
  //解析完毕，发送到background⾥去 
  chrome.runtime.sendMessage({ type: "parseLabels", data: result }, function (response) {
    console.log("本页面获取到的地址数据:", response.currentLabelData);
  });
}


const Main = () => {

  return (
    <Frame head={[<link type="text/css" rel="stylesheet" href={chrome.runtime.getURL("/static/css/content.css")} ></link>]}>
      <FrameContextConsumer>
        {
          ({ document, window }) => {
            return <App document={document} window={window} isExt={true} />
          }
        }
      </FrameContextConsumer>
    </Frame>
  )
}

// class Main extends React.Component {
//   render() {
//     return 
//   }

// }


const app = document.createElement('div');
app.id = "my-extension-root";

document.body.appendChild(app);
ReactDOM.render(<Main />, app);
