import {
  deleteCustomerAddress,
  getCustomerAddresses,
  type PublicCustomerAddress,
} from "@estoreclub/app";
import { useEffect, useState } from "react";

import { t } from "../../lib/strings";

import { SavedList } from "./SavedList";

/**
 * Where the shop delivers this customer's orders - the addresses used at checkout, the last used
 * first. Added on the payment page, removed here; a list that cannot be read is left out, as
 * the account still works without it.
 */
export function AddressesSection() {
  const [addresses, setAddresses] = useState<PublicCustomerAddress[] | null>(
    null,
  );

  useEffect(() => {
    getCustomerAddresses().then(
      (answer) => setAddresses(answer.data),
      () => {},
    );
  }, []);

  return (
    <SavedList
      confirmTitle={t("account.removeAddress")}
      empty={t("account.noAddresses")}
      items={
        addresses?.map((address) => ({
          id: address.customerAddressId,
          title: address.address,
          ...(address.details ? { detail: address.details } : {}),
        })) ?? null
      }
      text={t("account.addressesText")}
      title={t("account.addresses")}
      onRemove={(id) => {
        void deleteCustomerAddress({ customerAddressId: id }).then(
          () =>
            setAddresses((was) =>
              (was ?? []).filter((item) => item.customerAddressId !== id),
            ),
          () => {},
        );
      }}
    />
  );
}
