---
layout: post.njk
title: Clash for Windows 连接状态检查方法
description: 从系统代理、端口、日志、订阅和策略组几个角度检查 Clash for Windows 连接状态。
date: 2026-05-28
updated: 2026-06-27
tags: ["post", "连接检查", "日志查看", "排查"]
cover: "https://tse-mm.bing.com/th?q=Clash%20for%20Windows%20%E8%BF%9E%E6%8E%A5%E7%8A%B6%E6%80%81%E6%A3%80%E6%9F%A5%E6%96%B9%E6%B3%95"
permalink: /blog/clash-for-windows-network-check/
---

## 先看开关

确认 Clash for Windows 已启动，并检查系统代理开关是否处于预期状态。很多连接异常来自开关未开启、端口被占用，或者系统代理被其他软件改写。

Windows 里可以先看系统设置的代理页面，再回到客户端确认端口。若浏览器能用、终端不能用，通常不是客户端整体故障，而是终端没有读取系统代理。

## 再看日志

日志能提示订阅失败、端口占用、策略组为空等信息。遇到问题时先复制关键日志，再逐项核对设置。

常见关键词包括 `timeout`、`connection refused`、`port already in use`、`yaml`。看到超时先换网络或刷新订阅；看到端口占用先关掉同类工具；看到 YAML 错误则检查配置文件是否损坏。

## 最后对比应用

浏览器、终端工具和桌面软件可能分别有独立代理设置。若只有某个应用异常，通常需要检查该应用自己的网络设置。

排查时建议按“浏览器、终端、桌面软件”顺序测试。三者都失败，再回头看订阅和系统代理；只有其中一个失败，就优先看该应用自己的代理、DNS 或安全软件限制。
