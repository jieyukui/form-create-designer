/**
 * @param {{ title: string, desc: string, products: Array<{title:string, href:string, desc:string, variant?:string}> }} options
 */
export function renderViewBox({title, desc, products}) {
    const items = products.map((p) => {
        const cls = p.variant ? `_fd-view-product ${p.variant}` : '_fd-view-product';
        return `        <a class="${cls}" href="${p.href}" target="_blank">
            <div><div>${p.title}</div><span>立即体验</span></div> <span>${p.desc}</span>
        </a>`;
    }).join('\n');

    return `<div class="_fd-view-box">
  <div class="title">${title}</div>
  <div class="desc">${desc}</div>
<div class="_fd-view-products">
${items}
    </div>
</div>`;
}
