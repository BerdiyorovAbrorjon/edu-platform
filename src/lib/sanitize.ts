import sanitize from "sanitize-html";

export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4",
      "ul", "ol", "li", "blockquote", "code", "pre",
      "a", "img", "iframe", "hr", "mark", "span", "div",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen"],
      span: ["class", "style"],
      div: ["class", "style"],
      "*": [],
    },
    allowedIframeHostnames: ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com"],
    allowedStyles: {
      span: { "text-align": [/.*/] },
      div: { "text-align": [/.*/] },
      p: { "text-align": [/.*/] },
      h1: { "text-align": [/.*/] },
      h2: { "text-align": [/.*/] },
      h3: { "text-align": [/.*/] },
    },
  });
}
