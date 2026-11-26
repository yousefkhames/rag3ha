const R=require("./docs/parser.js"),a=require("assert");
let p=R.parse("Thanks for your order!\nOrder #114-5557\nOrder date: 2026-11-20\nItem: Sony headphones WH-1000\nTotal: $249.99\nYou can return within 30 days of delivery","orders@amazon.com");
a.equal(p.store,"amazon");a.equal(p.purchased,"2026-11-20");a.equal(p.windowDays,30);a.equal(p.amount,"$249.99");a.equal(p.item,"Sony headphones WH-1000");
a.equal(R.deadline("2026-11-20",30),"2026-12-20");
p=R.parse("تم الطلب بتاريخ 3/11/2026 الإجمالي: ٤٥٠ ج.م ... استرجاع خلال ١٤ يوم","noon");a.equal(p.windowDays,14);a.equal(p.purchased,"2026-11-03");
a.equal(R.daysLeft("2026-12-20",new Date(2026,10,26)),24);
p=R.parse("Order on December 5, 2026 total 10","x@zara.com");a.equal(p.purchased,"2026-12-05");a.equal(p.windowDays,30);
assert=0;console.log("ok");
