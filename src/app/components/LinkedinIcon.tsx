export default function LinkedInIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
    >
      <rect x="2" y="2" width="20" height="20" rx="2" fill="#000" />
      <path
        d="M7.2 8.8h-2.4v8.5h2.4V8.8Zm-.1-4.1a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8ZM18.7 13.2c0-2.7-1.4-4.1-3.6-4.1-1.6 0-2.3.9-2.7 1.5V8.8H10v8.5h2.4v-4.4c0-1.2.7-2 1.8-2s1.8.7 1.8 2v4.4h2.7v-4.6Z"
        fill="#fff"
      />
    </svg>
  );
}
