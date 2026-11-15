import { useState } from "react";

import { CategoryMenu } from "../../components/CategoryMenu";
import { FailedView, LoadingView } from "../../components/StateView";
import { useCatalogue } from "../../lib/useCatalogue";

/** The Shop tab: every category, the one tapped here (else the first) opened. */
export default function ShopScreen() {
  const { status, catalogue, retry } = useCatalogue();
  const [chosen, setChosen] = useState<string | null>(null);

  if (status === "loading") return <LoadingView />;
  if (status === "failed") return <FailedView onRetry={retry} />;

  return (
    <CategoryMenu
      catalogue={catalogue}
      selected={chosen ?? catalogue.categories[0]?.id}
      onSelect={setChosen}
    />
  );
}
