/** @type {import('next').NextConfig} */

const nextConfig = {
	reactStrictMode: true,
	domains: ["https://oaidalleapiprodscus.blob.core.windows.net"],
	webpack: (config) => {
	  config.externals.push(
		"pino-pretty",
		"lokijs",
		"encoding"
	  );
	return config;
  }}