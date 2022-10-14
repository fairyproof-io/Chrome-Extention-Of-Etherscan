/*global chrome*/

import React, { Component, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { switchDate } from "./utils"

export default function App({ isExt }) {
  // 点击触发getLabels函数开始抓取labels
  const getLabels = (e) => {
    const chainWebsite = e.target.dataset.chain
    let saveKey = ""
    let chainInfo = {
      time: switchDate(new Date()),
    }


    if (chainWebsite === "etherscan") {
      saveKey = "etherscan-lableNums"
      chainInfo.chainName = "etherscan"
    } else if (chainWebsite === "bscscan") {
      saveKey = "bscscan-lableNums"
      chainInfo.chainName = "bscscan"
    } else if (chainWebsite === "polygon") {
      saveKey = "polygon-lableNums"
      chainInfo.chainName = "polygon"
    }

    console.log(chainWebsite, "+++++++key", saveKey);


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
    let lastLableNums = JSON.parse(localStorage.getItem(saveKey) || JSON.stringify([]))
    let updatedLable = []
    let searchUrl = []
    console.log("上次保存的标签及其数量", lastLableNums);

    if (lastLableNums.length !== 0) {
      lableNums.forEach(newLabel => {
        const nowItem = lastLableNums.filter(item => item.lable === newLabel.lable)[0]
        console.log("上次标签与数量:", nowItem, "本次标签与数量:", newLabel);
        if (!nowItem || nowItem.num !== newLabel.num) {
          updatedLable.push(newLabel.lable)
        }
      })
      console.log("需要更新的标签updatedLable", updatedLable);
      newDataLable = newDataLable.filter(href => href.indexOf('/accounts') > -1) // 每个标签中的Accounts部分的url地址
      newDataLable.forEach(item => {
        updatedLable.forEach(lable => {
          if (item === "https://etherscan.io/accounts/label/" + lable) {
            searchUrl.push(item)
          }
        })
      })
    } else { // 如果本地没有存过 => 就全量爬取
      searchUrl = newDataLable.filter(href => href.indexOf('/accounts') > -1)
    }
    searchUrl = searchUrl.filter(item => item !== "https://etherscan.io/accounts/label/bancor")
    console.log("需要更新的数据url", searchUrl);

    // 这里抓取https://etherscan.io/labelcloud⻚⾯所有的⼤类标签
    // 然后通过chrome.runtime.sendMessage发送数据到background.js中
    chrome.runtime.sendMessage({ type: "startScan", data: searchUrl, chainInfo }, function (response) {
      // console.log("startScan data", response.farewell);
    });
    // localStorage.setItem(saveKey, JSON.stringify(lableNums)) // 更新本地为这次抓取的标签数量
  }
  console.log(111);

  return (
    <div className="App">
      <header className="App-header">
        {isExt ?
          <img src={chrome.runtime.getURL("static/media/logo.svg")} className="App-logo" alt="logo" />
          :
          <img src={logo} className="App-logo" alt="logo" />
        }

        <h1 className="App-title">Etherscan Bot</h1>
      </header>
      <button data-chain="etherscan" className="niceButton" onClick={(e) => { getLabels(e) }}>开始抓取(etherscan)</button>
      {/* https://bscscan.com/labelcloud */}
      <button data-chain="bscscan" className="niceButton" onClick={(e) => { getLabels(e) }}>开始抓取(bscscan)</button>
      {/* https://polygonscan.com/labelcloud */}
      <button data-chain="polygon" className="niceButton" onClick={(e) => { getLabels(e) }}>开始抓取(polygon)</button>

    </div >
  );
}