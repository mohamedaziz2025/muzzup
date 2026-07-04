import type { Meta, StoryObj } from "@storybook/react";
import { LockedFinancial } from "./locked-financial";

const meta: Meta<typeof LockedFinancial> = {
  title: "UI/LockedFinancial",
  component: LockedFinancial,
  args: { label: "Chiffre d'affaires annuel", previewValue: "184 320 €" },
};
export default meta;

export const Default: StoryObj<typeof LockedFinancial> = {};
