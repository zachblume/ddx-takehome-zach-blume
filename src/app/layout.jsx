import "./globals.css";

export const metadata = {
    title: "DDX takehome - Zach Blume's solution",
    description: "DDX takehome - Zach Blume's solution",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <title>DDX takehome - Zach Blume's solution</title>
            </head>
            <body>{children}</body>
        </html>
    );
}
