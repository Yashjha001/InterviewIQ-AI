import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>InterviewIQ AI</h1>
      <p>Welcome to the starter frontend structure.</p>
      <nav>
        <Link href="/login">Login</Link> | <Link href="/dashboard">Dashboard</Link>
      </nav>
    </main>
  );
}
