# 狗盾钱包付款检测机器人

此机器人通过调用狗盾钱包API，检测用户是否已完成付款。

## 环境配置

1. 安装必要的依赖：
   ```bash
   npm install
   ```

2. 替换密钥（API_KEY）：
   ```js
   const API_KEY = '你的狗盾钱包API密钥';
   ```
   > **注意：** 此密钥需要通过 [@DogPayBot](https://t.me/DogPayBot) 申请。  
   > **重要：** 不要使用别人的密钥，否则用户支付的金额将进入别人的狗盾钱包余额中。

3. 设置付款地址和金额：
   ```js
   const PAYMENT_ADDRESS = 'TN7PMwr1v17rKPTgXYb8QUdfRhTeDM62eL'; 
   const PAYMENT_AMOUNT = 1;
   ```
   > **特别注意：**  
   > - 此USDT地址为狗盾钱包提供的充值地址，不能更改，否则无法监听支付状态。  
   > - 支付金额需根据你的业务需求设置，例如 `$1 USDT`。

---

通过以上简单的配置，你即可使用此机器人检测用户付款情况。
