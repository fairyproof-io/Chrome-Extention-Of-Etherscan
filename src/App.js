/*global chrome*/
import React, { Component, useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { switchDate } from "./utils"


export default function App({ isExt }) {
  const [lastFile, setLastFile] = useState("")

  const handleFileReader = async (e) => {
    // 上传的文件需要是json格式且名字中要包含链名
    try {
      // 获取文件
      const file = e.target.files[0];
      // 实例化 FileReader对象
      const reader = new FileReader();
      reader.onload = function (e) {
        // 在onload函数中获取最后的内容
        setLastFile(JSON.parse(e.target.result))
      };
      //  调用readerAsText方法读取文本
      reader.readAsText(file);
      console.log(file.name);
    } catch (error) {
      console.log(error)
    }
  };


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
    chrome.runtime.sendMessage({
      type: "startScan",
      data: searchUrl,
      chainInfo,
      lastFile
    }, function (response) {
      // console.log("startScan data", response.farewell);
    });
    // localStorage.setItem(saveKey, JSON.stringify(lableNums)) // 更新本地为这次抓取的标签数量
  }



  // ——————————————————————————————————————

  let data = []
  let timer = null
  let timer2 = null
  const getTwitter = () => {
    clearTimeout(timer)

    let queryWhole = "article"
    let queryTime = "time"
    let queryContent = ".css-901oao.r-18jsvk2.r-37j5jr.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-bnwqim.r-qvutc0 span"
    let queryUser = "a.css-4rbku5.css-18t94o4.css-1dbjc4n.r-1loqt21.r-1wbh5a2.r-dnmrzs.r-1ny4l3l"
    let queryInteract = ".css-1dbjc4n.r-1ta3fxp.r-18u37iz.r-1wtj0ep.r-1s2bzr4.r-1mdbhws"
    let articles = Array.from(document.querySelectorAll(queryWhole))

    articles.forEach(item => {
      let content = ""
      Array.from(item.querySelectorAll(queryContent)).forEach(oneContent => {
        content += oneContent.textContent
      })


      console.log("article", item);
      console.log("time", Array.from(item.querySelectorAll(queryTime))[0] || "");
      console.log("content", content);
      console.log("user", Array.from(item.querySelectorAll(queryUser))[0] || "");
      console.log("replayNum", Array.from(item.querySelectorAll(queryInteract))[0]?.ariaLabel);


      let replayNum = 0
      let retweetNum = 0
      let likeNum = 0
      const interactNums = Array.from(item.querySelectorAll(queryInteract))[0]?.ariaLabel.split(",")
      interactNums.forEach((item) => {
        if (item.includes("replies")) {
          replayNum = Number(item.match(/\d+/g)[0])
        }
        if (item.includes("Retweets")) {
          retweetNum = Number(item.match(/\d+/g)[0])
        }
        if (item.includes("likes")) {
          likeNum = Number(item.match(/\d+/g)[0])
        }
      })
      console.log(replayNum, retweetNum, likeNum);


      const obj = {
        time: Array.from(item.querySelectorAll(queryTime))[0]?.datetime || "",
        content,
        user: Array.from(item.querySelectorAll(queryUser))[0]?.href || "",
        replayNum,
        retweetNum,
        likeNum,
      }
      data.push(obj)
    })
    console.log(data);
  }


  const getStart = () => {
    timer = setTimeout(function () {
      clearTimeout(timer2)
      console.log("屏幕滚动");
      window.scrollBy(0, window.innerHeight * 3);
      timer2 = setTimeout(function () {
        getTwitter()
      }, [2000])
    }, [2000])
  }




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
      <input type="file" onChange={handleFileReader} />
      <span>Tips: 注意上传的文件为Json格式,且文件一定要是即将要爬取公链的上一次文件</span>
      {/* https://twitter.com/FairyproofT */}
      <button className="niceButton" onClick={() => { getStart() }}>Twitter爬虫</button>
      <button data-chain="etherscan" className="niceButton" onClick={(e) => { getLabels(e) }}>开始抓取(etherscan)</button>
      {/* https://bscscan.com/labelcloud */}
      <button data-chain="bscscan" className="niceButton" onClick={(e) => { getLabels(e) }}>开始抓取(bscscan)</button>
      {/* https://polygonscan.com/labelcloud */}
      <button data-chain="polygon" className="niceButton" onClick={(e) => { getLabels(e) }}>开始抓取(polygon)</button>
    </div >
  );
}
// 当前我使用的node版本为 14.17.0