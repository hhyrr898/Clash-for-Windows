---
layout: post.njk
title: Clash for Windows 端口设置说明
description: 说明 Clash for Windows 本地端口、系统代理端口和应用单独配置之间的关系。
date: 2026-05-23
tags: ["post", "端口设置", "排查", "进阶"]
cover: "https://tse-mm.bing.com/th?q=Clash%20for%20Windows%20%E7%AB%AF%E5%8F%A3%E8%AE%BE%E7%BD%AE%E8%AF%B4%E6%98%8E"
permalink: /blog/clash-for-windows-port-settings/
---

## 本地端口是什么

本地端口用于让系统或应用把网络请求交给客户端处理。若端口被其他程序占用，客户端可能无法正常接管请求。

## 如何检查

在 General 页面查看当前端口，并与浏览器或开发工具中的代理设置保持一致。终端工具若单独设置代理，也需要使用相同端口。

## 避免冲突

不要同时运行多个使用相同端口的软件。若必须共存，可以给不同客户端设置不同端口，并记录用途。
