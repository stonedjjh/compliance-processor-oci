import { useEffect } from "react";

const ensureMetaTag = (name: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name=\"${name}\"]`);
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }
  return element;
};

interface PageMetadata {
  title?: string;
  description?: string;
  keywords?: string;
}

const usePageMetadata = ({ title, description, keywords }: PageMetadata) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    if (description) {
      const descriptionTag = ensureMetaTag("description");
      descriptionTag.content = description;
    }

    if (keywords) {
      const keywordsTag = ensureMetaTag("keywords");
      keywordsTag.content = keywords;
    }
  }, [title, description, keywords]);
};

export default usePageMetadata;
