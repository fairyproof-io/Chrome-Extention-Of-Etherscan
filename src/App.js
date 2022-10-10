/*global chrome*/

import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  // 点击触发getLabels函数开始抓取labels
  getLabels() {
    let queryString1 = 'a.py-1.px-3.d-block';
    let hrefs = Array.from(document.querySelectorAll(queryString1)) // dom节点
    let newDataLable = hrefs.map(href => href.href);
    let lableNums = [] // 获取到所有标签的Account的数量
    hrefs.forEach(href => {
      if (href.href.indexOf('/accounts') > -1) {
        const obj = {
          lable: href.href.slice(href.href.lastIndexOf("/") + 1),
          num: href.textContent.slice(href.textContent.indexOf("(") + 1, href.textContent.indexOf(")"))
        }
        lableNums.push(obj)
      }
    });
    let lastLableNums = JSON.parse(localStorage.getItem("lableNums") || JSON.stringify(""))
    let updatedLable = []
    lableNums.forEach(newLabel => {
      const nowItem = lastLableNums.filter(item => item.lable === newLabel.lable)[0]
      console.log(nowItem, "nowItem", newLabel, "newLabel");
      if (nowItem.num !== newLabel.num) {
        updatedLable.push(newLabel.lable)
      }
    })
    console.log("updatedLable", updatedLable);
    newDataLable = newDataLable.filter(href => href.indexOf('/accounts') > -1) // 每个标签中的Accounts部分的url地址
    let searchUrl = []
    newDataLable.forEach(item => {
      updatedLable.forEach(lable => {
        if (item.indexOf(lable) > -1) {
          searchUrl.push(item)
        }
      })
    })
    console.log("需要更新的数据url", searchUrl);
    // 这里抓取https://etherscan.io/labelcloud⻚⾯所有的⼤类标签
    // 然后通过chrome.runtime.sendMessage发送数据到background.js中
    // localStorage.setItem("lableNums", JSON.stringify(lableNums)) // 更新本地为这次抓取的标签数量
    chrome.runtime.sendMessage({ type: "startScan", data: searchUrl }, function (response) {
      // console.log("startScan data", response.farewell);
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {this.props.isExt ?
            <img src={chrome.runtime.getURL("static/media/logo.svg")} className="App-logo" alt="logo" />
            :
            <img src={logo} className="App-logo" alt="logo" />
          }

          <h1 className="App-title">Etherscan Bot</h1>
        </header>
        <button className="mybutton" onClick={this.getLabels.bind(this)}>开始抓取:etherscan</button>
        {/* https://bscscan.com/labelcloud */}
      </div>
    );
  }
}

export default App;
