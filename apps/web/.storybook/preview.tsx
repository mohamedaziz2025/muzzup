import type { Preview } from "@storybook/react";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "abyss",
      values: [{ name: "abyss", value: "#050A1E" }],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark min-h-screen bg-abyss p-8 font-body text-primary">
        <Story />
      </div>
    ),
  ],
};

export default preview;
