import "./globals.css";

export const metadata = {
  title: "Coonect Game",
  description: "A multiplayer grid-based game",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
