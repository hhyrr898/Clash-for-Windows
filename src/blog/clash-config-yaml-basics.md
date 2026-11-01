---
noindex: true
layout: post.njk
title: "Clash for Windows 配置文件 yaml 入门：代理、规则与策略组结构"
description: "以 Clash for Windows 0.20.39 为例，手把手拆解订阅配置文件：从打开 YAML 目录、看懂 proxies 代理列表、proxy-groups 策略组，到 rules 规则匹配顺序，配 4 步实操"
date: 2026-11-01
featured: true
tags: ["post", "教程", "SSH连接"]
permalink: /blog/clash-config-yaml-basics/
---

Clash for Windows 的用户里，我带的几个朋友都卡在了配置文件这一步。这篇文章将带你彻底读懂 Clash 的配置文件，让你不再依赖界面点击，而是通过修改 yaml 文件，精准控制每个网站的代理规则。

他们导入订阅后，面对界面上的策略组下拉框常常不知所措，其实真正的控制权在于那份 yaml 文件。本文会为你拆解代理、规则与策略组这三个核心结构，让你从根源上理解流量是如何被分配的，并最终实现自定义配置。

问题不在软件，而在配置文件。Clash for Windows 已于 2023 年停止更新，最后一个版本是 0.20.39；但它的配置格式（Clash 内核那套 YAML）至今仍是大多数客户端的通用语言。你把这四块看懂，换任何工具都不慌。

先说明白：这篇只讲结构，不教你搭建服务，也不涉及任何具体机场。改配置前一定先备份，出问题能回滚。安装和首次导入可参考 [Clash for Windows 安装指南](/blog/clash-for-windows-install-guide/) 与 [订阅导入教程](/blog/clash-subscription-import-tutorial/)。

## 配置文件在哪，长什么样

### 第 1 步：找到 profiles 目录

打开 Clash for Windows，左侧点「Profiles（配置）」，在某个订阅卡片上点右键，选「Open Folder」。资源管理器会跳到类似 `C:\Users\你的用户名\.config\clash\profiles` 的路径。里面那些 `.yaml` 就是订阅落地后的实体文件。

### 第 2 步：用编辑器打开，先认四大块

我用 VS Code，没有的话记事本也行，只是缩进容易看瞎。打开后你会看到四个顶层键：

- `proxies`：节点清单，一条就是一个服务器
- `proxy-groups`：策略组，决定「谁可以被选」
- `rules`：规则，决定「什么流量走哪个组」
- `mixed-port`、`mode` 等：全局参数

YAML 靠缩进表达层级，两个空格一级，千万别用 Tab。这是新手最常见的翻车点。

## proxies：节点长什么样

一条典型条目大概是这个形状：

```yaml
proxies:
  - name: "香港 01"
    type: ss
    server: example.com
    port: 443
    cipher: aes-256-gcm
    password: "xxxx"
```

`name` 是显示名，后面所有引用都靠它，改名前先想清楚。`type` 是协议类型，`server`/`port` 是地址端口。这一块我基本不动，订阅更新会覆盖。如果你手动加了节点，记得复制一份留着，否则下次更新就没了。

## proxy-groups：策略组才是灵魂

策略组决定「你能选什么」。常见三种 `type`：

- `select`：手动选，界面上那个下拉框就是它
- `url-test`：自动测速选延迟最低的
- `fallback`：按顺序回退，第一个不通换下一个

```yaml
proxy-groups:
  - name: "节点选择"
    type: select
    proxies:
      - "自动选择"
      - "香港 01"
      - DIRECT
  - name: "自动选择"
    type: url-test
    url: "http://www.gstatic.com/generate_204"
    interval: 300
    proxies:
      - "香港 01"
```

注意 `proxies` 里写的名字必须在上文存在，或者写成 `DIRECT`、`REJECT` 这类内置值。名字对不上，整个配置直接加载失败。

## rules：从上往下，命中即停

### 第 3 步：读一遍规则顺序

```yaml
rules:
  - DOMAIN-SUFFIX,google.com,节点选择
  - DOMAIN-KEYWORD,github,自动选择
  - GEOIP,CN,DIRECT
  - MATCH,节点选择
```

`DOMAIN-SUFFIX` 匹配域名后缀，`DOMAIN-KEYWORD` 匹配关键字，`GEOIP` 按 IP 归属地判断，`MATCH` 是兜底。顺序极重要：从第一条往下走，命中就停，后面的不再看。所以 `MATCH` 必须放最后。

我自己踩过的坑：把 `GEOIP,CN,DIRECT` 写在最前面，结果国内域名全直连，但有些域名解析出来是海外 IP，反而绕了一圈。调整顺序后顺畅很多。想验证效果，可以配合 [日志阅读方法](/blog/clash-for-windows-log-reading/) 看每条连接命中了哪条规则。

### 第 4 步：改完保存并重载

改完文件按 Ctrl+S，回到 Clash for Windows，在 Profiles 里点一下当前配置卡片（或右键选 Reload），让内核重新读取。如果界面弹出红色报错，多半是缩进或名字不匹配。也可以用 [网络检查思路](/blog/clash-for-windows-network-check/) 逐项排除。

小提醒：直接在 `profiles` 里改，订阅一更新就被覆盖。稳妥做法是复制一份改名，或使用软件里的配置合并能力，而不是硬改原文件。

## 常见问题

**Q1：改了 yaml 之后软件提示解析失败，怎么办？**

九成是缩进问题。检查是否用了 Tab、冒号后面有没有空格、列表项 `-` 后是否留了空格。可以先用在线 YAML 校验器过一遍，再回填。

**Q2：策略组里写了节点名，界面却不显示？**

名字必须和 `proxies` 里的 `name` 完全一致，包括空格和大小写。多一个空格都算不同名字。

**Q3：规则写了却没生效？**

先看顺序，是不是前面的兜底规则提前命中了；再看模式是不是「规则模式」，全局模式下所有流量都走同一个出口，规则不参与。

**Q4：手机上有官方版吗？**

没有。Clash for Windows 只有 Windows 桌面端，不存在官方手机版。安卓和 iOS 需要用各自的客户端，具体可看 [安卓使用说明](/blog/clash-for-windows-android-guide/)。

读懂这四块，你就不再是「点下拉框的人」，而是能自己决定流量走向的人。
