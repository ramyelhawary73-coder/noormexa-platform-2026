export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NOORMEXA — Refinement 6</title>
<style>
*{box-sizing:border-box}html,body{margin:0;padding:0}body{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#eef2f7;color:#0b1f33}
main{max-width:1280px;margin:auto;padding:44px 28px 72px}.eyebrow{font-size:12px;font-weight:800;letter-spacing:.22em;color:#9b6b1d;text-transform:uppercase}.title{font-size:34px;margin:10px 0 8px}.lead{color:#637086;max-width:760px;line-height:1.7}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:32px}.card{border-radius:28px;padding:34px;min-height:275px;display:flex;flex-direction:column;justify-content:center;border:1px solid rgba(15,23,42,.09);box-shadow:0 20px 55px rgba(15,23,42,.08)}.light{background:#fff}.dark{background:#07111f}.card img{width:100%;height:auto}.label{margin-top:20px;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#8a97aa}.dark .label{color:#9eabc0}
.system{margin-top:22px;background:#fff;border-radius:28px;padding:30px;border:1px solid rgba(15,23,42,.09)}.symbols{display:flex;gap:28px;align-items:end;flex-wrap:wrap;margin-top:22px}.sample{display:flex;flex-direction:column;align-items:center;gap:10px;font-size:12px;color:#7a8799}.icon{display:flex;align-items:center;justify-content:center;background:#07111f;border-radius:24%;box-shadow:0 14px 30px rgba(7,17,31,.18)}.icon img{width:70%;height:70%}.mono{color:#0b1f33;background:#f6f8fb}.mono img{width:70%;height:70%}.sizes{display:flex;gap:26px;align-items:center;flex-wrap:wrap;margin-top:26px;padding-top:26px;border-top:1px solid #e6ebf1}.sizes img{display:block}
.note{margin-top:26px;padding:18px 20px;border-radius:18px;background:#fff8e8;border:1px solid #f0d79b;color:#725219;line-height:1.6}
@media(max-width:800px){.grid{grid-template-columns:1fr}.title{font-size:27px}.card{padding:22px;min-height:220px}}
</style>
</head>
<body>
<main>
<div class="eyebrow">Master identity review</div>
<h1 class="title">NOORMEXA Vector Brand System — Refinement 6</h1>
<p class="lead">Uncached review route. No Navbar, PWA prompt, favicon, manifest, or production branding is rendered on this page.</p>
<div class="grid">
<section class="card light"><img src="/brand/review/noormexa-master-light.svg?v=refine-6-route" alt="NOORMEXA light master logo"><div class="label">Light master lockup</div></section>
<section class="card dark"><img src="/brand/review/noormexa-master-dark.svg?v=refine-6-route" alt="NOORMEXA dark master logo"><div class="label">Dark master lockup</div></section>
</div>
<section class="system">
<div class="eyebrow">Symbol system</div>
<div class="symbols">
<div class="sample"><div class="icon" style="width:128px;height:128px"><img src="/brand/review/noormexa-master-symbol-large.svg?v=refine-6-route" alt=""></div><span>128 px / flagship</span></div>
<div class="sample"><div class="icon" style="width:80px;height:80px"><img src="/brand/review/noormexa-master-symbol.svg?v=refine-6-route" alt=""></div><span>80 px</span></div>
<div class="sample"><div class="icon" style="width:48px;height:48px;border-radius:12px"><img src="/brand/review/noormexa-master-symbol.svg?v=refine-6-route" alt=""></div><span>48 px</span></div>
<div class="sample"><div class="icon" style="width:24px;height:24px;border-radius:7px"><img src="/brand/review/noormexa-master-symbol.svg?v=refine-6-route" alt=""></div><span>24 px</span></div>
<div class="sample"><div class="mono" style="width:80px;height:80px;display:flex;align-items:center;justify-content:center;border-radius:18px"><img src="/brand/review/noormexa-master-mono.svg?v=refine-6-route" alt=""></div><span>Monochrome</span></div>
</div>
<div class="sizes">
<div class="sample"><img src="/brand/review/noormexa-master-light.svg?v=refine-6-route" width="410" alt=""><span>Large lockup</span></div>
<div class="sample"><img src="/brand/review/noormexa-master-light-compact.svg?v=refine-6-route" width="270" alt=""><span>Header scale</span></div>
<div class="sample"><img src="/brand/review/noormexa-master-light-compact.svg?v=refine-6-route" width="190" alt=""><span>Compact scale</span></div>
</div>
</section>
<div class="note"><strong>Review gate:</strong> this page is isolated. Nothing here is connected to the live Navbar or PWA yet.</div>
</main>
</body>
</html>`;

export async function GET() {
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
