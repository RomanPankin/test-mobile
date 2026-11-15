import { router, Stack, useLocalSearchParams } from "expo-router";

import { CategoryMenu } from "../../components/CategoryMenu";
import { FailedView, LoadingView } from "../../components/StateView";
import { useCatalogue } from "../../lib/useCatalogue";

/**
 * A category opened from the home screen, with the strip to switch to another. A switch changes
 * this screen's category rather than stacking another: Back still returns home.
 */
export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { status, catalogue, retry } = useCatalogue();

  if (status === "loading") return <LoadingView />;
  if (status === "failed") return <FailedView onRetry={retry} />;

  const category = catalogue.categories.find((item) => item.id === id);

  return (
    <>
      <Stack.Screen options={{ title: category?.name ?? "" }} />
      <CategoryMenu
        catalogue={catalogue}
        selected={id}
        onSelect={(next) => router.setParams({ id: next })}
      />
    </>
  );
}
