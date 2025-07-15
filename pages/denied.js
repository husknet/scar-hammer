// pages/denied.js
import { useRouter } from 'next/router';

export default function Denied() {
  const router = useRouter();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', textAlign: 'center',
      padding: '1rem'
    }}>
      <h1>Access Blocked 🚫</h1>
      <p>We detected suspicious activity (VPN, proxy, or bot traffic).<br/>
         Please turn off your VPN or proxy, then retry.</p>
      <button
        onClick={() => router.reload()}
        style={{
          marginTop: '1rem', padding: '0.5rem 1rem',
          fontSize: '1rem', cursor: 'pointer'
        }}
      >
        Retry
      </button>
    </div>
  );
}
