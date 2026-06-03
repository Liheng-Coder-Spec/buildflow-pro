import * as React from "react";

export interface SEOOptions {
  title?: string;
  description?: string;
}

const DEFAULT_SUFFIX = "BuildTrack";

export function useSEO({ title, description }: SEOOptions) {
  React.useEffect(() => {
    if (title) {
      document.title = title.includes(DEFAULT_SUFFIX) ? title : `${title} · ${DEFAULT_SUFFIX}`;
    }
    if (description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
  }, [title, description]);
}

export default useSEO;
