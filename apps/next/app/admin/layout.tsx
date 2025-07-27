import AdminLayout from './components/AdminLayout';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
   <AdminLayout>
    {children}
   </AdminLayout>
  );
}