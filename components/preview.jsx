"use client";

import { useEffect, useState } from "react";

const allowedTags = new Set([
  "A", "B", "BLOCKQUOTE", "BR", "DIV", "EM", "H2", "H3", "H4",
  "I", "LI", "OL", "P", "SPAN", "STRONG", "U", "UL",
]);

function sanitizeRichText(value) {
  if (!value || typeof window === "undefined") return "";

  const documentNode = new DOMParser().parseFromString(value, "text/html");

  for (const element of [...documentNode.body.querySelectorAll("*")]) {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...element.childNodes);
      continue;
    }

    for (const attribute of [...element.attributes]) {
      const isSafeLink =
        element.tagName === "A" &&
        attribute.name === "href" &&
        /^(https?:|mailto:)/i.test(attribute.value);

      if (!isSafeLink) element.removeAttribute(attribute.name);
    }

    if (element.tagName === "A") {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    }
  }

  return documentNode.body.innerHTML;
}

export const Preview = ({ value, className = "" }) => {
  const [sanitizedValue, setSanitizedValue] = useState("");

  useEffect(() => {
    setSanitizedValue(sanitizeRichText(value));
  }, [value]);

  return (
    <div
      className={`text-sm leading-7 [&_a]:text-sky-600 [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_h2]:my-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:my-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h4]:my-2 [&_h4]:text-lg [&_h4]:font-semibold [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedValue }}
    />
  );
};
