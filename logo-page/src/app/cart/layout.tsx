export default function LayoutCart({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <main className="flex-1 p-6 bg-gray-50 ">{children}</main>
    </div>
  );
}
