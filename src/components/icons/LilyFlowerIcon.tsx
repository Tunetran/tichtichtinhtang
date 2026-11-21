export function LilyFlowerIcon({ className = 'w-7 h-7 text-white' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cánh hoa trung tâm vươn thẳng */}
      <path
        d="M24 9C21 15 19 23 24 35C29 23 27 15 24 9Z"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.14"
      />
      {/* Gân chính cánh hoa trung tâm */}
      <path
        d="M24 12V33"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="1 2.5"
      />
      {/* Cánh hoa uốn lượn bên trái */}
      <path
        d="M24 35C21 27 10 23 7.5 15.5C12.5 15.5 18 19.5 22 28"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cánh hoa uốn lượn bên phải */}
      <path
        d="M24 35C27 27 38 23 40.5 15.5C35.5 15.5 30 19.5 26 28"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Đài hoa & cánh phụ phía sau bên trái */}
      <path
        d="M23 33C17 29 11 28 8 26C11 23 18 24 21 28"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.8"
      />
      {/* Đài hoa & cánh phụ phía sau bên phải */}
      <path
        d="M25 33C31 29 37 28 40 26C37 23 30 24 27 28"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.8"
      />
      {/* Nhụy hoa thanh mảnh ở giữa */}
      <path
        d="M24 27V17"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="24" cy="15.5" r="1.3" fill="currentColor" />
      {/* Nhụy hoa nghiêng trái */}
      <path
        d="M23 27C21 23 18 20 16 18"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="15.5" cy="17.5" r="1.1" fill="currentColor" />
      {/* Nhụy hoa nghiêng phải */}
      <path
        d="M25 27C27 23 30 20 32 18"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="32.5" cy="17.5" r="1.1" fill="currentColor" />
      {/* Cuống hoa thắt nhẹ ở gốc */}
      <path
        d="M22 36C23 37.5 25 37.5 26 36"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
