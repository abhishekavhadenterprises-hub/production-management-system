import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-[#F5F5F7] text-[#1D1D1F] antialiased selection:bg-[#007AFF] selection:text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
