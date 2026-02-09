export const metadata = {
  metadataBase: new URL('https://kingsleyabebe.org'),
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}