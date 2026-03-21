import { withGTConfig } from "gt-next/config";

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	serverExternalPackages: ["pino", "pino-pretty"],
};

export default withGTConfig(nextConfig);
