import {h, render} from "vue";
import MYSVG from "@/assets/icon/favicon.svg";

export function changeFavicon() {
    const SVGComponent = MYSVG;
    const container = document.createElement('div');
    render(h(SVGComponent), container);

    const svgElement = container.innerHTML;
    const svgEncoded = encodeURIComponent(svgElement)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');

    const link = document.getElementById('favicon');
    if (link instanceof HTMLLinkElement) {
        link.href = `data:image/svg+xml,${svgEncoded}`;
    }
}


