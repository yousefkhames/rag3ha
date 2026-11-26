const R=require("./docs/parser.js"),a=require("assert");
let p=R.parse("Thanks for your order!\nOrder #114-5557\nOrder date: 2026-11-20\nItem: Sony headphones WH-1000\nTotal: $249.99\nYou can return within 30 days of delivery","orders@amazon.com");
a.equal(p.store,"amazon");a.equal(p.purchased,"2026-11-20");a.equal(p.windowDays,30);a.equal(p.amount,"$249.99");a.equal(p.item,"Sony headphones WH-1000");
a.equal(R.deadline("2026-11-20",30),"2026-12-20");
p=R.parse("تم الطلب بتاريخ 3/11/2026 الإجمالي: ٤٥٠ ج.م ... استرجاع خلال ١٤ يوم","noon");a.equal(p.windowDays,14);a.equal(p.purchased,"2026-11-03");
a.equal(R.daysLeft("2026-12-20",new Date(2026,10,26)),24);
p=R.parse("Order on December 5, 2026 total 10","x@zara.com");a.equal(p.purchased,"2026-12-05");a.equal(p.windowDays,30);
p=R.parse("Order date: 2026-11-01\nDelivered on: 2026-11-05\nTotal: EGP 1,299.00","orders@amazon.eg");a.equal(p.purchased,"2026-11-05");a.equal(p.windowDays,15);a.equal(p.amount,"EGP 1,299.00");
p=R.parse("Your B.TECH order 2026-11-02","no-reply@btech.com");a.ok(p.store=="btech"||p.store=="other");
console.log("ok");
// regression tests (round 2 review)
{const P=(s,f)=>R.parse(s,f||"");
a.equal(P("Order date: 2026-13-45 total: 5").purchased,"");               // impossible date is not rolled over
a.equal(P("Ordered 31/02/2026").purchased,"");
a.equal(P("Order date: 2026-02-30 and delivered 2026-03-04").purchased,"2026-03-04");
a.equal(P("we have an extra large size. Order date: 2026-11-02").store,"other");
a.equal(P("rhythm shoes 2026-11-02").store,"other");
a.equal(P("Order 2026-11-02","orders@extra.com").store,"extra");
a.equal(P("Order 2026-11-02\nSubtotal: $10\nShipping: $2\nTotal: $12").amount,"$12");
a.equal(P("Order confirmation\nOrder date: 2026-11-02").order,"");        // a word is not an order number
a.equal(P("Order #114-5557781 date 2026-11-02").order,"114-5557781");
a.equal(P("تم الشراء في ٢٠٢٦-١١-٠٢ الإجمالي ٩٩ جنيه").purchased,"2026-11-02");
a.equal(P("تم الشراء في ٢٠٢٦-١١-٠٢ الإجمالي ٩٩ جنيه").amount,"99 جنيه");
a.equal(R.deadline("2026-12-25",15),"2027-01-09");
}
console.log("ok regression");
