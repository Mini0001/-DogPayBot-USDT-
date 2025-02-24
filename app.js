// 此机器人为调用狗盾钱包API来检测付款是否成功逻辑
// 狗盾钱包 (@DogPayBot) 需要去申请一个key，否则你使用我的key用户支付成功的话余额就到我狗盾钱包余额中了
// 安装必要库 npm i telegraf axios qrcode 或直接输入 npm install 安装

const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const QRCode = require('qrcode');

const bot = new Telegraf('6558147138:AAErS8VhidL63MzUcmw31i0sJvo4bfeWakw'); //机器人的TOKEN

const debug_pay = {};
const API_KEY = '576d42ae6bad48fd948674bbcca1208e'; // 替换为你自己的密钥 (@DogPayBot) 需要去申请一个key
const PAYMENT_ADDRESS = 'TN7PMwr1v17rKPTgXYb8QUdfRhTeDM62eL'; // 此USDT地址不能更改必须使用狗盾钱包的充值地址否则无法监听是否支付成功
const PAYMENT_AMOUNT = 1; // 用户需要支付的金额

bot.start(async (ctx) => {
    try {
      const uid = ctx.from.id;
  
      const qr_code = PAYMENT_ADDRESS;
      const qrcode_buffer = await QRCode.toBuffer(qr_code, { type: 'png' });
  
      const initialMessage = `<b>⚠️ 请核实转账地址 ⚠️</b>\n👉 <code>${PAYMENT_ADDRESS}</code>\n\n<b>请支付</b> <code>${PAYMENT_AMOUNT}</code> <b>USDT，不要多转也不要少转，请复制金额！(支付金额即为实际到账金额)</b>\n`;
      const cancel_button = Markup.inlineKeyboard([
        [Markup.button.callback("❌ 取消订单", "cancel_order")],
      ]);
  
      const sentMessage = await ctx.replyWithPhoto({ source: qrcode_buffer }, {
        caption: `${initialMessage}\n\n<b>⏳ 订单剩余</b> <code>15:00</code> <b>分钟后自动取消</b>`,
        parse_mode: "HTML",
        reply_markup: cancel_button.reply_markup,
      });
  
      debug_pay[uid] = {
        orderId: sentMessage.message_id,
        time: 15 * 60,
      };
  
      const interval = setInterval(() => {
        if (!debug_pay[uid]) {
          clearInterval(interval);
          return;
        }
  
        debug_pay[uid].time -= 3;
  
        const minutes = Math.floor(debug_pay[uid].time / 60);
        const seconds = debug_pay[uid].time % 60;
        const remainingTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  
        ctx.telegram.editMessageCaption(
          ctx.chat.id,
          debug_pay[uid].orderId,
          null,
          `${initialMessage}\n\n<b>⏳ 订单剩余</b> <code>${remainingTime}</code> <b>分钟后自动取消</b>`,
          { parse_mode: 'HTML', reply_markup: cancel_button.reply_markup }
        );
  
        if (debug_pay[uid].time <= 0) {
          clearInterval(interval);
        }
      }, 3000);
  
      const checkPayment = setInterval(async () => {
        try {
          const response = await axios.get(`https://pay.obsdx.pw/api`, {
            params: { key: API_KEY, money: PAYMENT_AMOUNT }
          });
          if (response.data.success) {
            clearInterval(checkPayment);
            clearInterval(interval);

            // 这里可以写自己的逻辑 比如调用你自己的API给支付成功的用户UID加积分或者加余额等操作都是可以的
            ctx.reply("支付成功！感谢您的支持");
            ctx.reply(`UID: ${uid}\n\n卡密: 123456789`);
            delete debug_pay[uid];
          }
        } catch (error) {
        // 如果出现请求狗盾API错误的时候比如状态码为403那么就去狗盾钱包将服务器IP加入白名单即可
          console.error("错误", error);
        }
      }, 3000);
  
      debug_pay[uid].intervalId = interval;
      debug_pay[uid].checkPaymentId = checkPayment;
    } catch (error) {
      console.error("错误", error);
    }
  });
  


  bot.action('cancel_order', async (ctx) => {
   try {
     const uid = ctx.from.id;
     if (debug_pay[uid]) {
       clearInterval(debug_pay[uid].intervalId);
  
       await ctx.telegram.deleteMessage(ctx.chat.id, debug_pay[uid].orderId);
       delete debug_pay[uid];
       ctx.reply("订单已取消成功");
     }
   } catch (error) {
    
   }
 });

bot.launch();
