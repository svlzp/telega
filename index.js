const Telegraf = require('telegraf');
const Markup = require("telegraf/markup");
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");
const { keyboard, removeKeyboard, urlButton } = require('telegraf/markup');
const BOT_TOKEN ='';
console.log('start');
const bot = new Telegraf(BOT_TOKEN)

bot.start(ctx => {
  ctx.reply(
    `Привет ${ctx.from.first_name},я калькулятор растаможки “євроблях” по з/п №3704-Д і 4643-Д?`,
    Markup.inlineKeyboard([
      Markup.callbackButton("рассчитать стоимость растаможки", "Calculate")
    ]).extra()
  );
});
const Calculate = new WizardScene(
  "Calculate",
  ctx => {
    ctx.reply("введите год выпуска автомобиля",
    Markup.keyboard([
      ['2021 - 2012', '2006 - 1995'],
      ['2011','2010','2009','2008','2007']
    ]
    ) 
    .resize()
    .extra()
    );
    return ctx.wizard.next();
  },
  ctx => {
    try{

    ctx.wizard.state.year = ctx.message.text; 
    ctx.reply(
      "введите объем двигателя в см3",Markup.keyboard()
     .removeKeyboard(true)
      .extra()
    );
    return ctx.wizard.next();
  } 
 catch{
   console.error();
 return;
  }
  },
  ctx=>{
   try{
    if (ctx.message.text.length < 3  ||  ctx.message.text.length > 4 || !/^[0-9]+$/.test(ctx.message.text) ) {
      ctx.reply('вы ввели неправильный объем попробуйте ещё раз');
      return; 
      }
    ctx.wizard.state.ve = ctx.message.text; 
    ctx.reply(
      "введите тип топлива двигателя",
      Markup.keyboard([
        ['Бензин', 'Дизель']
      ])
      .resize()
      
      .extra()
    );
    return ctx.wizard.next();
   }
   catch{
     console.error();
     return;
   }
  },
  ctx => {

    try{
 
   const c = ctx.message.text; 
   const b = ctx.wizard.state.ve
   const a = ctx.wizard.state.year;
    let type;
    let year;
    let ve;
    let define = 250;
   switch (a) {
    case '2021 - 2012':
      year = 0;
        break;
    case '2011':
      year = 25;
        break;
    case  '2010':
      year = 50;
        break;
    case '2009':
      year = 75;
        break;
    case '2008':
      year = 100;
        break;
        case '2007':
      year = 125;
        break;
        case '2006 - 1995':
      year = 150;
        break;
        default:
        return false;
}
switch (true) {
  case b <= 2000:
      ve = 0.25;
      break;
  case b > 2000 && b <= 3000:
      ve = 0.2;
      break;
  case b > 3000 && b <= 4000:
      ve = 0.25;
      break;
  case b > 4000 && b <= 5000:
      ve = 0.35;
      break;
  case b > 5000:
      ve = 0.5;
      break;
  default:
      return false;
}
switch (c) {
  case  "Бензин":
    type = 0;
      break;
  case "Дизель":
    type = 100;
      break;
      default:
        return false;
    }
      let motor = Math.round(ve * b);
      let calc = year + motor + type;
      let nds = Math.round(calc / 6);
      let result = calc + nds + define;
   console.log(result)

    let h = { year, motor, type, nds, define, result } 
    let html = ` Ставка за год ${year} €
Ставка за объем двигателя ${motor} €
Ставка за тип топлива ${type} €
Добровольный взнос ${define} €
ПДВ ${nds} €
итого ${result} €
Бесплатная консультация :
Подготовка документов к растаможке»
(снятие с учёта , договор купли продажи)
тел. 0685221109 `

  ctx.reply(html
     , Markup.inlineKeyboard([
      Markup.urlButton("консультация","https://t.me/westauto_ua" ),
      Markup.callbackButton("НАЗАД","Calculate")
   ]).extra() )
   
  return ctx.scene.leave();
  }
  catch{
    console.error();
    return ctx.scene.leave();
  }
}
); 
const stage = new Stage();
stage.register(Calculate);
bot.use(session());
bot.use(stage.middleware());
bot.action("Calculate", (ctx) => ctx.scene.enter("Calculate"));
bot.launch();
