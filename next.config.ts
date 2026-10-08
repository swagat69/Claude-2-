import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  redirects() {
    return [
      // Part 2a was first published here before the component docs split into Forms / Feedback / Cards.
      { source: "/design-system/components", destination: "/design-system/forms", permanent: false },
    ];
  },
};

export default nextConfig;
