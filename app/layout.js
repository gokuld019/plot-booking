import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata = {
  title: "Plot Booking",
  description: "Plot booking software for real estate builders",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}