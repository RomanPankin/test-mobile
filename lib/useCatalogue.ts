import { useCallback, useEffect, useState } from "react";

import { loadCatalogue, loadedCatalogue, type Catalogue } from "./catalogue";

type State =
  | { status: "loading"; catalogue: null }
  | { status: "failed"; catalogue: null }
  | { status: "ready"; catalogue: Catalogue };

/** The catalogue for a screen: drawn at once when a screen before it has read it already. */
export function useCatalogue(): State & { retry: () => void } {
  const [state, setState] = useState<State>(() => {
    const catalogue = loadedCatalogue();

    return catalogue
      ? { status: "ready", catalogue }
      : { status: "loading", catalogue: null };
  });

  const retry = useCallback(() => {
    setState({ status: "loading", catalogue: null });
    loadCatalogue().then(
      (catalogue) => setState({ status: "ready", catalogue }),
      () => setState({ status: "failed", catalogue: null }),
    );
  }, []);

  useEffect(() => {
    if (!loadedCatalogue()) retry();
  }, [retry]);

  return { ...state, retry };
}
